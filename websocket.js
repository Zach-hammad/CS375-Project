var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);

const port = 3000;
const hostname = "localhost";

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

app.ws("/", (ws, req) => {
	ws.on("message", (msg) => {
		console.log(msg);
	});
	console.log("socket", req.testing);
});

app.listen(port, hostname, () => {
	console.log(`Listening at: http://${hostname}:${port}`);
});
