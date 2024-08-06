module.exports = (app) => {
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
			const dateTime = new Date();

			console.log(`@${dateTime.toLocaleString()}: Received message: ${msg}`);
			// Echo the message back to the client
			ws.send(`Server received: ${msg}`);
		});

		ws.on("close", () => {
			console.log("Client disconnected");
		});
	});
};
