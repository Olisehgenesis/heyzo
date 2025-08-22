'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  createPublicClient, 
  createWalletClient, 
  http,
  type PublicClient,
  type WalletClient,
  type Address,
  type Chain,
  type ReadContractParameters,
  type WriteContractParameters,
  type SimulateContractParameters,
  type WatchContractEventParameters
} from 'viem';
import { celo } from 'viem/chains';

// Contract ABI for HeyZo contract
const HEYZO_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'adminSend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'cooldown',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'dayLength',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'token', type: 'address' }
    ],
    name: 'getUserInfo',
    outputs: [
      { name: 'streak', type: 'uint256' },
      { name: 'effectiveMaxSend', type: 'uint256' },
      { name: 'lastClaim', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'token', type: 'address' }
    ],
    name: 'pools',
    outputs: [
      { name: 'total', type: 'uint256' },
      { name: 'maxSend', type: 'uint256' },
      { name: 'isNative', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'total', type: 'uint256' },
      { name: 'maxSend', type: 'uint256' },
      { name: 'isNative', type: 'bool' }
    ],
    name: 'setPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    stateMutability: 'payable',
    type: 'receive'
  }
] as const;

// Contract address - you'll need to set this to your deployed contract address
const HEYZO_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

export interface Pool {
  total: bigint;
  maxSend: bigint;
  isNative: boolean;
}

export interface UserInfo {
  streak: bigint;
  effectiveMaxSend: bigint;
  lastClaim: bigint;
}

export interface UseHeyZoReturn {
  // Clients
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: Address | undefined;
  chain: Chain | undefined;
  
  // Contract state
  admin: Address | null;
  cooldown: bigint | null;
  dayLength: bigint | null;
  
  // Functions
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  
  // Contract read functions
  getPool: (token: Address) => Promise<Pool | null>;
  getUserInfo: (user: Address, token: Address) => Promise<UserInfo | null>;
  getContractBalance: (token: Address) => Promise<bigint>;
  
  // Contract write functions
  claim: (token: Address) => Promise<{ hash: string }>;
  setPool: (token: Address, total: bigint, maxSend: bigint, isNative: boolean) => Promise<{ hash: string }>;
  adminSend: (token: Address, to: Address, amount: bigint) => Promise<{ hash: string }>;
  withdraw: (token: Address, amount: bigint) => Promise<{ hash: string }>;
  
  // Utility functions
  readContract: <TAbi extends readonly unknown[], TFunctionName extends string>(
    params: ReadContractParameters<TAbi, TFunctionName>
  ) => Promise<unknown>;
  writeContract: <TAbi extends readonly unknown[], TFunctionName extends string>(
    params: WriteContractParameters<TAbi, TFunctionName>
  ) => Promise<{ hash: string }>;
  simulateContract: <TAbi extends readonly unknown[], TFunctionName extends string>(
    params: SimulateContractParameters<TAbi, TFunctionName>
  ) => Promise<unknown>;
  watchContractEvent: <TAbi extends readonly unknown[], TEventName extends string>(
    params: WatchContractEventParameters<TAbi, TEventName>
  ) => () => void;
  
  // Error handling
  error: string | null;
  isLoading: boolean;
}

