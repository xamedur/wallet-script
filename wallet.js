// Log to debug when the script is loaded
console.log("wallet.js script loaded");

// Function to check if we're in a browser environment
function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Defer execution until the browser environment is fully loaded
function initializeWalletConnection() {
    if (!isBrowser()) {
        console.error("wallet.js: Not in a browser environment, skipping initialization");
        return;
    }

    // Add a small delay to ensure the browser environment is fully loaded
    setTimeout(() => {
        console.log("Browser environment loaded, defining connectPhantomWallet");

        window.connectPhantomWallet = async function(callback) {
            try {
                // Double-check we're in a browser environment
                if (!isBrowser()) {
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
    }, 1000); // Delay of 1 second to ensure browser environment is ready
}

// Run initialization only in the browser
if (isBrowser()) {
    // Use both window.onload and a fallback to ensure the script runs after the page is fully loaded
    if (document.readyState === 'complete') {
        initializeWalletConnection();
    } else {
        window.addEventListener('load', initializeWalletConnection);
    }
} else {
    console.error("wallet.js: Not in a browser environment during initial evaluation");
}
