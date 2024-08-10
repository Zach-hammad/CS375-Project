let express = require("express");
let app = express();
app.use(express.json());
app.use(express.static("app/public"));
let expressWs = require("express-ws")(app);

let { Pool } = require("pg");

let port = 8080;
let host;
let databaseConfig;

// make this script's dir the cwd
// b/c npm run start doesn't cd into src/ to run this
// and if we aren't in its cwd, all relative paths will break
process.chdir(__dirname);

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

// uncomment these to debug
// console.log(JSON.stringify(process.env, null, 2));
// console.log(JSON.stringify(databaseConfig, null, 2));

let pool = new Pool(databaseConfig);
pool.connect().then(() => {
	console.log("Connected to db");
});

app.post("/datum", (req, res) => {
	let { datum } = req.body;
	if (datum === undefined) {
		return res.status(400).send({});
	}
	pool.query("INSERT INTO foo (datum) VALUES ($1)", [datum])
		.then((result) => {
			return res.send({});
		})
		.catch((error) => {
			console.log(error);
			return res.status(500).send({});
		});
});

app.get("/data", (req, res) => {
	pool.query("SELECT * FROM foo")
		.then((result) => {
			return res.send({ data: result.rows });
		})
		.catch((error) => {
			console.log(error);
			return res.status(500).send({ data: [] });
		});
});

require("./websocket")(app);

app.listen(port, host, () => {
	console.log(`http://${host}:${port}`);
	console.log(`Websocket server(s) running on: ws://${host}:${port}/:lobbyCode`);
});
