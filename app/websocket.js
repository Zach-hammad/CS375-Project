module.exports = (app, io) => {
	let blackjack = require("./public/blackjack");

	// global object to hold socket objects; structure is:
	// {[roomId]: {[socketId]: [...socket objects...]}}
	let rooms = {};

	function generateRoomCode() {
		let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let result = "";

		for (let i = 0; i < 5; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}

		return result;
	}

	// for debugging
	function printRooms() {
		for (let [roomId, sockets] of Object.entries(rooms)) {
			console.log(roomId);

			for (let [socketId, socket] of Object.entries(sockets)) {
				console.log(`\t${socketId}`);
			}
		}
	}

	// create "room" ie lobby
	app.post("/create", (req, res) => {
		let roomId = generateRoomCode();

		rooms[roomId] = {};

		return res.json({ roomId });
	});

	// check for preexising "room" ie lobby
	app.get("/checkRoomId/:roomId", (req, res) => {
		const roomId = req.params.roomId;

		rooms[roomId] ? res.sendStatus(200) : res.sendStatus(404);
	});

	app.get("/room/:roomId", (req, res) => {
		let { roomId } = req.params;

		if (!rooms.hasOwnProperty(roomId)) {
			return res.status(404).send();
		}

		console.log("Sending room", roomId);
		// could also use server-side rendering to create the HTML
		// that way, we could embed the room code
		// and existing chat messages in the generated HTML
		// but the client can also get the roomId from the URL
		// and use Ajax to request the messages on load
		res.sendFile("public/room.html", { root: __dirname });
	});

	// if you need to do things like associate a socket with a logged in user, see
	// https://socket.io/how-to/deal-with-cookies
	// to see how you can fetch application cookies from the socket

	io.on("connection", (socket) => {
		console.log(`Socket ${socket.id} connected`);
		socket.on('create-lobby', (roomId, callback) => {
			if (rooms.hasOwnProperty(roomId)) {
				return callback({ error: 'Lobby already exists.' });
			}
	
			// Create a new room/lobby
			rooms[roomId] = {
				game: { 
					dealer: blackjack.initDealer(), 
					players: {}, 
					deck: blackjack.shuffle(1) 
				}
			};
			console.log(`Lobby ${roomId} created.`);
        	callback({ success: true });
		});
	

		// extract room ID from URL
		// could also send a separate registration event to register a socket to a room
		// might want to do that ^ b/c not all browsers include referer, I think
		let url = socket.handshake.headers.referer;
		let pathParts = url.split("/");
		let roomId = pathParts[pathParts.length - 1];

		console.log(pathParts, roomId);

		// room doesn't exist - this should never happen, but jic
		if (!rooms.hasOwnProperty(roomId)) {
			return;
		}

		// add socket object to room so other sockets in same room can send messages to it later
		rooms[roomId][socket.id] = socket;

		//initialize in lobby
		
		if (!rooms[roomId].hasOwnProperty("game")) {
			rooms[roomId].game = { dealer: blackjack.initDealer(), players: {}, deck: blackjack.shuffle(1) };
		} 
		//console.log(JSON.stringify(rooms[roomId].game));
		let players = rooms[roomId].game.players;
		let deck = rooms[roomId].game.deck;
		let dealer = rooms[roomId].game.dealer;

		socket.on("disconnect", () => {
			// disconnects are normal; close tab, refresh, browser freezes inactive tab, ...
			// want to clean up global object, or else we'll have a memory leak
			// WARNING: sockets don't always send disconnect events
			// so you may want to periodically clean up your room object for old socket ids
			console.log(`Socket ${socket.id} disconnected`);
			delete rooms[roomId][socket.id];
		});

		socket.on("message", ({ message }) => {
			// we still have a reference to the roomId defined above
			// b/c this function is defined inside the outer function
			console.log(`Socket ${socket.id} sent message: "${message}" | Lobby: ${roomId}`);
			console.log("Broadcasting message to other sockets");

			const messageData = {
				socketId: socket.id,
				message,
			};
			console.log(message);

			// this would send the message to all other sockets
			// but we want to only send it to other sockets in this room
			// socket.broadcast.emit("message", message);

			// here
			for (let [key, otherSocket] of Object.entries(rooms[roomId])) {
				if (key === "game" || typeof otherSocket.emit !== "function") {
					continue;
				}

				if (otherSocket.id === socket.id) {
					continue;
				}

				console.log(`Sending message ${message} to socket ${otherSocket.id}`);
				otherSocket.emit("relay", messageData);
			}
		});
		socket.on("update", ({ message }) => {
			console.log(message);
			const name = message[0];
			const update = message[1];

			console.log(message);
			for (let [key, otherSocket] of Object.entries(rooms[roomId])) {
				if (key === "game" || typeof otherSocket.emit !== "function") {
					continue;
				}

				if (otherSocket.id === socket.id) {
					continue;
				}

				console.log(`Sending message ${message} to socket ${otherSocket.id}`);
				otherSocket.emit("update", [name,update]);
			}
		});

		socket.on("join", (message) => {
			let playerName = message[0];
			rooms[roomId].game.players[playerName] = blackjack.initPlayer(playerName, 500);
			console.log(playerName + " init hand");
			console.log(rooms[roomId].game);
		});

		

		socket.on("playerReady", async (message) => {
			let ready = true;
			players[message[0]].status = "ready";


			Object.keys(players).forEach((player) => {
				if (players[player].status !== "ready") ready = false;
			});

			if (ready) {
				dealer = blackjack.dealerHand(dealer, deck);
				Object.keys(players).forEach((player) => {
					blackjack.newHand(players[player], deck);
				});

				for (let sockets of Object.values(rooms[roomId])) {
					console.log(`Sending message ${message} to socket ${sockets.id}`);
					if (sockets.emit) sockets.emit("playerData", [players, dealer]);
				}
			}
		});
		socket.on("askForCard", (message) => {
			socket.emit("card", deck.pop());
		});
		socket.on("bet", (message) => {
			let bet = message[0];
			let playerName = message[1];
			players[playerName].balance -= bet;
			players[playerName].bet += bet;
			console.log(players);
		});
		socket.on("win", (message) => {
			let win = message[0];
			let playerName = message[1];
			players[playerName].balance += win;
			players[playerName].win += win;
			console.log(players);
		});
		socket.on("hand", (message) => {
			let playerName = message[0];
			let cards = message[1];
			players[playerName].cards = cards;
			console.log(cards);
		});
		socket.on("done", (message) => {
			let done = true;
			let playerName = message[1];
			console.log(players[playerName]);
			players[playerName].status = "done";
			Object.keys(players).forEach((player) => {
				if (players[player].status !== "done") done = false;
			});
			if (done) {
				blackjack.endDealer(dealer, deck);

				for (let sockets of Object.values(rooms[roomId])) {
					if (sockets.emit) sockets.emit("end", dealer);
				}

				rooms[roomId].game.dealer = new blackjack.initDealer(deck);
				Object.keys(players).forEach((player) => {
					curBalance = players[player].balance;
					console.log(players[player].cards);
					players[player] = blackjack.initPlayer(player, curBalance, message[0]);
				});
			}
		});
		socket.on('win', async ([betWon, playerName]) => {
			try {
				// Assuming you have a function to insert into the database
				await pool.query(
					'INSERT INTO winnings (nickname, balance, date) VALUES ($1, $2, $3)',
					[playerName, betWon, new Date()]
				);
				console.log('Winnings updated in database:', { nickname: playerName, balance: betWon });
			} catch (error) {
				console.error('Error updating winnings:', error);
			}
		});
	});
		
};
