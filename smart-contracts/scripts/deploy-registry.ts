import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const HealthcareRegistry = await ethers.getContractFactory("HealthcareRegistry");
    const registry = await HealthcareRegistry.deploy();

    await registry.waitForDeployment();

    const address = await registry.getAddress();
    console.log("HealthcareRegistry deployed to:", address);

    // In a real scenario, we would verify here, but for now just log it.
    console.log("To verify: npx hardhat verify --network <network> " + address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
