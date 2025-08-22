import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("HeyZo", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, user1, user2] = await viem.getWalletClients();

  let heyzo: any;
  let mockToken: any;

  // Deploy mock ERC20 token for testing
  const mockTokenAbi = [
    {
      "inputs": [{"name": "initialSupply", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  it("Should deploy HeyZo contract", async function () {
    heyzo = await viem.deployContract("HeyZo");
    assert.ok(heyzo.address, "Contract should have an address");
    
    // Check admin is set to deployer
    const admin = await heyzo.read.admin();
    assert.equal(admin, deployer.account.address, "Admin should be deployer");
  });

  it("Should deploy mock ERC20 token", async function () {
    mockToken = await viem.deployContract("MockERC20", ["MockToken", "MTK", 1000000n]);
    assert.ok(mockToken.address, "Mock token should have an address");
  });

  it("Should set up a native pool", async function () {
    // Send some ETH to the contract first
    await deployer.sendTransaction({
      to: heyzo.address,
      value: 1000000000000000000n, // 1 ETH
    });

    // Set up native pool
    await heyzo.write.setPool([
      "0x0000000000000000000000000000000000000000", // address(0) for native
      1000000000000000000n, // 1 ETH total
      100000000000000000n,  // 0.1 ETH max per claim
      true // isNative
    ]);

    const pool = await heyzo.read.pools(["0x0000000000000000000000000000000000000000"]);
    assert.equal(pool.total, 1000000000000000000n, "Pool total should be set correctly");
    assert.equal(pool.maxSend, 100000000000000000n, "Pool maxSend should be set correctly");
    assert.equal(pool.isNative, true, "Pool should be marked as native");
  });

  it("Should set up an ERC20 pool", async function () {
    // Transfer some tokens to the contract
    await mockToken.write.transfer([heyzo.address, 1000000n]);

    // Set up ERC20 pool
    await heyzo.write.setPool([
      mockToken.address,
      1000000n, // 1M tokens total
      100000n,  // 100k tokens max per claim
      false // not native
    ]);

    const pool = await heyzo.read.pools([mockToken.address]);
    assert.equal(pool.total, 1000000n, "Pool total should be set correctly");
    assert.equal(pool.maxSend, 100000n, "Pool maxSend should be set correctly");
    assert.equal(pool.isNative, false, "Pool should not be marked as native");
  });

  it("Should allow users to claim from native pool", async function () {
    const initialBalance = await publicClient.getBalance({ address: user1.account.address });
    
    await heyzo.write.claim(["0x0000000000000000000000000000000000000000"], {
      account: user1.account.address,
    });

    const finalBalance = await publicClient.getBalance({ address: user1.account.address });
    assert.ok(finalBalance > initialBalance, "User should receive ETH");

    // Check user info
    const userInfo = await heyzo.read.getUserInfo([user1.account.address, "0x0000000000000000000000000000000000000000"]);
    assert.equal(userInfo.streak, 1n, "User should have streak of 1");
  });

  it("Should allow users to claim from ERC20 pool", async function () {
    const initialBalance = await mockToken.read.balanceOf([user2.account.address]);
    
    await heyzo.write.claim([mockToken.address], {
      account: user2.account.address,
    });

    const finalBalance = await mockToken.read.balanceOf([user2.account.address]);
    assert.ok(finalBalance > initialBalance, "User should receive tokens");

    // Check user info
    const userInfo = await heyzo.read.getUserInfo([user2.account.address, mockToken.address]);
    assert.equal(userInfo.streak, 1n, "User should have streak of 1");
  });

  it("Should enforce cooldown period", async function () {
    // Try to claim again immediately (should fail)
    try {
      await heyzo.write.claim(["0x0000000000000000000000000000000000000000"], {
        account: user1.account.address,
      });
      assert.fail("Should not allow immediate re-claim");
    } catch (error) {
      // Expected error
      assert.ok(error.message.includes("Claim too soon"), "Should enforce cooldown");
    }
  });

  it("Should allow admin to withdraw", async function () {
    const initialBalance = await publicClient.getBalance({ address: deployer.account.address });
    
    await heyzo.write.withdraw(["0x0000000000000000000000000000000000000000", 500000000000000000n], {
      account: deployer.account.address,
    });

    const finalBalance = await publicClient.getBalance({ address: deployer.account.address });
    assert.ok(finalBalance > initialBalance, "Admin should receive withdrawn ETH");
  });
});
