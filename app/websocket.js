let blackjack = require("./public/blackjack");

module.exports = (app, io, pool) => {
	

	// global object to hold socket objects; structure is:
	// {[roomId]: {[socketId]: [...socket objects...]}}
	let rooms = new Map()

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

	function createRoom() {
		const roomId = generateRoomCode();
		if (!rooms.has(roomID)){
			rooms.set(roomId, {
				sockets: new Map(),
				game: {
					dealer: blackjack.initDealer(),
					players: new Map(),
					deck: blackjack.shuffle(1),
				},
			});
			return roomId;
		}
		return createRoom();
	}

	function deleteRoomIfEmpty(roomId){
		const room = rooms.get(roomId);
		if (room && room.sockets.size === 0) {
			rooms.delete(roomId);
			console.log('Room ${roomId} has been deleted due to inactivity.');
		}
	}

	// create "room" ie lobby
	app.post("/create", (req, res) => {
		try {
			const roomId = createRoom();
			res.json({ roomId });
		} catch (error) {
			console.error("Error Creating Room:",error);
			res.status(500).json({ error: 'Internal Server Error'});
		}
	});

	// check for preexising "room" ie lobby
	app.get("/checkRoomId/:roomId", (req, res) => {
		const roomId = req.params.roomId;
		rooms.has(roomId) ? res.sendStatus(200) : res.sendStatus(404);
	});

	app.get("/room/:roomId", (req, res) => {
		const { roomId } = req.params;
		if (!rooms.has(roomId)) {
			return res.status(404).send("Room not Found");
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
		socket.on('joinRoom', async ({roomId, nickname}, callback) => {
			try{
				if (!rooms.has(roomId)){
					return callback({ error: "Room DNE"});
				}
				socket.join(roomId);

				const room = rooms.get(roomId);
				room.sockets.set(socket.id, socket);

				const player = blackjack.initPlayer(nickname,500);
				room.game.player.set(nickname, player);

				socket.roomId = roomId;
				socket.nickname = nickname;

				console.log("Player ${nickname} joined room ${roomId}");
				callback({ success: true })
			} catch (error) {
				console.error("Error joining room:", error);
				this.callback({ error: 'Internal Server Error' })
			}
		});

		socket.on('message', ({ message }, callback) => {
            try {
                const { roomId, nickname } = socket;
                if (!roomId || !nickname) {
                    return callback({ error: 'Not joined in any room' });
                }

                console.log(`Message from ${nickname} in room ${roomId}: ${message}`);

                // Broadcast the message to other clients in the room
                socket.to(roomId).emit('message', { nickname, message });
                callback({ success: true });
            } catch (error) {
                console.error('Error handling message:', error);
                callback({ error: 'Internal Server Error' });
            }
        });
		socket.on("playerReady", (data) => {
			try {
				const playerName = data[0];
				const { roomId } = socket;
				if (!roomId || !playerName){
					return;
				}

				const room = rooms.get(roomId);
				const player = room.game.players.get(nickname);
				player.status = 'ready';

				const allReady = [...room.game.players.values()].every(
					(p) => p.status ===  'ready'
				);

				if (allReady){
					room.game.dealer = blackjack.dealerHand(room.game.dealer, room.game.deck);
					room.game.players.forEach((p) =>{
						blackjack.newHand(p, room.game.deck);
					});
					const playersData = {};
					room.game.players.forEach((p, name) => {
						playersData[name]=p;
					});
					io.in(roomId).emit('playerData', [playersData, room.game.dealer]);
				}
			} catch (error) {
				console.error('Error handling playerReady:', error);
			}
		});

		socket.on("askForCard", (data) => {
			try {
                const socketId = data[0];
                const playerName = data[1];
                const { roomId } = socket;
                if (!roomId || !playerName) {
                    return;
                }

                const room = rooms.get(roomId);
                const player = room.game.players.get(playerName);

                const card = room.game.deck.pop();
                player.cards.push(card);

                // Send card to the requesting client
                socket.emit('card', card);
            } catch (error) {
                console.error('Error handling askForCard:', error);
            }
		});
		socket.on("bet", (data) => {
			try {
				let bet = data[0];
			let playerName = data[1];
			const { roomId } = socket;
            if (!roomId || !playerName) {
                return;
            }

			const room = rooms.get(roomId);
            const player = room.game.players.get(playerName);

			if (betAmount <= 0 || betAmount > player.balance) {
				return; // Or send an error back
			}

			players[playerName].balance -= bet;
			players[playerName].bet += bet;
			socket.emit('betPlaced', { balance: player.balance });
            } catch (error) {
                console.error('Error handling bet:', error);
            }
		});

		socket.on('win', async (data) => {
            try {
                const betWon = data[0];
                const playerName = data[1];
                // Update database
                await pool.query(
                    'INSERT INTO winnings (nickname, balance, date) VALUES ($1, $2, $3)',
                    [playerName, betWon, new Date()]
                );
                console.log('Winnings updated in database:', { nickname: playerName, balance: betWon });
            } catch (error) {
                console.error('Error updating winnings:', error);
            }
        });
		socket.on('hand', (data) => {
            try {
                const playerName = data[0];
                const cards = data[1];
                const { roomId } = socket;
                if (!roomId || !playerName) {
                    return;
                }

                const room = rooms.get(roomId);
                const player = room.game.players.get(playerName);

                player.cards = cards;
            } catch (error) {
                console.error('Error handling hand:', error);
            }
        });
		socket.on('done', (data) => {
            try {
                const playerName = data[0];
                const { roomId } = socket;
                if (!roomId || !playerName) {
                    return;
                }
                const room = rooms.get(roomId);
                const player = room.game.players.get(playerName);
                player.status = 'done';

                // Check if all players are done
                const allDone = [...room.game.players.values()].every(
                    (p) => p.status === 'done'
                );

                if (allDone) {
                    // Dealer plays
                    blackjack.endDealer(room.game.dealer, room.game.deck);

                    // Send 'end' event to all clients with dealer data
                    io.in(roomId).emit('end', room.game.dealer);

                    // Determine winners and update balances
                    room.game.players.forEach((p) => {
                        const result = blackjack.determineWinner(p, room.game.dealer);
                        // Update balances based on result
                        if (result === 'win') {
                            p.balance += p.bet * 2;
                            // Optionally update database
                        } else if (result === 'push') {
                            p.balance += p.bet;
                        }
                        // No action needed for 'lose'
                    });

                    // Reset game state for next round
                    room.game.dealer = blackjack.initDealer();
                    room.game.deck = blackjack.shuffle(1);
                    room.game.players.forEach((p) => {
                        p.status = 'waiting';
                        p.bet = 0;
                        p.cards = [];
                    });
                }
            } catch (error) {
                console.error('Error handling done:', error);
            }
        });
		socket.on('update', (data) => {
            try {
                const playerName = data[0];
                const update = data[1];
                const { roomId } = socket;
                if (!roomId || !playerName) {
                    return;
                }

                // Broadcast update to other clients in the room
                socket.to(roomId).emit('update', [playerName, update]);
            } catch (error) {
                console.error('Error handling update:', error);
            }
        });
		socket.on("disconnect", () => {
			console.log('Socket ${socket.id} disconnected');
			const { roomId, nickname } = socket;
			if (roomId && rooms.has(roomId)){
				const room = rooms.get(roomId);
				room.sockets.delete(socket.id)
				room.game.player.delete(nickname);

				socket.to(roomId).emit('playerLeft', { nickname });

				if (room.sockets.size === 0){
					rooms.delete(roomId);
					console.log('Room ${roomId} has been deleted due to inactivity.')
				}
			}
		  });
		
	});
		
};
