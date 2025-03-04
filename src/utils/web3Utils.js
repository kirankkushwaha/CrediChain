import { ethers } from 'ethers';
import CredentialRequestABI from '../../artifacts/contracts/CredentialRequest.sol/CredentialRequest.json';

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";  

export const getWeb3Provider = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask!");
  }
  
  try {
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x7A69') { 
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }],
        });
      } catch (switchError) {
       
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69',
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://127.0.0.1:8545']
            }]
          });
        } else {
          throw switchError;
        }
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    
    console.log("Connected to network:", await provider.getNetwork());
    console.log("Connected with address:", await signer.getAddress());
    
    return { provider, signer };
  } catch (error) {
    console.error("Error setting up web3:", error);
    throw error;
  }
};

export const getContract = async (signer) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CredentialRequestABI.abi,
      signer
    );
    
    
    console.log("Contract instance created at address:", CONTRACT_ADDRESS);
    return contract;
  } catch (error) {
    console.error("Error getting contract instance:", error);
    throw error;
  }
};