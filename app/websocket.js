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

  async function initializePlayer() {
    const ethAddress = window.localStorage.getItem('userETHaddress');

    if (!ethAddress) {
        console.error('No Ethereum address found in localStorage.');
        return;
    }

    try {
        // Fetch user data from the server
        const response = await fetch(`/get-user?ethAddress=${ethAddress}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data.');
        }
        
        const userData = await response.json();
        
        // Initialize the player with the fetched data
        player = new initPlayer(userData.nickname, userData.balance);
        console.log('Player initialized:', player);
    } catch (error) {
        console.error('Error initializing player:', error);
    }
}

module.exports = (app) => {
	const lobbies = {};

	function generateLobbyCode() {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let result = "";

		for (let i = 0; i < 4; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}

	app.post("/create", (req, res) => {
		const lobbyCode = generateLobbyCode();
		lobbies[lobbyCode] = [];

		res.json({ lobbyCode });
	});

	app.get("/check/:lobbyCode", (req, res) => {
		const lobbyCode = req.params.lobbyCode;

		lobbies[lobbyCode] ? res.sendStatus(200) : res.sendStatus(404);
	});

	app.ws("/:lobbyCode", (ws, req) => {
		const dateTime = new Date();
		const lobbyCode = req.params.lobbyCode;
		const ethAddress = window.localStorage.getItem('userETHAddress');
		ws.send(JSON.stringify({data: {ethAddress}, type: "joinLobby"}));

		console.log(players);
		if (lobbyCode) {
			if (!lobbies[lobbyCode]) {
				lobbies[lobbyCode] = [];
				lobbies[lobbyCode].game = {dealer: blackjack.initDealer(), deck: blackjack.shuffle(6)};
			}
				// call function with users own information
				lobbies[lobbyCode].game.players.push({"you": blackjack.initPlayer("you", 500)});


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

			if(deck.length < 52){
				deck = blackjack.shuffle(6);
			}

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
					players[playerName].cards = hand;
				}
				else if (parsedMessage.type === 'done') {
					let done = true;
					const { playerName, status } = parsedMessage.data;
					players[playerName].done = status;
					Object.keys(players).forEach(player => {
						if (players[player].done !== "done") done = false;
					  });
					  console.log(players[playerName]);
					if(done){
						blackjack.endDealer(dealer, deck);
						broadcastMessage(JSON.stringify({ type: 'done', message: dealer}));
						lobbies[lobbyCode].game["dealer"] = new blackjack.initDealer(deck);
						Object.keys(players).forEach(player => {
						curBalance = players[player].balance;
						console.log(players[player].cards);
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

// module.exports = (app, io) => {
// 	// global object to hold socket objects; structure is:
// 	// {[roomId]: {[socketId]: [...socket objects...]}}
// 	let rooms = {};
// 	// can also use socket.io's rooms functionality
// 	// instead of manually maintaining an object of rooms
// 	// https://socket.io/docs/v3/rooms/

// 	function generateRoomCode() {
// 		let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// 		let result = "";
// 		for (let i = 0; i < 4; i++) {
// 			result += characters.charAt(Math.floor(Math.random() * characters.length));
// 		}
// 		return result;
// 	}

// 	// for debugging
// 	function printRooms() {
// 		for (let [roomId, sockets] of Object.entries(rooms)) {
// 			console.log(roomId);
// 			for (let [socketId, socket] of Object.entries(sockets)) {
// 				console.log(`\t${socketId}`);
// 			}
// 		}
// 	}

// 	app.post("/create", (req, res) => {
// 		let roomId = generateRoomCode();
// 		rooms[roomId] = {};
// 		return res.json({ roomId });
// 	});

// 	app.get("/room/:roomId", (req, res) => {
// 		let { roomId } = req.params;
// 		if (!rooms.hasOwnProperty(roomId)) {
// 			return res.status(404).send();
// 		}
// 		console.log("Sending room", roomId);
// 		// could also use server-side rendering to create the HTML
// 		// that way, we could embed the room code
// 		// and existing chat messages in the generated HTML
// 		// but the client can also get the roomId from the URL
// 		// and use Ajax to request the messages on load
// 		res.sendFile("public/room.html", { root: __dirname });
// 	});

// 	// if you need to do things like associate a socket with a logged in user, see
// 	// https://socket.io/how-to/deal-with-cookies
// 	// to see how you can fetch application cookies from the socket

// 	io.on("connection", (socket) => {
// 		console.log(`Socket ${socket.id} connected`);

// 		// extract room ID from URL
// 		// could also send a separate registration event to register a socket to a room
// 		// might want to do that ^ b/c not all browsers include referer, I think
// 		let url = socket.handshake.headers.referer;
// 		let pathParts = url.split("/");
// 		let roomId = pathParts[pathParts.length - 1];
// 		console.log(pathParts, roomId);

// 		// room doesn't exist - this should never happen, but jic
// 		if (!rooms.hasOwnProperty(roomId)) {
// 			return;
// 		}

// 		// add socket object to room so other sockets in same room
// 		// can send messages to it later
// 		rooms[roomId][socket.id] = socket;

// 		/* MUST REGISTER socket.on(event) listener FOR EVERY event CLIENT CAN SEND */

// 		socket.on("disconnect", () => {
// 			// disconnects are normal; close tab, refresh, browser freezes inactive tab, ...
// 			// want to clean up global object, or else we'll have a memory leak
// 			// WARNING: sockets don't always send disconnect events
// 			// so you may want to periodically clean up your room object for old socket ids
// 			console.log(`Socket ${socket.id} disconnected`);
// 			delete rooms[roomId][socket.id];
// 		});

// 		socket.on("foo", ({ message }) => {
// 			// we still have a reference to the roomId defined above
// 			// b/c this function is defined inside the outer function
// 			console.log(`Socket ${socket.id} sent message: ${message}, ${roomId}`);
// 			console.log("Broadcasting message to other sockets");

// 			// this would send the message to all other sockets
// 			// but we want to only send it to other sockets in this room
// 			// socket.broadcast.emit("message", message);

// 			for (let otherSocket of Object.values(rooms[roomId])) {
// 				// don't need to send same message back to socket
// 				// socket.broadcast.emit automatically skips current socket
// 				// but since we're doing this manually, we need to do it ourselves
// 				if (otherSocket.id === socket.id) {
// 					continue;
// 				}
// 				console.log(`Sending message ${message} to socket ${otherSocket.id}`);
// 				otherSocket.emit("bar", message);
// 			}
// 		});

// 		socket.on("hello", (data) => {
// 			console.log(data);
// 		});
// 	});
// };
