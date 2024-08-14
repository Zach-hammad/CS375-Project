let express = require('express');
let expressWs = require('express-ws');
let blackjack = require('./public/blackjack');

let app = express();
expressWs(app);

module.exports = (app) => {
	const lobbies = {};

	app.ws("/:lobbyCode", (ws, req) => {
		const dateTime = new Date();
		const lobbyCode = parseInt(req.params.lobbyCode, 10);

		if (Number.isInteger(lobbyCode)) {
			if (!lobbies[lobbyCode]) {
				lobbies[lobbyCode] = [];
				lobbies[lobbyCode].game = {dealer: blackjack.initDealer(), players: [blackjack.initPlayer("me", 500)], deck: blackjack.shuffle(1)};
			}
			else{
				// call function with users own information
				lobbies[lobbyCode].game.players.push(blackjack.initPlayer("you", 500));
			}

			lobbies[lobbyCode].push(ws);
			console.log(`@${dateTime.toLocaleString()}: New client connected to lobby <${lobbyCode}>. Total clients in this lobby: ${lobbies[lobbyCode].length}`);
			//console.log("Game state:", JSON.stringify(lobbies[lobbyCode].game, null, 2));

			function broadcastMessage(message) {
				lobbies[lobbyCode].forEach((client) => {
					if (client.readyState === client.OPEN) {
						client.send(message);
					}
				});
			}

		ws.on('message', (message) => {
			try {
				let parsedMessage;
				try {
					parsedMessage = JSON.parse(message);
				} catch (e) {
					parsedMessage = { type: 'text', data: message };
				}
				
				// add handlers for bet incoming

				if (parsedMessage.type === 'ready') {
					const { playerName, status } = parsedMessage.data;
					
					for (let i = 0; i < lobbies[lobbyCode].game["players"].length; i++){
						if (lobbies[lobbyCode].game["players"][i].name === playerName) {
							lobbies[lobbyCode].game["players"][i].ready = status;
						console.log(`Player ${playerName} is now ${status}`);
						}}
					for (let i = 0; i < lobbies[lobbyCode].game.players.length; i++){
						if (lobbies[lobbyCode].game["players"][i].ready === "ready"){
							lobbies[lobbyCode].game["dealer"]= blackjack.dealerHand(lobbies[lobbyCode].game.dealer, lobbies[lobbyCode].game.deck);
							// add functionality to update each players starting hands
							broadcastMessage(JSON.stringify({ type: 'hand', message: lobbies[lobbyCode].game }));
						}
					}
					console.log("Game state:", JSON.stringify(lobbies[lobbyCode].game, null, 2));

					// send game object to each client
					// client will display all hands, and set dealer, player to their own game based on name
					// on each player's move, only sends own hand back to server, and updates
					// server sends full game to clients again
					// sends message when done, checks to see if all hands are done, goes back to wait state

					broadcastMessage(JSON.stringify({ type: 'update', message: `Player ${playerName} is ${status}` }));
				} else if (parsedMessage.type === 'text') {
					const dateTime = new Date();
					broadcastMessage(message);
					console.log(`@${dateTime.toLocaleString()}: Received message in lobby <${lobbyCode}>: "${message}"`);
				} else if (parsedMessage.type === 'hand') {
					console.log(parsedMessage);
				}
			} catch (e) {
				console.error('Error handling message:', e);
			}
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
