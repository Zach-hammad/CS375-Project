window.onload = function() {
  document.getElementById("loginButton").addEventListener("click", loginWithEth);
  document.getElementById("logoutButton").addEventListener("click", logout);

  // Check for Eth Wallet 
  if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
          window.ethereum.request({ method: 'eth_requestAccounts' }).catch((error) => {
              console.error('Error during account access request:', error);
              console.error('Error details:', error.message);
          });
      } catch (error) {
          console.error('Initialization error:', error);
      }
  } else {
      alert('No ETH browser extension detected.');
  }
}

async function loginWithEth() {
  const nickname = document.getElementById("nickname").value;
  const deposit = parseFloat(document.getElementById("deposit").value);

  if (!nickname) {
      alert('Please enter a nickname.');
      return;
  }

  if (!deposit || isNaN(deposit) || deposit <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
  }

  console.log('Deposit amount:', deposit);
  
  if (window.ethereum) {
    try {
        const accounts = await window.web3.eth.getAccounts();
        const account = accounts[0];
        console.log('ETH Address:', account);

        // Save the ethAddress as a cookie
        document.cookie = `ethAddress=${encodeURIComponent(account)}; path=/; secure; samesite=strict`;
        localStorage.setItem('nickname', nickname);

        const response = await fetch('/save-nickname', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ethAddress: account, nickname: nickname, balance: deposit }),
        });

        if (response.ok) {
            console.log('Nickname and deposit saved.');
            // Redirect to lobby creation page
            window.location.href = '/websocket.html';
        } else {
            console.error('Server error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
} else {
    alert('No ETH browser extension detected.');
}
}

function clearCookies() {
    // Iterate through all the cookies and delete them
    document.cookie.split(";").forEach(function(cookie) {
        document.cookie = cookie.replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
}

// Logout function
function logout() {
    localStorage.removeItem('nickname');
    clearCookies(); // Clear all cookies
    window.location.href = "/login.html"; // Redirect to login page
}

function getCookie(name){
    const value = "; ${document.cookie}";
    const parts = value.split("; ${name}=");
    if(parts.length === 2){
        return decodeURIComponent(parts.pop().split(';').shift());
    }
}

// Add event listener to logout button
document.getElementById("logoutButton").addEventListener("click", logout);
