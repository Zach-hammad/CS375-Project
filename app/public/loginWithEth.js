window.onload = function() {
  console.log("Window loaded and script running");

  const loginButton = document.getElementById("loginButton");
  const sendTransactionButton = document.getElementById("sendTransactionButton");

  if (loginButton) {
      loginButton.addEventListener("click", loginWithEth);
      console.log("Login button event listener attached");
  } else {
      console.error("Login button not found");
  }

  if (sendTransactionButton) {
      sendTransactionButton.addEventListener("click", sendTransaction);
      console.log("Send Transaction button event listener attached");
  } else {
      console.error("Send Transaction button not found");
  }

  if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);

      try {
          window.ethereum.request({ method: 'eth_requestAccounts' }).then(() => {
              console.log("Ethereum accounts requested successfully");
          }).catch((error) => {
              console.error('Error during account access request:', error);
          });
      } catch (error) {
          console.error('Initialization error:', error);
      }
  } else {
      alert('No ETH browser extension detected.');
      console.error("No ETH browser extension detected");
  }
}

async function loginWithEth() {
  console.log("Login with ETH function called");

  const nickname = document.getElementById("nickname").value;
  if (!nickname) {
      alert('Please enter a nickname.');
      console.error("No nickname entered");
      return;
  }

  if (window.ethereum) {
      try {
          const accounts = await window.web3.eth.getAccounts();
          const account = accounts[0]; 

          console.log("Account:", account);

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
      console.error("No ETH browser extension detected in loginWithEth");
  }
}

async function sendTransaction() {
  console.log("Send Transaction function called");

  if (window.ethereum) {
      try {
          const accounts = await window.web3.eth.getAccounts();
          const account = accounts[0]; 

          console.log("Account for transaction:", account);

          const transactionParameters = {
              to: '0x205cb324f5fd910B11f92c19aD0C04803Fb24ddB', // Replace with the recipient address
              value: window.web3.utils.toHex(window.web3.utils.toWei('0.095', 'ether')), // Amount in wei
              gas: '21000', // Gas limit
          };

          const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [{
                  from: account,
                  ...transactionParameters
              }],
          });

          console.log('Transaction hash:', txHash);
      } catch (error) {
          console.error('Error sending transaction:', error);
      }
  } else {
      alert('No ETH browser extension detected.');
      console.error("No ETH browser extension detected in sendTransaction");
  }
}
