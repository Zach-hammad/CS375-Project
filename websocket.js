const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);

const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));

// defines middleware for every incoming request
app.use((req, res, next) => {
	// adds a property called "testing" to the request object, making it available in any subsequent handler
	// currently testing with just the url
	req.testing = `you're on ${req.url}`;

	// makes server continue processing the request by moving on to the next handler
	return next();
});

app.get("/hello", (req, res, next) => {
	console.log("get route", req.testing);

	res.send(req.testing).end();
});

app.ws("/echo", (ws, req) => {
	ws.on("message", (msg) => {
		console.log(`Received message: ${msg}`);
		// Echo the message back to the client
		ws.send(`Server received: ${msg}`);
	});

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});

app.listen(port, hostname, () => {
	console.log(`Websocket server running on: ws://${hostname}:${port}/echo`);
});
