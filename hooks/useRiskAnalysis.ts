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
  error: string | null;
}

export function useRiskAnalysis() {
  const [state, setState] = useState<RiskAnalysisState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const analyzeRisk = async (walletAddress: string, stableBalance: bigint, volatileBalance: bigint) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

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
      
      setState({
        result: {
          ...data,
          verified: false, // Will be set by ProofVerifier component
        },
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error: any) {
      setState({
        result: null,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const setVerified = (verified: boolean) => {
    setState(prev => ({
      ...prev,
      result: prev.result ? { ...prev.result, verified } : null,
    }));
  };

  const reset = () => {
    setState({
      result: null,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...state,
    analyzeRisk,
    setVerified,
    reset,
  };
}