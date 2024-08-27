window.onload = function() {
  document.getElementById("loginButton").addEventListener("click", loginWithEth);

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
      window.localStorage.setItem('userETHaddress', account);

      const response = await fetch('/save-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ethAddress: account, nickname: nickname, balance: deposit }),
      });
      
      // Check if the response is OK (status 200-299)
      if (response.ok) {
        // Try to parse the response as JSON
        const result = await response.json();
        console.log('Nickname and deposit saved:', result);
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
