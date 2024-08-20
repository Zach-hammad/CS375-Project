let ws;
const lobbyInterface = document.getElementById("lobbyInterface");
const lobbyCodeInput = document.getElementById("lobbyCodeInput");
const lobbyConnectButton = document.getElementById("lobbyConnectButton");
const chatInterface = document.getElementById("chatInterface");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessageButton");
const lobbyCodeDisplay = document.getElementById("lobbyCodeDisplay");
const exitLobbyButton = document.getElementById("exitLobbyButton");

document.querySelector('.container').style.display = 'none';

let responsePromise;
let resolveResponse;


lobbyConnectButton.addEventListener("click", () => {
    const lobbyCode = lobbyCodeInput.value.trim();

    if (lobbyCode === "") {
        alert("Please enter a valid lobby code.");
        return;
    }

    if (ws) {
        ws.close();
    }

    //ws = new WebSocket(`ws://localhost:3000/${lobbyCode}`);
    ws = new WebSocket(`wss://csblackjack.fly.dev/${lobbyCode}`);

    ws.onopen = () => {
        document.querySelector('.container').style.display = '';
        betDisplay.style.display = "";
        const dateTime = new Date();

        lobbyCodeDisplay.textContent = `Lobby Code: ${lobbyCode}`;
        lobbyInterface.style.display = "none";
        chatInterface.style.display = "block";
        // Send message to the WebSocket server
        ws.send(`@${dateTime.toLocaleString()}: A user has entered the lobby.`);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if ((data.type === 'ready')) {
                if (resolveResponse) {
                    resolveResponse(data.message);
                    resolveResponse = null;
                }
            } else if (data.type === 'start') {
                if (resolveResponse) {
                    resolveResponse(data.message);
                    resolveResponse = null;
                }

            } else if (data.type === 'done') {
                if (resolveResponse) {
                    resolveResponse(data.message);
                    resolveResponse = null;
                }
            }else if (data.type === 'text') {
                const message = document.createElement("div");
                const dateTime = new Date();

                message.className = "message";
                message.textContent = `@${dateTime.toLocaleString()}: ${data.message}`;

                chatBox.appendChild(message);
                chatBox.scrollTop = chatBox.scrollHeight;
            } else if (data.type === 'card') {
                if (resolveResponse) {
                    resolveResponse(data.message);
                    resolveResponse = null;
                }
            }
        } catch (error) {
            ;
        }
    };
    ws.onclose = () => {
        chatBox.textContent = "";
        chatInterface.style.display = "none";
        lobbyInterface.style.display = "block";
    };
});

async function askForCard(player) {
    return new Promise((resolve) => {
        resolveResponse = resolve;
        const message = JSON.stringify({type: 'card', data: {playerName: player.name}});
        ws.send(message);
    });
}
async function askForDealer(player) {
    return new Promise((resolve) => {
        resolveResponse = resolve;
        const message = JSON.stringify({type: 'done', data: {playerName: player.name, status : "done"}});
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
        messageInput.value = '';
    }
});

exitLobbyButton.addEventListener("click", () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const dateTime = new Date();
        ws.send(`@${dateTime.toLocaleString()}: A user has exited the lobby.`);
        ws.close();
    }
});

