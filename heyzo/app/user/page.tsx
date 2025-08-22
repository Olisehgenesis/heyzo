'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHeyZo } from '../hooks/useHeyZo';
import { formatEther, parseEther, Address } from 'viem';

export default function UserPage() {
  const {
    isConnected,
    isConnecting,
    address,
    chain,
    admin,
    cooldown,
    dayLength,
    getPool,
    getUserInfo,
    getContractBalance,
    claim,
    connect,
    disconnect,
    switchChain,
    error,
    isLoading
  } = useHeyZo();

  const [pools, setPools] = useState<Array<{ token: Address; pool: any }>>([]);
  const [userInfos, setUserInfos] = useState<Array<{ token: Address; info: any }>>([]);
  const [contractBalances, setContractBalances] = useState<Array<{ token: Address; balance: bigint }>>([]);
  const [selectedToken, setSelectedToken] = useState<Address | null>(null);
  const [claimAmount, setClaimAmount] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);

  // Common token addresses (you can add more)
  const commonTokens: Address[] = [
    '0x0000000000000000000000000000000000000000', // Native token (CELO/ETH)
    '0x471EcE3750Da237f93B8E339c536989b8978a438', // CELO token
    '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD
    '0xD8763CBa276a3738E6DE85b4b3b5Cd2dB23fE6b6', // cEUR
  ];

  // Load pools and user info
  const loadPoolsAndUserInfo = useCallback(async () => {
    if (!address) return;

    const poolsData: Array<{ token: Address; pool: any }> = [];
    const userInfosData: Array<{ token: Address; info: any }> = [];
    const balancesData: Array<{ token: Address; balance: bigint }> = [];

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

    // Find the user info for this token
    const userInfo = userInfos.find(ui => ui.token === selectedToken);
    if (!userInfo) return;

    // Use the effective max send amount as the claim amount
    const claimAmount = userInfo.info.effectiveMaxSend;

    setIsClaiming(true);
    try {
      const result = await claim(selectedToken, claimAmount);
      console.log('Claim successful:', result.hash);
      // Reload data after successful claim
      await loadPoolsAndUserInfo();
    } catch (err) {
      console.error('Claim failed:', err);
    } finally {
      setIsClaiming(false);
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

  const formatTime = (seconds: bigint) => {
    const minutes = Number(seconds) / 60;
    if (minutes < 60) return `${Math.floor(minutes)}m`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.floor(hours)}h`;
    const days = hours / 24;
    return `${Math.floor(days)}d`;
  };

  const canClaim = (token: Address) => {
    const userInfo = userInfos.find(ui => ui.token === token);
    if (!userInfo) return true;
    
    const now = BigInt(Math.floor(Date.now() / 1000));
    const lastClaim = userInfo.info.lastClaim;
    const cooldownSeconds = cooldown || BigInt(0);
    
    return now >= lastClaim + cooldownSeconds;
  };

  const getTimeUntilClaim = (token: Address) => {
    const userInfo = userInfos.find(ui => ui.token === token);
    if (!userInfo) return '0s';
    
    const now = BigInt(Math.floor(Date.now() / 1000));
    const lastClaim = userInfo.info.lastClaim;
    const cooldownSeconds = cooldown || BigInt(0);
    const timeLeft = lastClaim + cooldownSeconds - now;
    
    if (timeLeft <= BigInt(0)) return 'Ready to claim';
    return formatTime(timeLeft);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Welcome to HeyZo
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Connect your wallet to start claiming rewards and building your streak!
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">HeyZo User Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Connected:</span> {formatAddress(address!)}
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
              <p className="font-mono text-sm">{cooldown ? formatTime(cooldown) : 'Loading...'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Day Length</p>
              <p className="font-mono text-sm">{dayLength ? formatTime(dayLength) : 'Loading...'}</p>
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

        {/* Available Pools */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Pools</h2>
          {pools.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pools available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map(({ token, pool }) => (
                <div key={token} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
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
                  
                  <div className="space-y-3 mb-4">
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

                  {/* User Info for this token */}
                  {(() => {
                    const userInfo = userInfos.find(ui => ui.token === token);
                    if (!userInfo) return null;
                    
                    return (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Streak:</span>
                            <p className="font-semibold">{userInfo.info.streak.toString()} days</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Effective Max:</span>
                            <p className="font-semibold">{formatEther(userInfo.info.effectiveMaxSend)}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-600 text-sm">Next Claim:</span>
                          <p className={`font-medium ${canClaim(token) ? 'text-green-600' : 'text-orange-600'}`}>
                            {getTimeUntilClaim(token)}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => setSelectedToken(token)}
                    disabled={!canClaim(token) || isLoading}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      canClaim(token) && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Loading...' : canClaim(token) ? 'Claim Now' : 'On Cooldown'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claim Modal */}
        {selectedToken && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Claim {formatTokenName(selectedToken)}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">You're about to claim from the pool.</p>
                <p className="text-sm text-gray-600">
                  This will reset your cooldown timer and potentially increase your streak!
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedToken(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isClaiming ? 'Claiming...' : 'Confirm Claim'}
                </button>
              </div>
            </div>
          </div>
        )}

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
