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
const readyButton = document.getElementById("ready");

const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const splitButton = document.getElementById("split");
const doubleButton = document.getElementById("double");

document.querySelector('.container').style.display = 'none';

let responsePromise;
let resolveResponse;

let n = "me";

lobbyConnectButton.addEventListener("click", () => {
    const lobbyCode = lobbyCodeInput.value.trim();

    if (lobbyCode === "") {
        alert("Please enter a valid lobby code.");
        return;
    }

    if (ws) {
        ws.close();
    }

    ws = new WebSocket(`ws://localhost:3000/${lobbyCode}`);

    ws.onopen = () => {
        document.querySelector('.container').style.display = '';
        readyButton.style.display = "";
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

            if (data.type === 'ready') {
                if (resolveResponse) {
                    resolveResponse(data.message);
                    resolveResponse = null;
                }
            } else if (data.type === 'start') {
                console.log(data.message)
                Object.keys(data.message.players).forEach(p => {
                    console.log(data.message.players[p].name);
                    if(data.message.players[p].name === n){
                        console.log(player, data.message.players[p].cards[0]);
                        newHand(player, data.message.players[p].cards[0]);
                        checkBets(player,data.message.dealer);
                    }           
                  });
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

async function askForCard() {
    return new Promise((resolve) => {
        resolveResponse = resolve;
        const message = JSON.stringify({type: 'card', data: {playerName: 'me'}});
        ws.send(message);
    });
}
async function askForDealer() {
    return new Promise((resolve) => {
        resolveResponse = resolve;
        const message = JSON.stringify({type: 'done', data: {playerName: 'me', status : "done"}});
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

standButton.addEventListener("click", () => {

});
splitButton.addEventListener("click", () => {

});
doubleButton.addEventListener("click", () => {

});

