'use client';

import { useState } from 'react';

export interface RiskAnalysisResult {
  riskScore: number;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  verified: boolean;
}

export interface RiskAnalysisState {
  result: RiskAnalysisResult | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  verificationError: string | null;
}

export function useRiskAnalysis() {
  const [state, setState] = useState<RiskAnalysisState>({
    result: null,
    isLoading: false,
    isVerifying: false,
    error: null,
    verificationError: null,
  });

  const analyzeRisk = async (walletAddress: string, stableBalance: bigint, volatileBalance: bigint) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      verificationError: null 
    }));

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          stableBalance: stableBalance.toString(),
          volatileBalance: volatileBalance.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Risk analysis failed');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        result: {
          ...data,
          verified: false, // Will be set by ProofVerifier component
        },
        isLoading: false,
        error: null,
      }));

      return data;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        result: null,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const setVerifying = (isVerifying: boolean) => {
    setState(prev => ({
      ...prev,
      isVerifying,
      verificationError: isVerifying ? null : prev.verificationError,
    }));
  };

  const setVerified = (verified: boolean, error?: string) => {
    setState(prev => ({
      ...prev,
      result: prev.result ? { ...prev.result, verified } : null,
      isVerifying: false,
      verificationError: error || null,
    }));
  };

  const reset = () => {
    setState({
      result: null,
      isLoading: false,
      isVerifying: false,
      error: null,
      verificationError: null,
    });
  };

  return {
    ...state,
    analyzeRisk,
    setVerifying,
    setVerified,
    reset,
  };
}