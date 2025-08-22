// @ts-nocheck


'use client';

import { useState, useEffect } from 'react';
import { useHeyZo } from '../hooks/useHeyZo';
import { formatEther, parseEther, Address } from 'viem';

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
    withdraw,
    connect,
    disconnect,
    error,
    isLoading
  } = useHeyZo();

  const [pools, setPools] = useState<Array<{ token: Address; pool: any }>>([]);
  const [contractBalances, setContractBalances] = useState<Array<{ token: Address; balance: bigint }>>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form states
  const [poolForm, setPoolForm] = useState({
    token: '',
    total: '',
    maxSend: '',
    isNative: false
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

  // Common token addresses
  const commonTokens: Address[] = [
    '0x0000000000000000000000000000000000000000', // Native token (CELO/ETH)
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
    const poolsData: Array<{ token: Address; pool: any }> = [];
    const balancesData: Array<{ token: Address; balance: bigint }> = [];

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
      
      await setPool(
        poolForm.token as Address,
        total,
        maxSend,
        poolForm.isNative
      );
      
      // Reset form and reload data
      setPoolForm({ token: '', total: '', maxSend: '', isNative: false });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to set pool:', err);
    }
  };

  const handleAdminSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.token || !sendForm.to || !sendForm.amount) return;

    try {
      const amount = parseEther(sendForm.amount);
      
      await adminSend(
        sendForm.token as Address,
        sendForm.to as Address,
        amount
      );
      
      // Reset form and reload data
      setSendForm({ token: '', to: '', amount: '' });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to send tokens:', err);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawForm.token || !withdrawForm.amount) return;

    try {
      const amount = parseEther(withdrawForm.amount);
      
      await withdraw(
        withdrawForm.token as Address,
        amount
      );
      
      // Reset form and reload data
      setWithdrawForm({ token: '', amount: '' });
      await loadPoolsAndBalances();
    } catch (err) {
      console.error('Failed to withdraw:', err);
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTokenName = (address: Address) => {
    if (address === '0x0000000000000000000000000000000000000000') return 'CELO/ETH';
    if (address === '0x471EcE3750Da237f93B8E339c536989b8978a438') return 'CELO';
    if (address === '0x765DE816845861e75A25fCA122bb6898B8B1282a') return 'cUSD';
    if (address === '0xD8763CBa276a3738E6DE85b4b3b5Cd2dB23fE6b6') return 'cEUR';
    return formatAddress(address);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            HeyZo Admin Panel
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Connect your admin wallet to manage pools and tokens.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
            Access Denied
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Only the contract admin can access this panel.
          </p>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Connected Address:</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{formatAddress(address!)}</p>
            <p className="text-sm text-gray-500 mt-2">Admin Address:</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{admin ? formatAddress(admin) : 'Loading...'}</p>
          </div>
          <button
            onClick={disconnect}
            className="w-full mt-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">HeyZo Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Admin:</span> {formatAddress(address!)}
              </div>
              <button
                onClick={disconnect}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contract Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Admin</p>
              <p className="font-mono text-sm">{admin ? formatAddress(admin) : 'Loading...'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Cooldown</p>
              <p className="font-mono text-sm">{cooldown ? `${Number(cooldown) / 60} minutes` : 'Loading...'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Day Length</p>
              <p className="font-mono text-sm">{dayLength ? `${Number(dayLength) / 86400} days` : 'Loading...'}</p>
            </div>
          </div>
        </div>

        {/* Contract Balances */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contract Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contractBalances.map(({ token, balance }) => (
              <div key={token} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{formatTokenName(token)}</h3>
                <p className="text-lg font-bold text-gray-900">
                  {formatEther(balance)} {token === '0x0000000000000000000000000000000000000000' ? 'CELO' : 'tokens'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatAddress(token)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Pools */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Pools</h2>
          {pools.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pools configured</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map(({ token, pool }) => (
                <div key={token} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatTokenName(token)}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pool.isNative ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pool.isNative ? 'Native' : 'ERC20'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Available:</span>
                      <span className="font-mono font-medium">
                        {formatEther(pool.total)} {pool.isNative ? 'CELO' : 'tokens'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Per Claim:</span>
                      <span className="font-mono font-medium">
                        {formatEther(pool.maxSend)} {pool.isNative ? 'CELO' : 'tokens'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Set Pool */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create/Update Pool</h3>
            <p className="text-sm text-gray-600 mb-4">
              Only admins can create and manage pools. Set total allocation and max claim amounts.
            </p>
            <form onSubmit={handleSetPool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Address</label>
                <select
                  value={poolForm.token}
                  onChange={(e) => setPoolForm({ ...poolForm, token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                <input
                  type="text"
                  value={poolForm.total}
                  onChange={(e) => setPoolForm({ ...poolForm, total: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Per Claim</label>
                <input
                  type="text"
                  value={poolForm.maxSend}
                  onChange={(e) => setPoolForm({ ...poolForm, maxSend: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNative"
                  checked={poolForm.isNative}
                  onChange={(e) => setPoolForm({ ...poolForm, isNative: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isNative" className="ml-2 block text-sm text-gray-900">
                  Native Token (CELO/ETH)
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Setting Pool...' : 'Set Pool'}
              </button>
            </form>
          </div>

          {/* Admin Send */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribute Tokens</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send tokens directly to users from the pool. This reduces the pool's total allocation.
            </p>
            <form onSubmit={handleAdminSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Address</label>
                <select
                  value={sendForm.token}
                  onChange={(e) => setSendForm({ ...sendForm, token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">To Address</label>
                <input
                  type="text"
                  value={sendForm.to}
                  onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="text"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Tokens'}
              </button>
            </form>
          </div>

          {/* Withdraw */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
            <p className="text-sm text-gray-600 mb-4">
              Withdraw tokens from pools back to admin wallet. Only available to contract admin.
            </p>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Address</label>
                <select
                  value={withdrawForm.token}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="text"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </form>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
