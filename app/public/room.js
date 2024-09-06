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
function disableGameControls() {
    document.getElementById("hit").disabled = true;
    document.getElementById("stand").disabled = true;
    document.getElementById("double").disabled = true;
    document.getElementById("split").disabled = true;
    document.getElementById("insurance").disabled = true;
    document.getElementById("betReady").disabled = true;
    document.getElementById("sideBetReady").disabled = true;
}
function enableGameControls() {
    document.getElementById("hit").disabled = false;
    document.getElementById("stand").disabled = false;
    document.getElementById("double").disabled = false;
    document.getElementById("split").disabled = false;
    document.getElementById("insurance").disabled = false;
    document.getElementById("betReady").disabled = false;
    document.getElementById("sideBetReady").disabled = false;
}

document.getElementById("logoutButton").addEventListener("click", logout);

        const userData = await fetchPlayerData();
        // Socket.IO connection setup
        let socket = io("https://csblackjack.fly.dev");
        
        player = {};

        player = new initPlayer(userData.nickname, userData.balance);
        updateSide();
        document.getElementById('mainBetBalance').textContent = `Bet: ${mainBetTotal}`;

        socket.on("connect", async () => {
            try {
                console.log("I am connected", socket.id);
                socket.emit("join", [userData.nickname]);
            } catch (error) {
                console.error("Error during connection:", error);
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
    
        messageInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
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