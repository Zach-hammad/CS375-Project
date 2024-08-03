document.addEventListener('DOMContentLoaded', () => {
    const { PhantomWalletAdapter } = solanaWeb3;
    const { clusterApiUrl, Connection, PublicKey } = window.solanaWeb3;
    const network = 'devnet';
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);
    const wallet = new PhantomWalletAdapter();
    
    const connectButton = document.getElementById('connect-wallet');
    const loginButton = document.getElementById('login');

    connectButton.addEventListener('click', async () => {
        if (!wallet.connected) {
            await wallet.connect();
            console.log('Connected to wallet:', wallet.publicKey.toString());
            loginButton.disabled = false;
        }
    });

    loginButton.addEventListener('click', async () => {
        if (wallet.connected) {
            const message = 'Please sign this message to verify your wallet.';
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await wallet.signMessage(encodedMessage);
            console.log('Signed message:', signedMessage);

            // Send the signed message and public key to your server for verification
            const response = await fetch('/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publicKey: wallet.publicKey.toString(),
                    signedMessage: Array.from(signedMessage)
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log('Login successful');
            } else {
                console.log('Login failed');
            }
        } else {
            console.log('Wallet not connected');
        }
    });
});
