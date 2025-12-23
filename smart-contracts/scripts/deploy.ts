import { ethers } from "hardhat";

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const unlockTime = currentTimestampInSeconds + 60;

    console.log("Deploying contracts with the account:", (await ethers.getSigners())[0].address);

    const HealthChainRecords = await ethers.getContractFactory("HealthChainRecords");
    const healthChain = await HealthChainRecords.deploy();

    await healthChain.waitForDeployment();

    const address = await healthChain.getAddress();

    console.log(`HealthChainRecords deployed to: ${address}`);

    // Log for verification
    console.log("To verify run:");
    console.log(`npx hardhat verify --network amoy ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
