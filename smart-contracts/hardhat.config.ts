import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const POLYGON_RPC = process.env.POLYGON_RPC || "https://rpc-amoy.polygon.technology";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },
    networks: {
        amoy: {
            url: POLYGON_RPC,
            accounts: [PRIVATE_KEY],
            chainId: 80002
        },
        hardhat: {
            chainId: 31337
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};

export default config;
