const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function deployMarketplace() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.deployed();

  const data = {
    address: marketplace.address,
    abi: JSON.parse(marketplace.interface.format('json'))
  }

  // This writes the ABI and address to the mktplace.json
  fs.writeFileSync('./src/Marketplace.json', JSON.stringify(data));
}

async function deployLock() {
  const lock = await hre.ethers.deployContract();
  await lock.waitForDeployment();

  console.log(
    `Lock with ${ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  );
}

async function main() {
  try {
    // Deploy the NFT Marketplace
    await deployMarketplace();

    // Deploy the Lock (assuming you have the necessary implementation)

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
