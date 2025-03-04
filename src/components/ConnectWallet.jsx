import React from "react";
import { getWeb3Provider } from "../utils/web3Utils";

const ConnectWallet = ({ account, setAccount }) => {
  const connectWallet = async () => {
    try {
      const { signer } = await getWeb3Provider();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Make sure MetaMask is installed and unlocked.");
    }
  };

  return (
    <div className="wallet-container">
      {account ? (
        <div>
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <button onClick={() => setAccount(null)}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;