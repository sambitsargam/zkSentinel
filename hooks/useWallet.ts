'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';

export interface WalletState {
  address: string | null;
  stableBalance: bigint;
  volatileBalance: bigint;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);

  // Get native token balance (OKB - volatile)
  const { data: nativeBalance } = useBalance({
    address,
  });

  // For demo purposes, we'll simulate USDC balance as 70% of total
  // In production, this would query actual USDC token contract
  const volatileBalance = nativeBalance?.value || 0n;
  const stableBalance = volatileBalance > 0n ? (volatileBalance * 7n) / 3n : 0n; // 70% stable, 30% volatile ratio

  const walletState: WalletState = {
    address: address || null,
    stableBalance,
    volatileBalance,
    isConnected,
    isConnecting,
    error: error || (connectError?.message || null),
  };

  const connectWallet = async () => {
    try {
      setError(null);
      
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && !window.ethereum) {
        setError('MetaMask not installed. Please install MetaMask to continue.');
        return;
      }

      await connect({ connector: metaMask() });
    } catch (err: any) {
      if (err.message?.includes('User rejected')) {
        setError('Connection rejected. Please approve the connection to continue.');
      } else if (err.message?.includes('network')) {
        setError('Network mismatch. Please switch to X Layer network in MetaMask.');
      } else {
        setError(`Connection failed: ${err.message}`);
      }
    }
  };

  const disconnectWallet = () => {
    setError(null);
    disconnect();
  };

  // Clear error when connection state changes
  useEffect(() => {
    if (isConnected) {
      setError(null);
    }
  }, [isConnected]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    formatBalance: (balance: bigint) => formatEther(balance),
  };
}