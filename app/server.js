let express = require("express");
let http = require("http");
let { Server } = require("socket.io");

let app = express();
let server = http.createServer(app);
let io = new Server(server);

let port = 3000;
let host;

app.use(express.json());
app.use(express.static("public"));

let { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

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
//console.log(JSON.stringify(process.env, null, 2));
//console.log(JSON.stringify(databaseConfig, null, 2));

let pool = new Pool(databaseConfig);

pool.connect().then(() => {
	console.log("Connected to db");
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "login.html"));
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

app.post('/save-nickname', async (req, res) => {
    const { ethAddress, nickname, balance } = req.body;

    // Validate and parse inputs
    const parsedBalance = parseFloat(balance);
    if (!ethAddress || !nickname || isNaN(parsedBalance)) {
        console.error('Invalid input data:', { ethAddress, nickname, balance });
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO users (eth_address, nickname, balance) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (eth_address) 
             DO UPDATE SET nickname = $2, balance = $3 
             RETURNING *`,
            [ethAddress, nickname, parsedBalance]
        );

        // Set the 'loggedIn' cookie upon successful login
        res.cookie('loggedIn', true, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error saving nickname and balance:', error.stack);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.get('/api/check-login-status', (req, res) => {
    if (req.cookies.loggedIn) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get("/get-nickname/:ethAddress", async (req, res) => {
	const { ethAddress } = req.params;
	try {
		const result = await pool.query("SELECT nickname FROM users WHERE eth_address = $1", [ethAddress]);
		if (result.rows.length > 0) {
			res.json(result.rows[0]);
		} else {
			res.status(404).json({ error: "Nickname not found" });
		}
	} catch (error) {
		console.error("Error retrieving nickname:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
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

require("./websocket")(app, io);

server.listen(port, host, () => {
	console.log(`http://${host}:${port}`);
});
