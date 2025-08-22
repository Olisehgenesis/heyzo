# Environment Variables Setup

Create a `.env` file in your project root with the following variables:

## Celo Networks
```bash
# Celo Mainnet
CELO_RPC_URL=https://forno.celo.org
CELO_PRIVATE_KEY=your_celo_mainnet_private_key_here

# Celo Testnet (Alfajores)
CELO_TESTNET_RPC_URL=https://alfajores-forno.celo-testnet.org
CELO_TESTNET_PRIVATE_KEY=your_celo_testnet_private_key_here

# Optional: Custom RPC URLs
# CELO_RPC_URL=https://your-custom-celo-rpc.com
# CELO_TESTNET_RPC_URL=https://your-custom-celo-testnet-rpc.com
```

## Other Networks
```bash
# Sepolia Testnet
SEPOLIA_RPC_URL=your_sepolia_rpc_url_here
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here
```

## Contract Verification
```bash
# Celoscan API Key (for contract verification)
CELOSCAN_API_KEY=your_celoscan_api_key_here

# Etherscan API Key (for Sepolia verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## How to get API Keys:
1. **Celoscan**: Visit [celoscan.io](https://celoscan.io) and create an account to get an API key
2. **Etherscan**: Visit [etherscan.io](https://etherscan.io) and create an account to get an API key

## Usage:
- Copy this file to `.env`
- Replace the placeholder values with your actual keys
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
