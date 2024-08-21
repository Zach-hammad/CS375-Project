let ws;
const lobbyContainer = document.getElementById("lobby-container");
const createLobbyButton = document.getElementById("create-lobby");

const lobbyCodeInput = document.getElementById("lobby-code-input");
const joinLobbyButton = document.getElementById("join-lobby");

const chatContainer = document.getElementById("chat-container");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-message");

const lobbyCodeDisplay = document.getElementById("lobby-code-display");
const exitLobbyButton = document.getElementById("exit-lobby");

document.querySelector(".container").style.display = "none";

let responsePromise;
let resolveResponse;

let n = "me";

function lobbyStateUI() {
	document.querySelector(".container").style.display = "none";
	chatBox.textContent = "";
	chatContainer.style.display = "none";
	lobbyContainer.style.display = "block";
}

function gameStateUI() {
	document.querySelector(".container").style.display = "";
	betDisplay.style.display = "";
	lobbyContainer.style.display = "none";
	chatContainer.style.display = "block";
}

function connectToLobby(lobbyCode) {
	if (ws) {
		ws.close();
	}

	ws = new WebSocket(`ws://localhost:3000/${lobbyCode}`);
	// ws = new WebSocket(`wss://csblackjack.fly.dev/${lobbyCode}`);

	ws.onopen = () => {
		const dateTime = new Date();

		gameStateUI();
		lobbyCodeDisplay.textContent = `Lobby Code: ${lobbyCode}`;

		ws.send(`@${dateTime.toLocaleString()}: A user has entered the lobby.`);
	};

	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);

			if (data.type === "ready") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			} else if (data.type === "start") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			} else if (data.type === "done") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			} else if (data.type === "text") {
				const message = document.createElement("div");
				const dateTime = new Date();

				message.className = "message";
				message.textContent = `@${dateTime.toLocaleString()}: ${data.message}`;

				chatBox.appendChild(message);
				chatBox.scrollTop = chatBox.scrollHeight;
			} else if (data.type === "card") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			}
		} catch (error) {}
	};

	ws.onclose = () => {
		lobbyStateUI();
	};
}

createLobbyButton.addEventListener("click", () => {
	fetch("/create", { method: "POST" })
		.then((response) => response.json())
		.then((data) => {
			connectToLobby(data.lobbyCode);
		});
});

joinLobbyButton.addEventListener("click", () => {
	const lobbyCode = lobbyCodeInput.value.trim();

	if (lobbyCode === "") {
		alert("No lobby code inputted. Please enter a lobby code.");

		return;
	}

	// fetch(`/check/${lobbyCode}`)
	// 	.then((response) => {
	// 		if (response.ok) {
	// 			connectToLobby(lobbyCode);
	// 		} else {
	// 			throw new Error("Invalid lobby code. Please enter a valid lobby code.");
	// 		}
	// 	})
	// 	.catch((error) => {
	// 		alert(error.message);
	// 	});

	if (ws) {
		ws.close();
	}

	ws = new WebSocket(`ws://localhost:3000/${lobbyCode}`);
	// ws = new WebSocket(`wss://csblackjack.fly.dev/${lobbyCode}`);

	ws.onopen = () => {
		const dateTime = new Date();

		gameStateUI();
		lobbyCodeDisplay.textContent = `Lobby Code: ${lobbyCode}`;

		ws.send(`@${dateTime.toLocaleString()}: A user has entered the lobby.`);
	};

	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);

			if (data.type === "ready") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			} else if (data.type === "start") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			} else if (data.type === "done") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			} else if (data.type === "text") {
				const message = document.createElement("div");
				const dateTime = new Date();

				message.className = "message";
				message.textContent = `@${dateTime.toLocaleString()}: ${data.message}`;

				chatBox.appendChild(message);
				chatBox.scrollTop = chatBox.scrollHeight;
			} else if (data.type === "card") {
				if (resolveResponse) {
					resolveResponse(data.message);
					resolveResponse = null;
				}
			}
		} catch (error) {}
	};

	ws.onclose = () => {
		lobbyStateUI();
	};
});

async function askForCard() {
	return new Promise((resolve) => {
		resolveResponse = resolve;
		const message = JSON.stringify({ type: "card", data: { playerName: n } });
		ws.send(message);
	});
}
async function askForDealer() {
	return new Promise((resolve) => {
		resolveResponse = resolve;
		const message = JSON.stringify({ type: "done", data: { playerName: n, status: "done" } });
		ws.send(message);
	});
}

messageInput.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		sendMessageButton.click();
	}
});

sendMessageButton.addEventListener("click", () => {
	const message = messageInput.value.trim();
	if (message && ws && ws.readyState === WebSocket.OPEN) {
		ws.send(message);
		messageInput.value = "";
	}
});

exitLobbyButton.addEventListener("click", () => {
	if (ws && ws.readyState === WebSocket.OPEN) {
		const dateTime = new Date();
		ws.send(`@${dateTime.toLocaleString()}: A user has exited the lobby.`);
		ws.close();
	}
});
