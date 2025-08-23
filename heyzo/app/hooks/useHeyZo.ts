'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt
} from 'wagmi';
import { celo } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { getReferralTag, submitReferral } from '@divvi/referral-sdk';
import { HeyZoABI } from '../abi/abi';
import { ERC20ABI } from '../abi/erc20';

// Contract address - you'll need to set this to your deployed contract address
//get from env NEXT_PUBLIC_CONTRACT_ADDRESS
const HEYZO_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xaD8b79865B640d76B734988C6A795249Ad4cF86e') as `0x${string}`;

// Validate contract address
if (!HEYZO_CONTRACT_ADDRESS || HEYZO_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
  console.warn('Warning: NEXT_PUBLIC_CONTRACT_ADDRESS not set or invalid. Using fallback address.');
}

// Your Divvi Identifier
const DIVVI_CONSUMER_ADDRESS = '0x29D899bB6C539C59ceA731041AF5c15668e88280' as `0x${string}`;

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
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: `0x${string}` | undefined;
  chain: any;
  
  // Contract state
  admin: `0x${string}` | null;
  cooldown: bigint | null;
  dayLength: bigint | null;
  
  // Functions
  connect: () => void;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  
  // Contract read functions
  getPool: (token: `0x${string}`) => Promise<Pool | null>;
  getUserInfo: (user: `0x${string}`, token: `0x${string}`) => Promise<UserInfo | null>;
  getContractBalance: (token: `0x${string}`) => Promise<bigint>;
  
  // Contract write functions
  claim: (token: `0x${string}`, amount: bigint) => Promise<{ hash: string }>;
  setPool: (token: `0x${string}`, total: bigint, maxSend: bigint, isNative: boolean) => Promise<{ hash: string }>;
  adminSend: (token: `0x${string}`, to: `0x${string}`, amount: bigint) => Promise<{ hash: string }>;
  withdraw: (token: `0x${string}`, amount: bigint) => Promise<{ hash: string }>;
  fundPool: (token: `0x${string}`, amount: bigint, isNative: boolean) => Promise<{ hash: string }>;
  topUp: (token: `0x${string}`, amount: bigint) => Promise<{ hash: string }>;
  increasePool: (token: `0x${string}`, amount: bigint) => Promise<{ hash: string }>;
  
  // ERC20 functions
  approveToken: (token: `0x${string}`, spender: `0x${string}`, amount: bigint) => Promise<{ hash: string }>;
  getTokenAllowance: (token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`) => Promise<bigint>;
  
  // Error handling
  error: string | null;
  isLoading: boolean;
}

export function useHeyZo(): UseHeyZoReturn {
  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  
  // Write contract hooks
  const { writeContractAsync: writeClaimAsync } = useWriteContract();
  const { writeContractAsync: writeSetPoolAsync } = useWriteContract();
  const { writeContractAsync: writeAdminSendAsync } = useWriteContract();
  const { writeContractAsync: writeWithdrawAsync } = useWriteContract();
  const { writeContractAsync: writeFundPoolAsync } = useWriteContract();
  const { writeContractAsync: writeTopUpAsync } = useWriteContract();
  const { writeContractAsync: writeIncreasePoolAsync } = useWriteContract();
  const { writeContractAsync } = useWriteContract();
  
  // Local state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Contract state
  const [admin, setAdmin] = useState<`0x${string}` | null>(null);
  const [cooldown, setCooldown] = useState<bigint | null>(null);
  const [dayLength, setDayLength] = useState<bigint | null>(null);

  // Load contract state when connected
  useEffect(() => {
    if (isConnected && publicClient) {
      loadContractState();
    }
  }, [isConnected, publicClient]);

  // Load contract state using Wagmi
  const loadContractState = useCallback(async () => {
    if (!publicClient) return;

    try {
      // Load admin
      const adminResult = await publicClient.readContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'admin',
      });
      setAdmin(adminResult as `0x${string}`);

      // Load cooldown
      const cooldownResult = await publicClient.readContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'cooldown',
      });
      setCooldown(cooldownResult as bigint);

      // Load dayLength
      const dayLengthResult = await publicClient.readContract({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'dayLength',
      });
      setDayLength(dayLengthResult as bigint);

    } catch (err) {
      console.error('Failed to load contract state:', err);
      setError('Failed to load contract state');
    }
  }, [publicClient]);

  // Connect using Wagmi
  const handleConnect = useCallback(() => {
    try {
      connect({ connector: (window as any).ethereum ? injected() : metaMask() });
    } catch (err) {
      console.error('Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [connect]);

  // Disconnect using Wagmi
  const handleDisconnect = useCallback(() => {
    disconnect();
    setAdmin(null);
    setCooldown(null);
    setDayLength(null);
  }, [disconnect]);

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
      setError('Failed to switch chain');
    }
  }, []);

  // Get pool information
  const getPool = useCallback(async (token: `0x${string}`): Promise<Pool | null> => {
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
  const getUserInfo = useCallback(async (user: `0x${string}`, token: `0x${string}`): Promise<UserInfo | null> => {
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
  const getContractBalance = useCallback(async (token: `0x${string}`): Promise<bigint> => {
    if (!publicClient) return BigInt(0);

    try {
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
    } catch (err) {
      console.error('Failed to get contract balance:', err);
      return BigInt(0);
    }
  }, [publicClient]);

  // Helper function to generate referral tag
  const generateReferralTag = useCallback((user: `0x${string}`) => {
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

  // Claim function using Wagmi
  const claim = useCallback(async (token: `0x${string}`, amount: bigint): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      // For now, we'll use a simple approach without referral tag
      // In a production app, you'd need to modify the contract call to include the referral tag
      const hash = await writeClaimAsync({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'claim',
        args: [token, amount],
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
  }, [address, generateReferralTag, submitReferralToDivvi, writeClaimAsync]);

  // Set pool function (admin only) using Wagmi
  const setPool = useCallback(async (
    token: `0x${string}`, 
    total: bigint, 
    maxSend: bigint, 
    isNative: boolean
  ): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      const hash = await writeSetPoolAsync({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'setPool',
        args: [token, total, maxSend, isNative],
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
  }, [address, generateReferralTag, submitReferralToDivvi, writeSetPoolAsync]);

  // Admin send function (admin only) using Wagmi
  const adminSend = useCallback(async (
    token: `0x${string}`, 
    to: `0x${string}`, 
    amount: bigint
  ): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      const hash = await writeAdminSendAsync({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'adminSend',
        args: [token, to, amount],
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
  }, [address, generateReferralTag, submitReferralToDivvi, writeAdminSendAsync]);

  // Withdraw function (admin only) using Wagmi
  const withdraw = useCallback(async (token: `0x${string}`, amount: bigint): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      const hash = await writeWithdrawAsync({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'withdraw',
        args: [token, amount],
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
  }, [address, generateReferralTag, submitReferralToDivvi, writeWithdrawAsync]);





  // Increase pool function (admin only) using Wagmi
  const increasePool = useCallback(async (
    token: `0x${string}`, 
    amount: bigint
  ): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      const hash = await writeIncreasePoolAsync({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'increasePool',
        args: [token, amount],
      });

      // Submit referral to Divvi
      await submitReferralToDivvi(hash);

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to increase pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, generateReferralTag, submitReferralToDivvi, writeIncreasePoolAsync]);

  // Approve token function for ERC20 approvals
  const approveToken = useCallback(async (
    token: `0x${string}`,
    spender: `0x${string}`,
    amount: bigint
  ): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await writeContractAsync({
        address: token,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [spender, amount],
      });

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContractAsync]);

  // Get token allowance function
  const getTokenAllowance = useCallback(async (
    token: `0x${string}`,
    owner: `0x${string}`,
    spender: `0x${string}`
  ): Promise<bigint> => {
    if (!publicClient) {
      return BigInt(0);
    }
    
    try {
      const allowance = await publicClient.readContract({
        address: token,
        abi: ERC20ABI,
        functionName: 'allowance',
        args: [owner, spender],
      });
      return allowance as bigint;
    } catch (err) {
      console.error('Failed to get token allowance:', err);
      return BigInt(0);
    }
  }, [publicClient!]);

  // Fund pool function (anyone can donate) using Wagmi
  const fundPool = useCallback(async (
    token: `0x${string}`, 
    amount: bigint, 
    isNative: boolean
  ): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we need to approve the token first (for non-native tokens)
      if (!isNative) {
        const currentAllowance = await getTokenAllowance(token, address, HEYZO_CONTRACT_ADDRESS);
        if (currentAllowance < amount) {
          // Need to approve first - show user what's happening
          setError('Approving token... Please confirm the approval transaction in your wallet.');
          await approveToken(token, HEYZO_CONTRACT_ADDRESS, amount);
          
          // Wait for approval to be mined and show progress
          setError('Token approved! Now processing fund pool... Please confirm the fund transaction.');
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait longer for approval to be mined
        }
      }

      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      const hash = await writeFundPoolAsync({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'fundPool',
        args: [token, amount],
        value: isNative ? amount : BigInt(0), // Send native tokens if isNative is true
      });

      // Submit referral to Divvi
      await submitReferralToDivvi(hash);

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fund pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, generateReferralTag, submitReferralToDivvi, writeFundPoolAsync, getTokenAllowance, approveToken]);

  // Top up function (anyone can deposit) using Wagmi
  const topUp = useCallback(async (
    token: `0x${string}`, 
    amount: bigint
  ): Promise<{ hash: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we need to approve the token first
      const currentAllowance = await getTokenAllowance(token, address, HEYZO_CONTRACT_ADDRESS);
      if (currentAllowance < amount) {
        // Need to approve first - show user what's happening
        setError('Approving token... Please confirm the approval transaction in your wallet.');
        await approveToken(token, HEYZO_CONTRACT_ADDRESS, amount);
        
        // Wait for approval to be mined and show progress
        setError('Token approved! Now processing top up... Please confirm the top up transaction.');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait longer for approval to be mined
      }

      // Generate referral tag
      const referralTag = generateReferralTag(address);
      
      const hash = await writeTopUpAsync({
        address: HEYZO_CONTRACT_ADDRESS,
        abi: HeyZoABI,
        functionName: 'topUp',
        args: [token, amount],
        value: BigInt(0), // Always false for isNative
      });

      // Submit referral to Divvi
      await submitReferralToDivvi(hash);

      return { hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to top up';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, generateReferralTag, submitReferralToDivvi, writeTopUpAsync, getTokenAllowance, approveToken]);

  return {
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
    connect: handleConnect,
    disconnect: handleDisconnect,
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
    fundPool,
    topUp,
    increasePool,
    
    // ERC20 functions
    approveToken,
    getTokenAllowance,
    
    // Error handling
    error,
    isLoading,
  };
}