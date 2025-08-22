'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  createPublicClient, 
  createWalletClient, 
  http,
  encodeFunctionData,
  type PublicClient,
  type WalletClient,
  type Address,
  type Chain
} from 'viem';
import { celo } from 'viem/chains';
import { getReferralTag, submitReferral } from '@divvi/referral-sdk';
import { HeyZoABI } from '../abi/abi';

// Contract address - you'll need to set this to your deployed contract address
//get from env NEXT_PUBLIC_CONTRACT_ADDRESS
const HEYZO_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6135c199480C2198E46F6e1b63Da5bC03ad04e6E') as Address;

// Validate contract address
if (!HEYZO_CONTRACT_ADDRESS || HEYZO_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
  console.warn('Warning: NEXT_PUBLIC_CONTRACT_ADDRESS not set or invalid. Using fallback address.');
}

// Your Divvi Identifier
const DIVVI_CONSUMER_ADDRESS = '0x29D899bB6C539C59ceA731041AF5c15668e88280';

// DRPC HTTP endpoint for Celo
const DRPC_HTTP_ENDPOINT = 'https://celo.drpc.org';

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
  claim: (token: Address, amount: bigint) => Promise<{ hash: string }>;
  setPool: (token: Address, total: bigint, maxSend: bigint, isNative: boolean) => Promise<{ hash: string }>;
  adminSend: (token: Address, to: Address, amount: bigint) => Promise<{ hash: string }>;
  withdraw: (token: Address, amount: bigint) => Promise<{ hash: string }>;
  
  // Utility functions
  readContract: (params: any) => Promise<unknown>;
  writeContract: (params: any) => Promise<{ hash: string }>;
  simulateContract: (params: any) => Promise<unknown>;
  watchContractEvent: (params: any) => () => void;
  
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
      transport: http(DRPC_HTTP_ENDPOINT),
    });
    setPublicClient(client as any);
  }, []);

  // Initialize wallet client and handle connection
  useEffect(() => {
    const initWallet = async () => {
      try {
        // Check if MetaMask is already connected
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const account = accounts[0] as Address;
            setAddress(account);
            setIsConnected(true);
            setChain(celo);
            
            // Create wallet client with DRPC endpoint
            const client = createWalletClient({
              chain: celo,
              transport: http(DRPC_HTTP_ENDPOINT),
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
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('MetaMask not found. Please install MetaMask extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
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
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('MetaMask not found');
      return;
    }

    try {
      await (window as any).ethereum.request({
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
          abi: HeyZoABI,
          functionName: 'admin',
        }),
        publicClient.readContract({
          address: HEYZO_CONTRACT_ADDRESS,
          abi: HeyZoABI,
          functionName: 'cooldown',
        }),
        publicClient.readContract({
          address: HEYZO_CONTRACT_ADDRESS,
          abi: HeyZoABI,
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
        abi: HeyZoABI,
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
        abi: HeyZoABI,
        functionName: 'getUserInfo',
        args: [token], // Only pass token as ABI expects
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
    if (!publicClient) return BigInt(0);

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
      return BigInt(0);
    }
  }, [publicClient]);

  // Helper function to generate referral tag
  const generateReferralTag = useCallback((user: Address) => {
    return getReferralTag({
      user,
      consumer: DIVVI_CONSUMER_ADDRESS,
    });
  }, []);

  // Helper function to submit referral to Divvi
  const submitReferralToDivvi = useCallback(async (txHash: string) => {
    try {
      await submitReferral({
        txHash: txHash as `0x${string}`,
        chainId: celo.id,
      });
    } catch (err) {
      console.error('Failed to submit referral to Divvi:', err);
      // Don't throw error as this shouldn't break the main transaction
    }
  }, []);

  // Claim function
  const claim = useCallback(async (token: Address, amount: bigint): Promise<{ hash: string }> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      // Encode the function call manually and add referral tag
      const functionData = encodeFunctionData({
        abi: HeyZoABI,
        functionName: 'claim',
        args: [token as `0x${string}`, amount],
      });
      
      const dataWithReferral = functionData + referralTag;

      // Send the transaction with referral tag using sendTransaction
      const hash = await walletClient.sendTransaction({
        account: address,
        to: HEYZO_CONTRACT_ADDRESS,
        data: dataWithReferral as `0x${string}`,
        chain: celo,
      });

      // Submit referral to Divvi
      await submitReferralToDivvi(hash);

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, generateReferralTag, submitReferralToDivvi]);

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
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      // Encode the function call manually and add referral tag
      const functionData = encodeFunctionData({
        abi: HeyZoABI,
        functionName: 'setPool',
        args: [token, total, maxSend, isNative],
      });
      
      const dataWithReferral = functionData + referralTag;

      // Send the transaction with referral tag using sendTransaction
      const hash = await walletClient.sendTransaction({
        account: address,
        to: HEYZO_CONTRACT_ADDRESS,
        data: dataWithReferral as `0x${string}`,
        chain: celo,
      });

      // Submit referral to Divvi
      await submitReferralToDivvi(hash);

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, generateReferralTag, submitReferralToDivvi]);

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
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      // Encode the function call manually and add referral tag
      const functionData = encodeFunctionData({
        abi: HeyZoABI,
        functionName: 'adminSend',
        args: [token, to, amount],
      });
      
      const dataWithReferral = functionData + referralTag;

      // Send the transaction with referral tag using sendTransaction
      const hash = await walletClient.sendTransaction({
        account: address,
        to: HEYZO_CONTRACT_ADDRESS,
        data: dataWithReferral as `0x${string}`,
        chain: celo,
      });

      // Submit referral to Divvi
      await submitReferralToDivvi(hash);

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to admin send';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, generateReferralTag, submitReferralToDivvi]);

  // Withdraw function (admin only)
  const withdraw = useCallback(async (token: Address, amount: bigint): Promise<{ hash: string }> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      // Encode the function call manually and add referral tag
      const functionData = encodeFunctionData({
        abi: HeyZoABI,
        functionName: 'withdraw',
        args: [token, amount],
      });
      
      const dataWithReferral = functionData + referralTag;

      // Send the transaction with referral tag using sendTransaction
      const hash = await walletClient.sendTransaction({
        account: address,
        to: HEYZO_CONTRACT_ADDRESS,
        data: dataWithReferral as `0x${string}`,
        chain: celo,
      });

      // Submit referral to Divvi
      await submitReferralToDivvi(hash);

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, generateReferralTag, submitReferralToDivvi]);

  // Utility functions
  const readContract = useCallback(async (params: any) => {
    if (!publicClient) throw new Error('Public client not initialized');
    return publicClient.readContract(params);
  }, [publicClient]);

  const writeContract = useCallback(async (params: any) => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    setIsLoading(true);
    setError(null);
    try {
      const hash = await walletClient.sendTransaction(params);
      await submitReferralToDivvi(hash);
      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write contract';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, submitReferralToDivvi]);

  const simulateContract = useCallback(async (params: any) => {
    if (!publicClient) throw new Error('Public client not initialized');
    return publicClient.simulateContract(params);
  }, [publicClient]);

  const watchContractEvent = useCallback((params: any) => {
    if (!publicClient) throw new Error('Public client not initialized');
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