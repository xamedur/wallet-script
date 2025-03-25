// Log to debug when the script is loaded
console.log("wallet.js script loaded");

// Defer execution until the browser environment is fully loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        console.log("Browser environment loaded, defining connectPhantomWallet");

        window.connectPhantomWallet = async function(callback) {
            try {
                // Double-check we're in a browser environment
                if (typeof window === 'undefined') {
                    console.error("window is undefined in connectPhantomWallet");
                    callback({
                        success: false,
                        error: 'Browser environment not detected'
                    });
                    return;
                }

                console.log("Attempting to connect to Phantom wallet");

                // Wait for Phantom to be loaded
                let attempts = 0;
                const maxAttempts = 10;
                while (!(window.solana && window.solana.isPhantom) && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
                    attempts++;
                }

                // Check if Phantom is available
                if (window.solana && window.solana.isPhantom) {
                    try {
                        const resp = await window.solana.connect();
                        const publicKey = resp.publicKey.toString();
                        console.log("Successfully connected to Phantom:", publicKey);
                        callback({
                            success: true,
                            publicKey: publicKey
                        });
                    } catch (err) {
                        console.error("Failed to connect to Phantom:", err.message);
                        callback({
                            success: false,
                            error: 'Failed to connect to Phantom: ' + err.message
                        });
                    }
                } else {
                    console.warn("Phantom wallet not detected");
                    callback({
                        success: false,
                        error: 'Please install Phantom Wallet'
                    });
                    window.open('https://phantom.app/', '_blank');
                }
            } catch (err) {
                console.error("Error in connectPhantomWallet:", err.message);
                callback({
                    success: false,
                    error: 'Error connecting wallet: ' + err.message
                });
            }
        };
    });
} else {
    console.error("wallet.js: window is undefined during script evaluation");
}
