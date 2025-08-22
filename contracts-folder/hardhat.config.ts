import type { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { configVariable } from "hardhat/config";

// Load environment variables from .env file
dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, hardhatVerify],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhat: {
      // Local development network
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    celo: {
      type: "http",
      url: configVariable("CELO_RPC_URL") || "https://forno.celo.org",
      accounts: configVariable("CELO_PRIVATE_KEY") ? [configVariable("CELO_PRIVATE_KEY")] : [],
      chainId: 42220,
    },
    celoTestnet: {
      type: "http",
      url: configVariable("CELO_TESTNET_RPC_URL") || "https://alfajores-forno.celo-testnet.org",
      accounts: configVariable("CELO_TESTNET_PRIVATE_KEY") ? [configVariable("CELO_TESTNET_PRIVATE_KEY")] : [],
      chainId: 44787,
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
};

export default config;

