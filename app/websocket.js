module.exports = (app) => {
	const clients = [];

	// defines middleware for every incoming request
	app.use((req, res, next) => {
		// adds a property called "testing" to the request object, making it available in any subsequent handler
		// currently testing with just the url
		req.testing = `you're on ${req.url}`;

		// makes server continue processing the request by moving on to the next handler
		return next();
	});

	app.ws("/echo", (ws, req) => {
		const dateTime = new Date();

		function broadcastMessage(message) {
			clients.forEach((client) => {
				if (client.readyState === client.OPEN) {
					client.send(message);
				}
			});
		}

		clients.push(ws);
		console.log(`@${dateTime.toLocaleString()}: New client connected. Total clients: ${clients.length}`);

		ws.on("message", (message) => {
			const dateTime = new Date();

			console.log(`@${dateTime.toLocaleString()}: Received message: ${message}`);
			broadcastMessage(message);
		});

		ws.on("close", () => {
			console.log("Client disconnected");

			const index = clients.indexOf(ws);

			if (index !== -1) {
				clients.splice(index, 1);
			}

			console.log(`Total clients: ${clients.length}`);
		});
	});
};
