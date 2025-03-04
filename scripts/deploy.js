import hardhat from "hardhat";

const { ethers } = hardhat;

async function main() {
  const CredentialRequest = await ethers.getContractFactory("CredentialRequest");

  console.log("Deploying CredentialRequest contract...");

  const contract = await CredentialRequest.deploy();  
  await contract.waitForDeployment();  

  const contractAddress = await contract.getAddress();  
  console.log("CredentialRequest deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
