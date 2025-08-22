import { network } from "hardhat";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  // Get arguments from process.argv (skip first two: node path and script path)
  const args = process.argv.slice(2);
  const contractAddress = args[0];
  const networkName = args[1] || "celoTestnet";
  
  if (!contractAddress) {
    console.error("Please provide a contract address");
    console.error("Usage: pnpm run verify:celo <contract_address> [network]");
    console.error("Example: pnpm run verify:celo 0x8edf0a82bfeaf29b16b9131b5ce7274f3e994273 celo");
    process.exit(1);
  }
  
  console.log(`Verifying contract ${contractAddress} on ${networkName}...`);
  
  // Get the Celoscan API key
  const celoscanApiKey = process.env.CELOSCAN_API_KEY;
  if (!celoscanApiKey) {
    console.error("CELOSCAN_API_KEY not found in .env file");
    process.exit(1);
  }
  
  // Determine the API endpoint based on network
  let apiUrl: string;
  let browserUrl: string;
  
  if (networkName === "celo" || networkName === "mainnet") {
    apiUrl = "https://api.celoscan.io/api";
    browserUrl = "https://celoscan.io";
  } else {
    apiUrl = "https://api-alfajores.celoscan.io/api";
    browserUrl = "https://alfajores.celoscan.io";
  }
  
  try {
    console.log("Preparing verification...");
    
    // For manual verification, you'll need to:
    console.log("\n=== Manual Verification Instructions ===");
    console.log(`1. Go to: ${browserUrl}/verifyContract`);
    console.log(`2. Enter contract address: ${contractAddress}`);
    console.log(`3. Enter contract name: HeyZo`);
    console.log(`4. Enter compiler version: 0.8.28`);
    console.log(`5. Enter optimization: Yes (200 runs)`);
    console.log(`6. Copy the flattened source code from your contract`);
    console.log(`7. Paste it in the source code field`);
    console.log(`8. Click "Verify and Publish"`);
    
    console.log("\n=== Alternative: Use Hardhat Flatten ===");
    console.log("Install hardhat-flattener:");
    console.log("pnpm add --save-dev hardhat-flattener");
    console.log("\nThen flatten your contract:");
    console.log("npx hardhat flatten contracts/HeyZo.sol > HeyZo_flattened.sol");
    console.log("Use the flattened file for verification");
    
    console.log("\n=== Contract Details ===");
    console.log(`Address: ${contractAddress}`);
    console.log(`Network: ${networkName}`);
    console.log(`Explorer: ${browserUrl}/address/${contractAddress}`);
    
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
