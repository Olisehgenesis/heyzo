'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHeyZo } from '../hooks/useHeyZo';
import { formatEther, parseEther } from 'viem';

// Contract address from environment
const HEYZO_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xaD8b79865B640d76B734988C6A795249Ad4cF86e') as `0x${string}`;
import { 
  Menu, 
  X, 
  Home, 
  Gift, 
  Wallet, 
  BarChart3, 
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Zap,
  Star,
  Heart
} from 'lucide-react';

export default function UserPage() {
  const {
    isConnected,
    isConnecting,
    address,
    chain,
    getPool,
    getUserInfo,
    getContractBalance,
    claim,
    fundPool,
    topUp,
    approveToken,
    getTokenAllowance,
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchChain,
    error,
    isLoading
  } = useHeyZo();

  const [pools, setPools] = useState<Array<{ token: `0x${string}`; pool: any }>>([]);
  const [userInfos, setUserInfos] = useState<Array<{ token: `0x${string}`; info: any }>>([]);
  const [contractBalances, setContractBalances] = useState<Array<{ token: `0x${string}`; balance: bigint }>>([]);
  const [selectedToken, setSelectedToken] = useState<`0x${string}` | null>(null);
  const [claimAmount, setClaimAmount] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [fundPoolForm, setFundPoolForm] = useState({
    token: '',
    amount: '',
    isNative: false
  });

  const [topUpForm, setTopUpForm] = useState({
    token: '',
    amount: ''
  });

  // Common token addresses (you can add more)
  const commonTokens: `0x${string}`[] = [
    '0x471EcE3750Da237f93B8E339c536989b8978a438', // CELO token
    '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD
    '0xD8763CBa276a3738E6DE85b4b3b5Cd2dB23fE6b6', // cEUR
  ];

  // Load pools and user info
  const loadPoolsAndUserInfo = useCallback(async () => {
    if (!address) return;

    const poolsData: Array<{ token: `0x${string}`; pool: any }> = [];
    const userInfosData: Array<{ token: `0x${string}`; info: any }> = [];
    const balancesData: Array<{ token: `0x${string}`; balance: bigint }> = [];

    for (const token of commonTokens) {
      try {
        const pool = await getPool(token);
        if (pool && pool.total > BigInt(0)) {
          poolsData.push({ token, pool });
        }

        const userInfo = await getUserInfo(address, token);
        if (userInfo) {
          userInfosData.push({ token, info: userInfo });
        }

        // Load contract balance
        const balance = await getContractBalance(token);
        balancesData.push({ token, balance });
      } catch (err) {
        console.error(`Failed to load data for token ${token}:`, err);
      }
    }

    setPools(poolsData);
    setUserInfos(userInfosData);
    setContractBalances(balancesData);
  }, [address, getPool, getUserInfo, getContractBalance]);

  useEffect(() => {
    if (isConnected && address) {
      loadPoolsAndUserInfo();
    }
  }, [isConnected, address, loadPoolsAndUserInfo]);

  const handleClaim = async () => {
    if (!selectedToken || !address) return;

    setIsClaiming(true);
    try {
      const result = await claim(selectedToken);
      console.log('Claim successful:', result.hash);
      // Reload data after successful claim
      await loadPoolsAndUserInfo();
    } catch (err) {
      console.error('Claim failed:', err);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleFundPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundPoolForm.token || !fundPoolForm.amount) return;

    try {
      const amount = parseEther(fundPoolForm.amount);
      
      const result = await fundPool(
        fundPoolForm.token as `0x${string}`,
        amount,
        fundPoolForm.isNative
      );
      
      console.log('Pool funded successfully:', result.hash);
      
      // Reset form and reload data
      setFundPoolForm({ token: '', amount: '', isNative: false });
      await loadPoolsAndUserInfo();
    } catch (err) {
      console.error('Failed to fund pool:', err);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpForm.token || !topUpForm.amount) return;

    try {
      const amount = parseEther(topUpForm.amount);
      
      const result = await topUp(
        topUpForm.token as `0x${string}`,
        amount
      );
      
      console.log('Top up successful:', result.hash);
      
      // Reset form and reload data
      setTopUpForm({ token: '', amount: '' });
      await loadPoolsAndUserInfo();
    } catch (err) {
      console.error('Failed to top up:', err);
    }
  };

  const formatAddress = (address: `0x${string}`) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTokenName = (address: `0x${string}`) => {
    if (address === '0x471EcE3750Da237f93B8E339c536989b8978a438') return 'CELO';
    if (address === '0x765DE816845861e75A25fCA122bb6898B8B1282a') return 'cUSD';
    if (address === '0xD8763CBa276a3738E6DE85b4b3b5Cd2dB23fE6b6') return 'cEUR';
    return formatAddress(address);
  };

  const formatTime = (seconds: bigint) => {
    const minutes = Number(seconds) / 60;
    if (minutes < 60) return `${Math.floor(minutes)}m`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.floor(hours)}h`;
    const days = hours / 24;
    return `${Math.floor(days)}d`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              HeyZo Rewards
            </h1>
            <p className="text-gray-300 mb-8">
              Connect your wallet to start earning daily rewards
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gray-700 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center">
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin mr-3"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-3" />
                    Connect Wallet
                  </>
                )}
              </span>
            </button>
            {error && (
              <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { id: 'rewards', name: 'Rewards', icon: Gift, color: 'from-purple-500 to-pink-500' },
    { id: 'pools', name: 'Pools', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
    { id: 'donate', name: 'Donate', icon: Heart, color: 'from-orange-500 to-red-500' },
    { id: 'profile', name: 'Profile', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Welcome back!</h3>
                  <p className="text-white/80">Ready to claim your daily rewards?</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Available Pools</h3>
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">{pools.length}</p>
                <p className="text-white/60 text-sm">Active reward pools</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Balance</h3>
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {contractBalances.reduce((sum, { balance }) => sum + Number(formatEther(balance)), 0).toFixed(2)}
                </p>
                <p className="text-white/60 text-sm">Tokens available</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Best Streak</h3>
                  <Star className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {userInfos.length > 0 ? Math.max(...userInfos.map(ui => Number(ui.info.streak))) : 0}
                </p>
                <p className="text-white/60 text-sm">Days in a row</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('rewards')}
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Claim Rewards</h4>
                      <p className="text-white/80 text-sm">Get your daily tokens</p>
                    </div>
                    <Gift className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('pools')}
                  className="group bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">View Pools</h4>
                      <p className="text-white/80 text-sm">Check available rewards</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'rewards':
        return (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Claim Your Rewards</h3>
              
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="text-blue-200 text-sm">
                    <p className="font-semibold mb-1">How Claiming Works:</p>
                    <ul className="space-y-1">
                      <li>• Each user has a 15-minute cooldown between claims (per token)</li>
                      <li>• Claim amounts are random between 0.01 and max pool amount</li>
                      <li>• Build streaks by claiming daily for boosted rewards</li>
                      <li>• Streak bonus: +10% per 10 consecutive days</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {pools.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">No pools available for claiming</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pools.map(({ token, pool }) => {
                    const userInfo = userInfos.find(ui => ui.token === token);
                    const now = BigInt(Math.floor(Date.now() / 1000));
                    const cooldownPeriod = BigInt(15 * 60); // 15 minutes in seconds
                    const canClaim = userInfo ? 
                      (userInfo.info.lastClaim === BigInt(0) || now >= userInfo.info.lastClaim + cooldownPeriod) : 
                      true;
                    
                    return (
                      <div key={token} className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">
                            {formatTokenName(token)} Rewards
                          </h4>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                            {pool.isNative ? 'Native' : 'ERC20'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/60 text-sm">Available</p>
                            <p className="text-xl font-bold text-white">
                              {formatEther(pool.total)} tokens
                            </p>
                          </div>
                          <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/60 text-sm">Max Claim</p>
                            <p className="text-xl font-bold text-white">
                              {formatEther(pool.maxSend)} tokens
                            </p>
                          </div>
                          <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white/60 text-sm">Your Claim</p>
                            <p className="text-xl font-bold text-white">
                              {userInfo ? formatEther(userInfo.info.effectiveMaxSend) : '0'} tokens
                            </p>
                          </div>
                        </div>
                        
                        {userInfo && userInfo.info.effectiveMaxSend === BigInt(0) && (
                          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                            <div className="flex items-center text-red-300">
                              <span className="text-sm">
                                ⚠️ Pool max claim amount is 0. Please contact admin to configure this pool properly.
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {userInfo && (
                          <div className="bg-white/10 rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-white/60 text-sm">Streak</p>
                                <p className="text-lg font-bold text-white">{Number(userInfo.info.streak)} days</p>
                              </div>
                              <div>
                                <p className="text-white/60 text-sm">Last Claim</p>
                                <p className="text-lg font-bold text-white">
                                  {userInfo.info.lastClaim > BigInt(0) ? formatTime(BigInt(Date.now()) / BigInt(1000) - userInfo.info.lastClaim) : 'Never'}
                                </p>
                              </div>
                              <div>
                                <p className="text-white/60 text-sm">Status</p>
                                <p className={`text-lg font-bold ${
                                  canClaim ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                  {canClaim ? 'Ready to Claim' : 'On Cooldown'}
                                </p>
                              </div>
                            </div>
                            
                            {!canClaim && userInfo.info.lastClaim > BigInt(0) && (
                              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                                <div className="flex items-center text-yellow-300">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span className="text-sm">
                                    Next claim available in: {formatTime(cooldownPeriod - (now - userInfo.info.lastClaim))}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedToken(token);
                            handleClaim();
                          }}
                          disabled={!canClaim || isClaiming || (userInfo && userInfo.info.effectiveMaxSend === BigInt(0))}
                          className="group relative w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {isClaiming && selectedToken === token ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                Claiming...
                              </>
                            ) : (
                              <>
                                <Gift className="w-5 h-5 mr-3" />
                                {userInfo && userInfo.info.effectiveMaxSend === BigInt(0) ? 'Pool Not Configured' : 
                                 canClaim ? 'Claim Rewards Now' : 'Claim on Cooldown'}
                              </>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'pools':
        return (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Available Pools</h3>
              {pools.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">No pools available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pools.map(({ token, pool }) => (
                    <div key={token} className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                          {formatTokenName(token)}
                        </h4>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                          {pool.isNative ? 'Native' : 'ERC20'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-white/60">Total Available:</span>
                          <span className="font-mono font-medium text-white">
                            {formatEther(pool.total)} tokens
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Max Per Claim:</span>
                          <span className="font-mono font-medium text-white">
                            {formatEther(pool.maxSend)} tokens
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-white/60 text-sm text-center">Pool Status</p>
                        <p className="text-green-400 font-semibold text-center">Active</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'donate':
        return (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Donate to Pools</h3>
              <p className="text-white/60 mb-6">
                Support the community by donating tokens to pools. Your donations help increase the rewards available for all users.
              </p>
              
              <form onSubmit={handleFundPool} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Token Address</label>
                  <select
                    value={fundPoolForm.token}
                    onChange={(e) => setFundPoolForm({ ...fundPoolForm, token: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="">Select Token</option>
                    {commonTokens.map(token => (
                      <option key={token} value={token}>
                        {formatTokenName(token)} ({formatAddress(token)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Amount</label>
                  <input
                    type="text"
                    value={fundPoolForm.amount}
                    onChange={(e) => setFundPoolForm({ ...fundPoolForm, amount: e.target.value })}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/40"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isNative"
                    checked={fundPoolForm.isNative}
                    onChange={(e) => setFundPoolForm({ ...fundPoolForm, isNative: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="isNative" className="ml-2 text-sm text-white/80">
                    Native Token (CELO/ETH)
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Donating...' : 'Donate to Pool'}
                </button>
              </form>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Top Up Contract</h3>
              <p className="text-white/60 mb-6">
                Add tokens to the contract reserves. This is a general deposit that can later be allocated to pools by admins.
              </p>
              
              <form onSubmit={handleTopUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Token Address</label>
                  <select
                    value={topUpForm.token}
                    onChange={(e) => setTopUpForm({ ...topUpForm, token: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="">Select Token</option>
                    {commonTokens.map(token => (
                      <option key={token} value={token}>
                        {formatTokenName(token)} ({formatAddress(token)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Amount</label>
                  <input
                    type="text"
                    value={topUpForm.amount}
                    onChange={(e) => setTopUpForm({ ...topUpForm, amount: e.target.value })}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/40"
                    required
                  />
                </div>


                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                                      {isLoading ? 'Processing...' : 'Top Up Contract'}
                </button>
              </form>
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Your Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Wallet Address</h4>
                    <Wallet className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="font-mono text-white text-sm break-all">{address}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Network</h4>
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-white text-lg">{chain?.name || 'Unknown'}</p>
                </div>
              </div>
              
              <div className="mt-6 bg-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Token Balances</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contractBalances.map(({ token, balance }) => (
                    <div key={token} className="bg-white/10 rounded-xl p-4">
                      <h5 className="text-white font-medium mb-2">{formatTokenName(token)}</h5>
                      <p className="text-2xl font-bold text-white">{formatEther(balance)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-800 rounded-xl border border-gray-700 text-white hover:bg-gray-700 transition-all duration-300"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">HeyZo Rewards</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                        activeTab === item.id
                          ? 'bg-gray-700 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                        activeTab === item.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-700">
            <div className="bg-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-2">Connected Address:</p>
              <p className="font-mono text-white text-sm mb-4">{formatAddress(address!)}</p>
              <button
                onClick={handleDisconnect}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-500 transition-all duration-300"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {navigation.find(n => n.id === activeTab)?.name}
            </h1>
            <p className="text-white/60">
              {activeTab === 'dashboard' && 'Welcome to your HeyZo rewards dashboard'}
              {activeTab === 'rewards' && 'Claim your daily rewards and build your streak'}
              {activeTab === 'pools' && 'View available reward pools and their status'}
              {activeTab === 'profile' && 'Manage your wallet and view your profile'}
            </p>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl max-w-sm w-auto break-words z-50 border border-red-400/30">
          {error}
        </div>
      )}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
