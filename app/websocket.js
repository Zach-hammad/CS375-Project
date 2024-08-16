let express = require('express');
let expressWs = require('express-ws');
let blackjack = require('./public/blackjack');

let app = express();
expressWs(app);

let turn = "";

async function handlePlayerTurns(players, deck) {
	for (const playerKey of Object.keys(players)) {
	  const player = players[playerKey];
  
	  console.log(player);
  
	  turn = playerKey; // Set the current player's turn
  
	  // Wait for 30 seconds before proceeding to the next player
	  await new Promise(resolve => setTimeout(() => {
		turn = ""; 
		resolve();
	  }, 10000));
	}
  }

module.exports = (app) => {
	const lobbies = {};

	app.ws("/:lobbyCode", (ws, req) => {
		const dateTime = new Date();
		const lobbyCode = parseInt(req.params.lobbyCode, 10);

		if (Number.isInteger(lobbyCode)) {
			if (!lobbies[lobbyCode]) {
				lobbies[lobbyCode] = [];
				lobbies[lobbyCode].game = {dealer: blackjack.initDealer(), players: {"me": blackjack.initPlayer("me", 500)}, deck: blackjack.shuffle(1)};
			}
			else{
				// call function with users own information
				lobbies[lobbyCode].game.players.push({"you ": blackjack.initPlayer("you", 500)});
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
			let players = lobbies[lobbyCode].game["players"];
			let deck = lobbies[lobbyCode].game.deck;
			let dealer = lobbies[lobbyCode].game["dealer"];
			try {
				let parsedMessage;
				try {
					parsedMessage = JSON.parse(message);
				} catch (e) {
					parsedMessage = { type: 'text', data: message };
				}
				
				if (parsedMessage.type === 'ready') {
					const { playerName, status} = parsedMessage.data;
					let ready = true;
					players[playerName].ready = status;
					//checks if all players are ready
					Object.keys(players).forEach(player => {
						if (players[player].ready !== "ready") ready = false;
					  });

					//starts the game by init dealer and player hands, sends all player hands to clients
					if(ready){
						dealer = blackjack.dealerHand(dealer, deck);
						Object.keys(players).forEach(player => {
							blackjack.newHand(players[player], deck);
						  });
						handlePlayerTurns(players, deck).then(() => {
						  console.log('All players have had their turn.');
						});
						broadcastMessage(JSON.stringify({ type: 'start', message: {players: players, dealer: dealer} }));
					}
					//console.log("Game state:", JSON.stringify(lobbies[lobbyCode].game, null, 2));

					// send game object to each client
					// client will display all hands, and set dealer, player to their own game based on name
					// on each player's move, only sends own hand back to server, and updates
					// server sends full game to clients again
					// sends message when done, checks to see if all hands are done, goes back to wait state

				} else if (parsedMessage.type === 'text') {
					const dateTime = new Date();
					broadcastMessage(JSON.stringify({ type: 'text', message: message }));
					console.log(`@${dateTime.toLocaleString()}: Received message in lobby <${lobbyCode}>: "${message}"`);
				} else if (parsedMessage.type === 'card') {
					let card = deck.pop();
					broadcastMessage(JSON.stringify({ type: 'card', message: card}));
				} else if (parsedMessage.type === 'bet') {
					const { playerName, bet} = parsedMessage.data;
					players[playerName].balance -= bet;
					players[playerName].bet += bet;
					console.log(parsedMessage.data);
					console.log(players[playerName]);
				} else if (parsedMessage.type === 'win') {
					const { playerName, betWon } = parsedMessage.data;
					players[playerName].balance += betWon;
					players[playerName].win += betWon;
					console.log(parsedMessage.data);
					console.log(players[playerName]);
				} else if (parsedMessage.type === 'hand') {
					const { playerName, hand } = parsedMessage.data;
					console.log(hand);
					players[playerName].hands = hand;
				}
				else if (parsedMessage.type === 'done') {
					let done = true;
					const { playerName, status } = parsedMessage.data;
					players[playerName].done = status;
					Object.keys(players).forEach(player => {
						if (players[player].done !== "done") done = false;
					  });
					if(done){
						blackjack.endDealer(dealer, deck)
						broadcastMessage(JSON.stringify({ type: 'done', message: dealer}));
						lobbies[lobbyCode].game["dealer"] = new blackjack.initDealer(deck);
						Object.keys(players).forEach(player => {
						curBalance = players[player].balance;
						players[player] = blackjack.initPlayer("me", curBalance);
					  });

					}
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
