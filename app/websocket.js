module.exports = (app) => {
	const lobbies = {};

	app.ws("/:lobbyCode", (ws, req) => {
		const dateTime = new Date();
		const lobbyCode = parseInt(req.params.lobbyCode, 10);

		if (Number.isInteger(lobbyCode)) {
			if (!lobbies[lobbyCode]) {
				lobbies[lobbyCode] = [];
			}

			lobbies[lobbyCode].push(ws);
			console.log(`@${dateTime.toLocaleString()}: New client connected to lobby <${lobbyCode}>. Total clients in this lobby: ${lobbies[lobbyCode].length}`);

			function broadcastMessage(message) {
				lobbies[lobbyCode].forEach((client) => {
					if (client.readyState === client.OPEN) {
						client.send(message);
					}
				});
			}

			ws.on("message", (message) => {
				const dateTime = new Date();

				broadcastMessage(message);
				console.log(`@${dateTime.toLocaleString()}: Received message in lobby <${lobbyCode}>: "${message}"`);
			});

			ws.on("close", () => {
				const dateTime = new Date();
				const index = lobbies[lobbyCode].indexOf(ws);

				console.log(`@${dateTime.toLocaleString()}: Client disconnected from lobby <${lobbyCode}>`);

				if (index !== -1) {
					lobbies[lobbyCode].splice(index, 1);
				}

				console.log(`@${dateTime.toLocaleString()}: Total clients in lobby <${lobbyCode}>: ${lobbies[lobbyCode].length}`);

				if (lobbies[lobbyCode].length === 0) {
					delete lobbies[lobbyCode];
					console.log(`@${dateTime.toLocaleString()}: Lobby <${lobbyCode}> closed.`);
				}
			});
		} else {
			ws.close(400, "Invalid lobby code.");
		}
	});
};
