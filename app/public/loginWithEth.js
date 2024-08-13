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
  if (!nickname) {
    alert('Please enter a nickname.');
    return;
  }

  if (window.ethereum) {
    try {
      const accounts = await window.web3.eth.getAccounts();
      const account = accounts[0]; 
      
      const response = await fetch('/save-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ethAddress: account, nickname: nickname }),
      });
      
      const result = await response.json();
      if (response.ok) {
        console.log('Nickname saved:', result);
      } else {
        console.error('Error saving nickname:', result.error);
      }
    } catch (error) {
      console.error('Error fetching accounts or saving nickname:', error);
    }
  } else {
    alert('No ETH browser extension detected.');
  }
}

