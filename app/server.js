let express = require("express");
let http = require("http");
let { Server } = require("socket.io");
let cookieParser = require('cookie-parser');

let app = express();
let server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: "https://csblackjack.fly.dev",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let port = 3000;
let host;

app.use(express.json());
app.use(express.static("public"));

let { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
app.use(cookieParser());


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

app.post('/save-nickname', (req, res) => {
    const ethAddress = req.cookies.ethAddress;
    const { nickname, balance } = req.body;

    if (!ethAddress) {
        return res.status(400).json({ error: 'Ethereum address not found in cookies' });
    }

    // Save the nickname and balance using the ethAddress from the cookie
    pool.query(
        `INSERT INTO users (eth_address, nickname, balance) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (eth_address) 
         DO UPDATE SET nickname = $2, balance = $3 
         RETURNING *`,
        [ethAddress, nickname, balance],
        (error, result) => {
            if (error) {
                console.error('Error saving nickname and balance:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json(result.rows[0]);
        }
    );
});



app.get('/api/check-login-status', (req, res) => {
    res.json({ loggedIn: !!req.cookies.loggedIn });
});

app.get('/api/get-user-data', async (req, res) => {
    const ethAddress = req.cookies.ethAddress; // Assuming ethAddress is stored in cookies

    if (!ethAddress) {
        return res.status(400).json({ error: 'User not logged in' });
    }

    try {
        const result = await pool.query("SELECT nickname, balance FROM users WHERE eth_address = $1", [ethAddress]);
        if (result.rows.length > 0) {
            res.json({
                nickname: result.rows[0].nickname,
                balance: result.rows[0].balance
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
        return next(new Error('Authentication error: No cookies provided.'));
    }

    const cookies = require('cookie').parse(cookieHeader);
    const ethAddress = cookies.ethAddress;

    if (ethAddress) {
        socket.ethAddress = ethAddress; // Attach ethAddress to socket object for further use
        next();
    } else {
        next(new Error('Authentication error: Invalid cookie.'));
    }
});
// Endpoint to handle balance withdrawal
app.post('/api/withdraw', async (req, res) => {
    const ethAddress = req.cookies.ethAddress; // Get the Ethereum address from the cookies
    const { amount } = req.body;

    // Validate request
    if (!ethAddress) {
        return res.status(400).json({ error: 'User not authenticated' });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    try {
        // Fetch the user's current balance
        const userResult = await pool.query("SELECT balance FROM users WHERE eth_address = $1", [ethAddress]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentBalance = userResult.rows[0].balance;

        // Check if the user has sufficient balance
        if (amount > currentBalance) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Update the user's balance
        const newBalance = currentBalance - amount;
        await pool.query("UPDATE users SET balance = $1 WHERE eth_address = $2", [newBalance, ethAddress]);

        // Respond with success
        res.json({ message: `Successfully withdrew ${amount}. New balance is ${newBalance}.` });
    } catch (error) {
        console.error('Error updating balance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Endpoint to get player winnings
app.get('/api/winnings', async (req, res) => {
    try {
        const result = await pool.query('SELECT nickname, balance, date FROM winnings ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching winnings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


require("./websocket")(app, io);

server.listen(port, host, () => {
	console.log(`http://${host}:${port}`);
});
