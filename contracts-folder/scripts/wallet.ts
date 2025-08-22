import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  
  console.log("=== Wallet Management with Viem ===");
  
  // Get all available wallet clients
  const wallets = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log(`Found ${wallets.length} wallet(s):`);
  
  // Display wallet information
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const address = wallet.account.address;
    const balance = await publicClient.getBalance({ address });
    
    console.log(`\nWallet ${i + 1}:`);
    console.log(`  Address: ${address}`);
    console.log(`  Balance: ${balance.toString()} wei (${(Number(balance) / 1e18).toFixed(4)} ETH)`);
    
    // Check if this wallet has any transactions
    try {
      const transactionCount = await publicClient.getTransactionCount({ address });
      console.log(`  Transaction Count: ${transactionCount}`);
    } catch (error) {
      console.log(`  Transaction Count: Unable to fetch`);
    }
  }
  
  // Get the first wallet as the main wallet
  const mainWallet = wallets[0];
  console.log(`\nMain wallet: ${mainWallet.account.address}`);
  
  // Example: Send a small amount to another wallet if available
  if (wallets.length > 1) {
    const recipientWallet = wallets[1];
    const amount = 1000000000000000n; // 0.001 ETH
    
    console.log(`\nSending ${amount.toString()} wei to ${recipientWallet.account.address}...`);
    
    try {
      const hash = await mainWallet.sendTransaction({
        to: recipientWallet.account.address,
        value: amount,
      });
      
      console.log(`Transaction sent: ${hash}`);
      
      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      
    } catch (error) {
      console.log(`Transaction failed: ${error}`);
    }
  }
  
  // Example: Contract interaction
  console.log("\n=== Contract Interaction Example ===");
  
  // Deploy a simple contract or interact with existing one
  try {
    const heyzo = await viem.deployContract("HeyZo");
    console.log(`HeyZo contract deployed to: ${heyzo.address}`);
    
    // Read contract state
    const admin = await heyzo.read.admin();
    console.log(`Contract admin: ${admin}`);
    
    // Example of writing to contract (would require proper setup)
    console.log("Contract is ready for interactions!");
    
  } catch (error) {
    console.log(`Contract deployment failed: ${error}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
