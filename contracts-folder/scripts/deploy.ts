import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  
  console.log("Deploying HeyZo contract...");
  
  // Get wallet clients
  const [deployerWallet, ...otherWallets] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log("Deployer address:", deployerWallet.account.address);
  console.log("Available wallets:", otherWallets.length + 1);
  
  // Check deployer balance
  const deployerBalance = await publicClient.getBalance({ address: deployerWallet.account.address });
  console.log("Deployer balance:", deployerBalance.toString(), "wei");
  
  // Deploy the HeyZo contract using the deployer wallet
  console.log("Deploying contract...");
  const heyzo = await viem.deployContract("HeyZo");
  
  console.log("HeyZo deployed to:", heyzo.address);
  console.log("Deployment transaction completed!");
  
  // Wait for deployment to be mined
  console.log("Waiting for deployment to be mined...");
  
  console.log("Deployment successful!");
  console.log("Contract address:", heyzo.address);
  
  // Get network name from process.argv or hardhat config
  const args = process.argv.slice(2);
  const networkArg = args.find(arg => arg.startsWith('--network='));
  const networkName = networkArg ? networkArg.split('=')[1] : 'hardhat';
  
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log(`\nTo verify your contract on ${networkName}, run:`);
    console.log(`npx hardhat verify --network ${networkName} ${heyzo.address}`);
  } else {
    console.log(`\nContract deployed to local network: ${networkName}`);
    console.log("To deploy to a real network, use:");
    console.log("pnpm run deploy:celo-testnet  # for Celo testnet");
    console.log("pnpm run deploy:celo          # for Celo mainnet");
  }
  
  // Show contract interaction examples
  console.log("\n=== Contract Interaction Examples ===");
  console.log("Contract deployed by:", deployerWallet.account.address);
  console.log("Contract admin:", deployerWallet.account.address);
  
  // You can add initialization logic here if needed
  // For example, setting up initial pools or configurations
  
  return heyzo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
