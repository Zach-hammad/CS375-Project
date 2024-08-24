let express = require("express");
let http = require("http");
let { Server } = require("socket.io");

let app = express();
let server = http.createServer(app);
let io = new Server(server);

let host = "localhost";
let port = 3000;

app.use(express.static("public"));
app.use(express.json());

let blackjack = require('./public/blackjack');

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
  
io.on("connection", (socket) => {
	console.log(`Socket ${socket.id} connected`);

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
	if (!rooms[roomId].hasOwnProperty('game')){
		rooms[roomId].game = {dealer: blackjack.initDealer(), players: {"me": blackjack.initPlayer("me", 500, socket.id)}, deck: blackjack.shuffle(1)};
	} else {
		rooms[roomId].game.players["you"] = blackjack.initPlayer("you", 500, socket.id);
	}
	//console.log(JSON.stringify(rooms[roomId].game));

	let players = rooms[roomId].game.players;
	let deck = rooms[roomId].game.deck;
	let dealer = rooms[roomId].game.dealer;



	/* MUST REGISTER socket.on(event) listener FOR EVERY event CLIENT CAN SEND */

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

		for (let otherSocket of Object.values(rooms[roomId])) {
			if (otherSocket.id === socket.id) {
				continue;
			}

			console.log(`Sending message ${message} to socket ${otherSocket.id}`);
			otherSocket.emit("relay", messageData);
		}
	});

	socket.on("playerReady" ,(message) => {
		//message [0] = id, message[1] = name
		let ready = true;
		players[message[1]].status= "ready";
		players[message[1]].id= message[0];

		Object.keys(players).forEach(player => {
			if (players[player].status !== "ready") ready = false;
		  });

		if(ready){
			dealer = blackjack.dealerHand(dealer, deck);
			Object.keys(players).forEach(player => {
				blackjack.newHand(players[player], deck);
				});
			handlePlayerTurns(players, deck).then(() => {
				console.log('All players have had their turn.');
			});

			for (let sockets of Object.values(rooms[roomId])) {
				console.log(`Sending message ${message} to socket ${sockets.id}`);
				if(sockets.emit) sockets.emit("playerData", [players, dealer]);
			}
		}
	});
	socket.on("askForCard" ,(message) => {
		let socketId = message[0]
		io.to(socketId).emit("card", deck.pop());
	});
	socket.on("bet" ,(message) => {
		let bet = message[0];
		let playerName = message[1];
		players[playerName].balance -= bet;
		players[playerName].bet += bet;
		console.log(players);
	});
	socket.on("win" ,(message) => {
		let win = message[0];
		let playerName = message[1];
		players[playerName].balance += win;
		players[playerName].win += win;
		console.log(players);
	});	
	socket.on("hand" ,(message) => {
		let playerName = message[0];
		let cards = message[1];
		players[playerName].cards = cards;
		console.log(cards);
	});
	socket.on("done" ,(message) => {
		let done = true;
		let playerName = message[1];
		console.log(players[playerName]);
		players[playerName].status = "done";
		Object.keys(players).forEach(player => {
			if (players[player].status !== "done") done = false;
		  });
		if(done){
			blackjack.endDealer(dealer, deck);

			for (let sockets of Object.values(rooms[roomId])) {
				if(sockets.emit) sockets.emit("end", dealer);
			}

			rooms[roomId].game.dealer = new blackjack.initDealer(deck);
				Object.keys(players).forEach(player => {
				curBalance = players[player].balance;
				console.log(players[player].cards);
				players[player] = blackjack.initPlayer("me", curBalance, message[0]);
			});
		}
		  });
});

server.listen(port, host, () => {
	console.log(`http://${host}:${port}`);
});