export function useHeyZo(): UseHeyZoReturn {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<Address | undefined>();
  const [chain, setChain] = useState<Chain | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Contract state
  const [admin, setAdmin] = useState<Address | null>(null);
  const [cooldown, setCooldown] = useState<bigint | null>(null);
  const [dayLength, setDayLength] = useState<bigint | null>(null);

  // Initialize public client
  useEffect(() => {
    const client = createPublicClient({
      chain: celo, // Default to Celo mainnet
      transport: http(),
    });
    setPublicClient(client);
  }, []);

  // Initialize wallet client and handle connection
  useEffect(() => {
    const initWallet = async () => {
      try {
        // Check if MetaMask is already connected
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const account = accounts[0] as Address;
            setAddress(account);
            setIsConnected(true);
            setChain(celo);
            
            // Create wallet client
            const client = createWalletClient({
              chain: celo,
              transport: http(),
              account,
            });
            setWalletClient(client);
          }
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
      }
    };

    initWallet();
  }, []);

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not found. Please install MetaMask extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0] as Address;
      
      // Create wallet client
      const client = createWalletClient({
        chain: celo, // You can make this dynamic based on chainId
        transport: http(),
        account,
      });
      
      setWalletClient(client);
      setAddress(account);
      setIsConnected(true);
      setChain(celo);
      
      // Load contract state
      await loadContractState();
      
    } catch (err) {
      console.error('Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    setWalletClient(null);
    setAddress(undefined);
    setIsConnected(false);
    setChain(undefined);
    setAdmin(null);
    setCooldown(null);
    setDayLength(null);
  }, []);

  // Switch chain
  const switchChain = useCallback(async (chainId: number) => {
    if (!window.ethereum) {
      setError('MetaMask not found');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (err) {
      console.error('Failed to switch chain:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch chain');
    }
  }, []);

  // Load contract state
  const loadContractState = useCallback(async () => {
    if (!publicClient) return;

    try {
      const [adminResult, cooldownResult, dayLengthResult] = await Promise.all([
        publicClient.readContract({
          address: HEYZO_CONTRACT_ADDRESS,
          abi: HEYZO_ABI,
          functionName: 'admin',
        }),
        publicClient.readContract({
          address: HEYZO_CONTRACT_ADDRESS,
          abi: HEYZO_ABI,
          functionName: 'cooldown',
        }),
        publicClient.readContract({
          address: HEYZO_CONTRACT_ADDRESS,
          abi: HEYZO_ABI,
          functionName: 'dayLength',
        }),
      ]);

      setAdmin(adminResult as Address);
      setCooldown(cooldownResult as bigint);
      setDayLength(dayLengthResult as bigint);
    } catch (err) {
      console.error('Failed to load contract state:', err);
    }
  }, [publicClient]);

  // Get pool information
  const getPool = useCallback(async (token: Address): Promise<Pool | null> => {
    if (!publicClient) return null;

    try {
      const result = await publicClient.readContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HEYZO_ABI,
        functionName: 'pools',
        args: [token],
      });

      const poolResult = result as [bigint, bigint, boolean];
      return {
        total: poolResult[0],
        maxSend: poolResult[1],
        isNative: poolResult[2],
      };
    } catch (err) {
      console.error('Failed to get pool:', err);
      return null;
    }
  }, [publicClient]);

  // Get user info
  const getUserInfo = useCallback(async (user: Address, token: Address): Promise<UserInfo | null> => {
    if (!publicClient) return null;

    try {
      const result = await publicClient.readContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HEYZO_ABI,
        functionName: 'getUserInfo',
        args: [user, token],
      });

      const userInfoResult = result as [bigint, bigint, bigint];
      return {
        streak: userInfoResult[0],
        effectiveMaxSend: userInfoResult[1],
        lastClaim: userInfoResult[2],
      };
    } catch (err) {
      console.error('Failed to get user info:', err);
      return null;
    }
  }, [publicClient]);

  // Get contract balance for a token
  const getContractBalance = useCallback(async (token: Address): Promise<bigint> => {
    if (!publicClient) return 0n;

    try {
      if (token === '0x0000000000000000000000000000000000000000') {
        // Native token balance
        const balance = await publicClient.getBalance({ address: HEYZO_CONTRACT_ADDRESS });
        return balance;
      } else {
        // ERC20 token balance
        const balance = await publicClient.readContract({
          address: token,
          abi: [
            {
              inputs: [{ name: 'account', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function'
            }
          ],
          functionName: 'balanceOf',
          args: [HEYZO_CONTRACT_ADDRESS],
        });
        return balance as bigint;
      }
    } catch (err) {
      console.error('Failed to get contract balance:', err);
      return 0n;
    }
  }, [publicClient]);

  // Claim function
  const claim = useCallback(async (token: Address): Promise<{ hash: string }> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HEYZO_ABI,
        functionName: 'claim',
        args: [token],
        account: address,
        chain: celo,
      });

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address]);

  // Set pool function (admin only)
  const setPool = useCallback(async (
    token: Address, 
    total: bigint, 
    maxSend: bigint, 
    isNative: boolean
  ): Promise<{ hash: string }> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HEYZO_ABI,
        functionName: 'setPool',
        args: [token, total, maxSend, isNative],
        account: address,
        chain: celo,
      });

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address]);

  // Admin send function (admin only)
  const adminSend = useCallback(async (
    token: Address, 
    to: Address, 
    amount: bigint
  ): Promise<{ hash: string }> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HEYZO_ABI,
        functionName: 'adminSend',
        args: [token, to, amount],
        account: address,
        chain: celo,
      });

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to admin send';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address]);

  // Withdraw function (admin only)
  const withdraw = useCallback(async (token: Address, amount: bigint): Promise<{ hash: string }> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HEYZO_ABI,
        functionName: 'withdraw',
        args: [token, amount],
        account: address,
        chain: celo,
      });

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address]);

  // Generic read contract function
  const readContract = useCallback(async <TAbi extends readonly unknown[], TFunctionName extends string>(
    params: ReadContractParameters<TAbi, TFunctionName>
  ) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    return await publicClient.readContract(params);
  }, [publicClient]);

  // Generic write contract function
  const writeContract = useCallback(async <TAbi extends readonly unknown[], TFunctionName extends string>(
    params: WriteContractParameters<TAbi, TFunctionName>
  ): Promise<{ hash: string }> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    const hash = await walletClient.writeContract({
      ...params,
      account: address,
      chain: celo,
    });

    return { hash };
  }, [walletClient, address]);

  // Generic simulate contract function
  const simulateContract = useCallback(async <TAbi extends readonly unknown[], TFunctionName extends string>(
    params: SimulateContractParameters<TAbi, TFunctionName>
  ) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    return await publicClient.simulateContract(params);
  }, [publicClient]);

  // Generic watch contract event function
  const watchContractEvent = useCallback(<TAbi extends readonly unknown[], TEventName extends string>(
    params: WatchContractEventParameters<TAbi, TEventName>
  ) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    return publicClient.watchContractEvent(params);
  }, [publicClient]);

  // Load contract state when connected
  useEffect(() => {
    if (isConnected && publicClient) {
      loadContractState();
    }
  }, [isConnected, publicClient, loadContractState]);

  return {
    // Clients
    publicClient,
    walletClient,
    
    // Connection state
    isConnected,
    isConnecting,
    address,
    chain,
    
    // Contract state
    admin,
    cooldown,
    dayLength,
    
    // Functions
    connect,
    disconnect,
    switchChain,
    
    // Contract read functions
    getPool,
    getUserInfo,
    getContractBalance,
    
    // Contract write functions
    claim,
    setPool,
    adminSend,
    withdraw,
    
    // Utility functions
    readContract,
    writeContract,
    simulateContract,
    watchContractEvent,
    
    // Error handling
    error,
    isLoading,
  };
}