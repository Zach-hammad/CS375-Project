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

		if (lobbyCode) {
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
