# HeyZo - Decentralized Reward System

A revolutionary decentralized reward system built on the Celo blockchain. Users earn tokens daily, build streaks, and get boosted rewards while admins manage pools and distributions seamlessly.

## 🌟 Features

### For Users
- **Daily Token Claims**: Claim tokens daily from available pools
- **Streak Building**: Build streaks for boosted rewards
- **Real-time Pool Information**: View current pool balances and limits
- **Community Support**: Donate to pools to support the community
- **Contract Top-ups**: Add tokens to contract reserves
- **Wallet Integration**: Connect MetaMask wallet to Celo network
- **Claim Cooldowns**: Track claim timers and streaks

### For Admins
- **Pool Management**: Create and configure token pools
- **Token Distribution**: Send tokens directly to users
- **Fund Management**: Top up contract reserves and increase pool allocations
- **Withdrawal Control**: Withdraw funds from pools
- **Real-time Monitoring**: Track pool balances and user activity

## 🏗️ Architecture

### Smart Contract Functions
- `topUp(address token, uint256 amount)`: Add tokens to contract reserves
- `increasePool(address token, uint256 amount)`: Move tokens from reserves to pool allocation
- `setPool(address token, uint256 total, uint256 maxSend, bool isNative)`: Initialize pool configuration
- `claim(address token)`: User claim function with streak tracking
- `adminSend(address token, address to, uint256 amount)`: Admin direct distribution
- `withdraw(address token, uint256 amount)`: Admin withdrawal function
- `getUserInfo(address user, address token)`: Get user streak and claim info

### Supported Tokens
- **CELO** (Native): `0x471EcE3750Da237f93B8E339c536989b8978a438`
- **cUSD**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **cEUR**: `0xD8763CBa276a3738E6DE85b4b3b5Cd2dB23fE6b6`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm or npm
- MetaMask wallet
- Celo network configured in MetaMask

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd heyzo
   ```

2. **Install dependencies**
```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
   NEXT_PUBLIC_RPC_URL=https://forno.celo.org
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. **Run the development server**
   ```bash
pnpm dev
# or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Contract Deployment
1. Deploy the HeyZo smart contract to Celo network
2. Set the contract address in your environment variables
3. Configure initial pools using the admin panel

### Admin Setup
1. Connect your admin wallet (must match contract admin address)
2. Use the admin panel to:
   - Set up initial token pools
   - Configure max claim amounts
   - Set cooldown periods

## 📱 Usage

### User Dashboard (`/user`)
- **Connect Wallet**: Link your MetaMask wallet to Celo network
- **View Pools**: See available token pools and balances
- **Claim Rewards**: Claim daily tokens from pools
- **Track Streaks**: Monitor your claim streaks and bonuses
- **Donate**: Support pools by donating tokens
- **Top Up**: Add tokens to contract reserves

### Admin Panel (`/admin`)
- **Dashboard**: Overview of pools and contract status
- **Pool Management**: Create and configure token pools
- **Actions**:
  - **Create Pool**: Set up new token pools
  - **Send Tokens**: Distribute tokens directly to users
  - **Withdraw**: Remove funds from pools
  - **Fund Pool**: Add tokens to existing pools
  - **Top Up**: Add tokens to contract reserves
  - **Increase Pool**: Move tokens from reserves to pools
- **Balances**: Monitor contract token balances

## 🎨 UI/UX Features

### Light Theme Design
- Clean, modern interface with light color scheme
- Gradient backgrounds and subtle shadows
- Responsive design for all device sizes
- Smooth animations and transitions

### Navigation
- Intuitive sidebar navigation
- Mobile-responsive menu system
- Clear visual hierarchy and typography

## 🔒 Security Features

- **Admin-only Functions**: Restricted pool management operations
- **Input Validation**: Comprehensive form validation
- **Transaction Confirmation**: Clear feedback for all operations
- **Error Handling**: Graceful error handling and user feedback

## 🧪 Testing

### Smart Contract Testing
```bash
# Run contract tests
npm run test:contract

# Run with coverage
npm run test:coverage
```

### Frontend Testing
```bash
# Run component tests
npm run test:components

# Run E2E tests
npm run test:e2e
```

## 📦 Build & Deploy

### Production Build
```bash
npm run build
```

### Deploy to Vercel
```bash
npm run deploy
```

### Deploy to Other Platforms
The app is built with Next.js and can be deployed to any platform that supports Node.js applications.

## 🌐 Network Configuration

### Celo Network Setup
1. **Network Name**: Celo
2. **RPC URL**: `https://forno.celo.org`
3. **Chain ID**: `42220`
4. **Currency Symbol**: `CELO`
5. **Block Explorer**: `https://explorer.celo.org`

### MetaMask Configuration
1. Open MetaMask
2. Go to Settings > Networks
3. Add the Celo network with the above parameters
4. Switch to Celo network

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **Wallet Connection**: Ensure MetaMask is connected to Celo network
- **Transaction Failures**: Check gas fees and network congestion
- **Pool Issues**: Verify pool configuration and token balances

### Getting Help
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

## 🔮 Roadmap

### Upcoming Features
- [ ] Multi-chain support
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Social features and leaderboards
- [ ] DeFi integrations
- [ ] NFT rewards system

### Recent Updates
- ✅ Added `topUp` function for contract deposits
- ✅ Added `increasePool` function for pool allocation
- ✅ Implemented light theme design
- ✅ Enhanced admin controls
- ✅ Improved user experience

## 📊 Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Blockchain**: Wagmi, Viem, Celo
- **State Management**: React Query, React Hooks
- **Deployment**: Vercel (recommended)
- **Testing**: Jest, React Testing Library

## 🎯 Use Cases

### For Communities
- **DAO Rewards**: Distribute governance tokens
- **Community Incentives**: Reward active members
- **Event Rewards**: Token distribution for events

### For Businesses
- **Customer Loyalty**: Reward customer engagement
- **Employee Incentives**: Performance-based rewards
- **Partner Programs**: Collaborative reward systems

---

**Built with ❤️ on the Celo blockchain**

*HeyZo - Revolutionizing decentralized rewards*
