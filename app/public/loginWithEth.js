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
  if (window.ethereum) {
    try {
      const accounts = await window.web3.eth.getAccounts();
      const account = accounts[0]; // This is the currently selected account in MetaMask
      console.log(account);
      window.localStorage.setItem('userETHaddress', account);
      console.log(`Logged in with ETH address: ${account}`);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  } else {
    alert('No ETH browser extension detected.');
  }
}
