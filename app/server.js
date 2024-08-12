let express = require("express");
let { Pool } = require("pg");
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// make this script's dir the cwd
// b/c npm run start doesn't cd into src/ to run this
// and if we aren't in its cwd, all relative paths will break
process.chdir(__dirname);

let port = 8080;
let host;
let databaseConfig;


// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
if (process.env.NODE_ENV == "production") {
	host = "0.0.0.0";
	databaseConfig = { connectionString: process.env.DATABASE_URL };
} else {
	host = "localhost";
	let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
	databaseConfig = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}
console.log(databaseConfig);

let app = express();
app.use(express.json());
app.use(express.static("public"));

// uncomment these to debug
// console.log(JSON.stringify(process.env, null, 2));
// console.log(JSON.stringify(databaseConfig, null, 2));

let pool = new Pool(databaseConfig);

pool.connect().then(() => {
	console.log("Connected to db");
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post("/datum", (req, res) => {
	let { datum } = req.body;
	if (datum === undefined) {
		return res.status(400).send({});
	}
	pool.query("INSERT INTO foo (datum) VALUES ($1)", [datum]).then(result => {
		return res.send({});
	}).catch(error => {
		console.log(error);
		return res.status(500).send({});
	})
});
app.post('/save-nickname', async (req, res) => {
	const { ethAddress, nickname } = req.body;
	try {
	  const result = await pool.query(
		'INSERT INTO users (eth_address, nickname) VALUES ($1, $2) ON CONFLICT (eth_address) DO UPDATE SET nickname = $2 RETURNING *',
		[ethAddress, nickname]
	  );
	  res.json(result.rows[0]);
	} catch (error) {
	  console.error('Error saving nickname:', error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  });

  app.get('/get-nickname/:ethAddress', async (req, res) => {
	const { ethAddress } = req.params;
	try {
	  const result = await pool.query('SELECT nickname FROM users WHERE eth_address = $1', [ethAddress]);
	  if (result.rows.length > 0) {
		res.json(result.rows[0]);
	  } else {
		res.status(404).json({ error: 'Nickname not found' });
	  }
	} catch (error) {
	  console.error('Error retrieving nickname:', error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  });

app.get("/data", (req, res) => {
	pool.query("SELECT * FROM foo").then(result => {
		return res.send({data: result.rows});
	}).catch(error => {
		console.log(error);
		return res.status(500).send({data: []});
	})
})

app.listen(port, host, () => {
	console.log(`http://${host}:${port}`);
});
