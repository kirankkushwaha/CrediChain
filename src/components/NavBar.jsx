import React from "react";
import { ethers } from "ethers";

const NavBar = ({ account, setAccount }) => {
  // Function to connect MetaMask with account selection
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  // Function to log out
  const logout = () => {
    setAccount(null);
  };

  return (
    <nav className="navbar">
     <h3 >CrediChain </h3>
      <div className="wallet-section">
        {account ? (
          <div className="account-info">
            
            <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <button onClick={connectWallet} className="connect-btn">Connect to MetaMask</button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
