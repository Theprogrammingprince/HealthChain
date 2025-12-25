import { ethers } from "hardhat";

async function main() {
    try {
        console.log("Checking deployment environment...");
        const [signer] = await ethers.getSigners();
        if (!signer) {
            console.error("❌ No signer found. Please check your PRIVATE_KEY in .env");
            return;
        }
        console.log("✅ Wallet loaded:", signer.address);

        try {
            const balance = await ethers.provider.getBalance(signer.address);
            console.log("✅ Balance on Amoy:", ethers.formatEther(balance), "MATIC");

            if (balance === 0n) {
                console.warn("⚠️ Warning: Account has 0 MATIC. You need testnet tokens to deploy.");
                console.warn("   Get free tokens here: https://faucet.polygon.technology/");
            }
        } catch (netError) {
            console.error("❌ Could not connect to the network. Check your POLYGON_RPC in .env");
            console.error("   Error:", netError.message);
        }

    } catch (error: any) {
        console.error("❌ Error loading environment:");
        console.error(error.message);
        if (error.message.includes("invalid hex string")) {
            console.error("\n👉 TRICK: Your PRIVATE_KEY in .env might be wrong. It should be 64 characters long (hex), optionally starting with '0x'.");
            console.error("   It should NOT be a URL.");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
