

'use client';

import { useState, useEffect } from 'react';
import { useHeyZo } from '../hooks/useHeyZo';
import { formatEther, parseEther } from 'viem';

// Contract address from environment
const HEYZO_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xaD8b79865B640d76B734988C6A795249Ad4cF86e') as `0x${string}`;
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  Users, 
  Wallet, 
  BarChart3, 
  Plus,
  Send,
  Download,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Heart, 
  TrendingUp
} from 'lucide-react';

export default function AdminPage() {
  const {
    isConnected,
    isConnecting,
    address,
    chain,
    admin,
    cooldown,
    dayLength,
    getPool,
    getContractBalance,
    setPool,
    adminSend,
    adminBatchSend,
    withdraw,
    fundPool,
    topUp,
    increasePool,
    approveToken,
    getTokenAllowance,
    connect: handleConnect,
    disconnect: handleDisconnect,
    error,
    isLoading
  } = useHeyZo();

  const [pools, setPools] = useState<Array<{ token: `0x${string}`; pool: any }>>([]);
  const [contractBalances, setContractBalances] = useState<Array<{ token: `0x${string}`; balance: bigint }>>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [actionTab, setActionTab] = useState('setPool');
  const [transactionStatus, setTransactionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    hash?: string;
  }>({ type: null, message: '' });
  
  // Form states
  const [poolForm, setPoolForm] = useState({
    token: '',
    total: '',
    maxSend: ''
  });
  
  const [sendForm, setSendForm] = useState({
    token: '',
    to: '',
    amount: ''
  });
  
  const [withdrawForm, setWithdrawForm] = useState({
    token: '',
    amount: ''
  });

  const [fundPoolForm, setFundPoolForm] = useState({
    token: '',
    amount: '',
    isNative: false
  });

  const [topUpForm, setTopUpForm] = useState({
    token: '',
    amount: ''
  });

  const [increasePoolForm, setIncreasePoolForm] = useState({
    token: '',
    amount: ''
  });

  const [batchSendForm, setBatchSendForm] = useState({
    token: '',
    recipients: '',
    maxSend: '',
    isNative: false
  });

  // Common token addresses
  const commonTokens: `0x${string}`[] = [
    '0x471EcE3750Da237f93B8E339c536989b8978a438', // CELO token
    '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD
    '0xD8763CBa276a3738E6DE85b4b3b5Cd2dB23fE6b6', // cEUR
  ];

  // Check if connected user is admin
  useEffect(() => {
    if (isConnected && address && admin) {
      setIsAdmin(address.toLowerCase() === admin.toLowerCase());
    }
  }, [isConnected, address, admin]);

  // Load pools and contract balances
  useEffect(() => {
    if (isConnected && address) {
      loadPoolsAndBalances();
    }
  }, [isConnected, address]);

  const loadPoolsAndBalances = async () => {
    const poolsData: Array<{ token: `0x${string}`; pool: any }> = [];
    const balancesData: Array<{ token: `0x${string}`; balance: bigint }> = [];

    for (const token of commonTokens) {
      try {
        // Load pool data
        const pool = await getPool(token);
        if (pool) {
          poolsData.push({ token, pool });
        }

        // Load contract balance
        const balance = await getContractBalance(token);
        balancesData.push({ token, balance });
      } catch (err) {
        console.error(`Failed to load data for token ${token}:`, err);
      }
    }

    setPools(poolsData);
    setContractBalances(balancesData);
  };

  const handleSetPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poolForm.token || !poolForm.total || !poolForm.maxSend) return;

    try {
      const total = parseEther(poolForm.total);
      const maxSend = parseEther(poolForm.maxSend);
      
      // Check if we have enough tokens
      const tokenBalance = await getContractBalance(poolForm.token as `0x${string}`);
      if (tokenBalance < total) {
        setTransactionStatus({
          type: 'error',
          message: `Not enough tokens. Available: ${formatEther(tokenBalance)}, Required: ${poolForm.total}`
        });
        return;
      }
      
      setTransactionStatus({ type: null, message: '' });
      const result = await setPool(
        poolForm.token as `0x${string}`,
        total,
        maxSend,
        false // isNative is always false since we don't support native tokens
      );
      
      setTransactionStatus({
        type: 'success',
        message: 'Pool created successfully!',
        hash: result.hash
      });
      
      // Reset form and reload data
      setPoolForm({ token: '', total: '', maxSend: '' });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to set pool:', err);
      setTransactionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to set pool'
      });
    }
  };

  const handleAdminSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.token || !sendForm.to || !sendForm.amount) return;

    try {
      const amount = parseEther(sendForm.amount);
      
      // Check if we have enough tokens
      const tokenBalance = await getContractBalance(sendForm.token as `0x${string}`);
      if (tokenBalance < amount) {
        setTransactionStatus({
          type: 'error',
          message: `Not enough tokens. Available: ${formatEther(tokenBalance)}, Required: ${sendForm.amount}`
        });
        return;
      }
      
      setTransactionStatus({ type: null, message: '' });
      const result = await adminSend(
        sendForm.token as `0x${string}`,
        sendForm.to as `0x${string}`,
        amount
      );
      
      setTransactionStatus({
        type: 'success',
        message: 'Tokens sent successfully!',
        hash: result.hash
      });
      
      // Reset form and reload data
      setSendForm({ token: '', to: '', amount: '' });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to send tokens:', err);
      setTransactionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to send tokens'
      });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawForm.token || !withdrawForm.amount) return;

    try {
      const amount = parseEther(withdrawForm.amount);
      
      setTransactionStatus({ type: null, message: '' });
      const result = await withdraw(
        withdrawForm.token as `0x${string}`,
        amount
      );
      
      setTransactionStatus({
        type: 'success',
        message: 'Withdrawal successful!',
        hash: result.hash
      });
      
      // Reset form and reload data
      setWithdrawForm({ token: '', amount: '' });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to withdraw:', err);
      setTransactionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to withdraw'
      });
    }
  };

  const handleFundPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundPoolForm.token || !fundPoolForm.amount) return;

    try {
      const amount = parseEther(fundPoolForm.amount);
      
      setTransactionStatus({ type: null, message: '' });
      const result = await fundPool(
        fundPoolForm.token as `0x${string}`,
        amount,
        fundPoolForm.isNative
      );
      
      setTransactionStatus({
        type: 'success',
        message: 'Pool funded successfully!',
        hash: result.hash
      });
      
      // Reset form and reload data
      setFundPoolForm({ token: '', amount: '', isNative: false });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to fund pool:', err);
      setTransactionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to fund pool'
      });
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpForm.token || !topUpForm.amount) return;

    try {
      const amount = parseEther(topUpForm.amount);
      
      setTransactionStatus({ type: null, message: '' });
      const result = await topUp(
        topUpForm.token as `0x${string}`,
        amount
      );
      
      setTransactionStatus({
        type: 'success',
        message: 'Top up successful!',
        hash: result.hash
      });
      
      // Reset form and reload data
      setTopUpForm({ token: '', amount: '' });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to top up:', err);
      setTransactionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to top up'
      });
    }
  };

  const handleIncreasePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!increasePoolForm.token || !increasePoolForm.amount) return;

    try {
      const amount = parseEther(increasePoolForm.amount);
      
      setTransactionStatus({ type: null, message: '' });
      const result = await increasePool(
        increasePoolForm.token as `0x${string}`,
        amount
      );
      
      setTransactionStatus({
        type: 'success',
        message: 'Pool increased successfully!',
        hash: result.hash
      });
      
      // Reset form and reload data
      setIncreasePoolForm({ token: '', amount: '' });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to increase pool:', err);
      setTransactionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to increase pool'
      });
    }
  };

  const handleBatchSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchSendForm.token || !batchSendForm.recipients || !batchSendForm.maxSend) return;

    try {
      const maxSend = parseEther(batchSendForm.maxSend);
      
      // Parse recipients from comma-separated string
      const recipients = batchSendForm.recipients
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0) as `0x${string}`[];
      
      if (recipients.length === 0) {
        setTransactionStatus({
          type: 'error',
          message: 'Please provide at least one recipient address'
        });
        return;
      }
      
      setTransactionStatus({ type: null, message: '' });
      const result = await adminBatchSend(
        batchSendForm.isNative ? '0x0000000000000000000000000000000000000000' as `0x${string}` : batchSendForm.token as `0x${string}`,
        recipients,
        maxSend
      );
      
      setTransactionStatus({
        type: 'success',
        message: `Batch send successful! Sent to ${recipients.length} recipients`,
        hash: result.hash
      });
      
      // Reset form and reload data
      setBatchSendForm({ token: '', recipients: '', maxSend: '', isNative: false });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to batch send:', err);
      setTransactionStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to batch send'
      });
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              HeyZo Admin
            </h1>
            <p className="text-gray-300 mb-8">
              Connect your admin wallet to manage pools and tokens
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="group relative w-full bg-gray-700 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <X className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-300 mb-8">
              Only the contract admin can access this panel
            </p>
            <div className="space-y-4 mb-8">
              <div className="bg-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Connected Address:</p>
                <p className="font-mono text-white font-medium">{formatAddress(address!)}</p>
              </div>
              <div className="bg-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Admin Address:</p>
                <p className="font-mono text-white font-medium">{admin ? formatAddress(admin) : 'Loading...'}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 transition-all duration-300"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'bg-gray-700' },
    { id: 'pools', name: 'Pools', icon: BarChart3, color: 'bg-gray-700' },
    { id: 'actions', name: 'Actions', icon: Settings, color: 'bg-gray-700' },
    { id: 'balances', name: 'Balances', icon: Wallet, color: 'bg-gray-700' },
  ];

  const actionTabs = [
    { id: 'setPool', name: 'Create Pool', icon: Plus },
    { id: 'adminSend', name: 'Send Tokens', icon: Send },
    { id: 'batchSend', name: 'Batch Send', icon: Users },
    { id: 'withdraw', name: 'Withdraw', icon: Download },
    { id: 'fundPool', name: 'Fund Pool', icon: Heart },
    { id: 'topUp', name: 'Top Up', icon: Plus },
    { id: 'increasePool', name: 'Increase Pool', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Admin</h3>
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-mono text-2xl font-bold text-white">{admin ? formatAddress(admin) : 'Loading...'}</p>
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Cooldown</h3>
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-white">{cooldown ? `${Number(cooldown) / 60} minutes` : 'Loading...'}</p>
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Day Length</h3>
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-white">{dayLength ? `${Number(dayLength) / 86400} days` : 'Loading...'}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Total Pools</p>
                  <p className="text-2xl font-bold text-white">{pools.length}</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {contractBalances.reduce((sum, { balance }) => sum + Number(formatEther(balance)), 0).toFixed(2)} tokens
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'pools':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Current Pools</h3>
              {pools.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No pools configured</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pools.map(({ token, pool }) => (
                    <div key={token} className="bg-gray-700 rounded-2xl p-6 border border-gray-600 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                          {formatTokenName(token)}
                        </h4>
                        <span className="px-3 py-1 bg-gray-600 rounded-full text-xs font-medium text-white">
                          {pool.isNative ? 'Native' : 'ERC20'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Available:</span>
                          <span className="font-mono font-medium text-white">
                            {formatEther(pool.total)} tokens
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Per Claim:</span>
                          <span className="font-mono font-medium text-white">
                            {formatEther(pool.maxSend)} tokens
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'actions':
        return (
          <div className="space-y-6">
            {/* Action Tabs */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <div className="flex space-x-2">
                {actionTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActionTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                        actionTab === tab.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transaction Status */}
            {transactionStatus.type && (
              <div className={`p-4 rounded-xl border ${
                transactionStatus.type === 'success' 
                  ? 'bg-green-900/50 border-green-700 text-green-200' 
                  : 'bg-red-900/50 border-red-700 text-red-200'
              }`}>
                <div className="flex items-center">
                  {transactionStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  <span>{transactionStatus.message}</span>
                </div>
                {transactionStatus.hash && (
                  <p className="text-sm mt-2 opacity-80">
                    Hash: {transactionStatus.hash}
                  </p>
                )}
              </div>
            )}

            {/* Action Content */}
            {actionTab === 'setPool' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create/Update Pool</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Only admins can create and manage pools. Set total allocation and max claim amounts.
                </p>
                <form onSubmit={handleSetPool} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                    <select
                      value={poolForm.token}
                      onChange={(e) => setPoolForm({ ...poolForm, token: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Total Amount</label>
                    <input
                      type="text"
                      value={poolForm.total}
                      onChange={(e) => setPoolForm({ ...poolForm, total: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Per Claim</label>
                    <input
                      type="text"
                      value={poolForm.maxSend}
                      onChange={(e) => setPoolForm({ ...poolForm, maxSend: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Setting Pool...' : 'Set Pool'}
                  </button>
                </form>
              </div>
            )}

            {actionTab === 'adminSend' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Distribute Tokens</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Send tokens directly to users from the pool. This reduces the pool's total allocation.
                </p>
                <form onSubmit={handleAdminSend} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                    <select
                      value={sendForm.token}
                      onChange={(e) => setSendForm({ ...sendForm, token: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">To Address</label>
                    <input
                      type="text"
                      value={sendForm.to}
                      onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                    <input
                      type="text"
                      value={sendForm.amount}
                      onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Tokens'}
                  </button>
                </form>
              </div>
            )}

            {actionTab === 'withdraw' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Withdraw Funds</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Withdraw tokens from pools back to admin wallet. Only available to contract admin.
                </p>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                    <select
                      value={withdrawForm.token}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, token: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                    <input
                      type="text"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </form>
              </div>
            )}

            {actionTab === 'fundPool' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Fund Pool</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Add tokens to existing pools. This increases the total allocation available for users to claim.
                </p>
                <form onSubmit={handleFundPool} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                    <select
                      value={fundPoolForm.token}
                      onChange={(e) => setFundPoolForm({ ...fundPoolForm, token: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                    <input
                      type="text"
                      value={fundPoolForm.amount}
                      onChange={(e) => setFundPoolForm({ ...fundPoolForm, amount: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isNative"
                      checked={fundPoolForm.isNative}
                      onChange={(e) => setFundPoolForm({ ...fundPoolForm, isNative: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="isNative" className="ml-2 text-sm text-gray-300">
                      Native Token (CELO/ETH)
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Funding Pool...' : 'Fund Pool'}
                  </button>
                </form>
              </div>
            )}

                        {actionTab === 'topUp' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Top Up Contract</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Add tokens to the contract reserves. This is a general deposit that can later be allocated to pools.
                </p>
                <form onSubmit={handleTopUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                    <select
                      value={topUpForm.token}
                      onChange={(e) => setTopUpForm({ ...topUpForm, token: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                    <input
                      type="text"
                      value={topUpForm.amount}
                      onChange={(e) => setTopUpForm({ ...topUpForm, amount: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>


                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Top Up Contract'}
                  </button>
                </form>
              </div>
            )}

            {actionTab === 'increasePool' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Increase Pool</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Move tokens from contract reserves into a pool's total allocation. This increases the amount available for users to claim.
                </p>
                <form onSubmit={handleIncreasePool} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                    <select
                      value={increasePoolForm.token}
                      onChange={(e) => setIncreasePoolForm({ ...increasePoolForm, token: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
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
                    <label className="block text-gray-300 mb-2">Amount</label>
                    <input
                      type="text"
                      value={increasePoolForm.amount}
                      onChange={(e) => setIncreasePoolForm({ ...increasePoolForm, amount: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Increasing Pool...' : 'Increase Pool'}
                  </button>
                </form>
              </div>
            )}

            {actionTab === 'batchSend' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Batch Send Tokens</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Send tokens to multiple recipients from a single pool. This reduces the pool's total allocation.
                </p>
                <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4 mb-6">
                  <p className="text-blue-200 text-sm">
                    <strong>Note:</strong> Each recipient will receive a random amount between 0.01 and the max amount specified. 
                    The total distributed will be deducted from the pool's allocation.
                  </p>
                </div>
                <form onSubmit={handleBatchSend} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                    <select
                      value={batchSendForm.token}
                      onChange={(e) => setBatchSendForm({ ...batchSendForm, token: e.target.value })}
                      className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white ${
                        batchSendForm.isNative ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={batchSendForm.isNative}
                    >
                      <option value="">Select Token</option>
                      {commonTokens.map(token => (
                        <option key={token} value={token}>
                          {formatTokenName(token)} ({formatAddress(token)})
                        </option>
                      ))}
                    </select>
                    {batchSendForm.isNative && (
                      <p className="text-sm text-gray-400 mt-1">
                        Using native CELO/ETH tokens
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Addresses (comma-separated)</label>
                    <input
                      type="text"
                      value={batchSendForm.recipients}
                      onChange={(e) => setBatchSendForm({ ...batchSendForm, recipients: e.target.value })}
                      placeholder="0x1234567890123456789012345678901234567890, 0x9876543210987654321098765432109876543210"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                    {batchSendForm.recipients && (
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Wallets: {batchSendForm.recipients.split(',').filter(addr => addr.trim().length > 0).length}
                        </span>
                        {batchSendForm.maxSend && (
                          <span className="text-blue-400">
                            Max Total: {formatEther(parseEther(batchSendForm.maxSend) * BigInt(batchSendForm.recipients.split(',').filter(addr => addr.trim().length > 0).length))} tokens
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Per Claim</label>
                    <input
                      type="text"
                      value={batchSendForm.maxSend}
                      onChange={(e) => setBatchSendForm({ ...batchSendForm, maxSend: e.target.value })}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isNative"
                      checked={batchSendForm.isNative}
                      onChange={(e) => setBatchSendForm({ ...batchSendForm, isNative: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="isNative" className="ml-2 text-sm text-gray-300">
                      Native Token (CELO/ETH)
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Batch Sending...' : 'Batch Send Tokens'}
                  </button>
                </form>
              </div>
            )}
          </div>
        );
        
      case 'balances':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Contract Balances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contractBalances.map(({ token, balance }) => (
                  <div key={token} className="bg-gray-700 rounded-2xl p-6 border border-gray-600 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">{formatTokenName(token)}</h4>
                      <Wallet className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">
                      {formatEther(balance)} tokens
                    </p>
                    <p className="text-sm text-gray-400 font-mono">{formatAddress(token)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-white transition-all duration-300 shadow-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">HeyZo Admin</h1>
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
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Admin Address:</p>
              <p className="font-mono text-gray-800 text-sm mb-4">{formatAddress(address!)}</p>
              <button
                onClick={handleDisconnect}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition-all duration-300"
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
            <p className="text-gray-400">
              Manage your HeyZo contract pools and distributions
            </p>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 text-white px-6 py-3 rounded-2xl shadow-2xl max-w-sm w-auto break-words z-50 border border-red-700">
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
