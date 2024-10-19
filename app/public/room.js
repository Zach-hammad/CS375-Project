let player = {};
const socket = io("wss://csblackjack.fly.dev");

// Function to check if the user is logged in
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/check-login-status', {
            method: 'GET',
            credentials: 'include' // Include cookies in the request
        });
        const result = await response.json();
        return result.loggedIn;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

// Function to fetch the player's data (nickname and balance)
async function fetchPlayerData() {
    try {
        const response = await fetch('/api/get-user-data', {
            method: 'GET',
            credentials: 'include' // Include cookies in the request
        });
        const result = await response.json();
        if (response.ok) {
            return {
                nickname: result.nickname,
                balance: result.balance
            };
        } else {
            console.error('Error fetching user data:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        return null;
    }
}

// Function to clear cookies
function clearCookies() {
    // Iterate through all the cookies and delete them
    document.cookie.split(";").forEach(function(cookie) {
        document.cookie = cookie.replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
}

// Logout function
function logout() {
    clearCookies(); // Clear all cookies
    window.location.href = "/login.html"; // Redirect to login page
}

// Disable game buttons
function setGameControls(disabled) {
    const controls = ["hit", "stand", "double", "split", "insurance"];
    controls.forEach((id)=>{
        const button = document.getElementById(id);
        if (button){
            button.disabled = disabled;
        }
    });
}
function disableGameControls() {
    setGameControlsDisabled(true);
}
function enableGameControls() {
    setGameControlsDisabled(false);
}

document.getElementById("logoutButton").addEventListener("click", logout);
// Socket.IO connection setup


socket.on("connect", async () => {
    try {
        const userData = await fetchPlayerData();
        if (!userData){
            console.error("User data not found");
            logout();
            return;
        }
        console.log("I am connected", socket.id);
        player = new initPlayer(userData.nickname, userData.balance);
        updateSide();
        document.getElementById('mainBetBalance').textContent = `Bet: ${mainBetTotal}`;
        socket.emit("join", [userData.nickname]);
    } catch (error) {
        console.error("Error during connection:", error);
        logout()
    }
});
// Manage chat messages
let sendMessageButton = document.getElementById("send-message");
let messageInput = document.getElementById("message-input");
let messagesDiv = document.getElementById("messages");
let updatesDiv = document.getElementById("updates");

sendMessageButton.addEventListener("click", () => {
    let message = messageInput.value;
    if (message === "") {
        return;
    }
    socket.emit("message", { message });
    appendMessage(player.name, message);
    messageInput.value = "";
});

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessageButton.click();
    }
});

// Append messages to the chat
function appendMessage(socketId, message) {
    let item = document.createElement("div");
    item.textContent = socketId === socket.id ? `You: ${message}` : `${socketId}: ${message}`;
    messagesDiv.appendChild(item);
}
function appendUpdate(name, message) {
    let item = document.createElement("div");
    item.textContent = `${name} has ${message}` ;
    updatesDiv.appendChild(item);
}

// Handle incoming messages and events
socket.on("relay", function (data) {
    console.log("Received message:", data);
    appendMessage(data.socketId, data.message);
});
socket.on("update", function (data) {
    console.log("Received update:", data);
    appendUpdate(data[0], data[1]);
});

socket.on("start", function (data) {
    console.log("Received message:", data);
});


// Extract room ID from URL and display it
let pathParts = window.location.pathname.split("/");
let roomId = pathParts[pathParts.length - 1];
document.getElementById("lobby-code-display").textContent += ` ${roomId}`;   