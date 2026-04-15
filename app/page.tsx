'use client';

import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { RiskDisplay } from './components/RiskDisplay';
import { ProofVerifier } from './components/ProofVerifier';
import { AIRecommendation } from './components/AIRecommendation';
import { ActionPanel } from './components/ActionPanel';
import { TransactionStatus } from './components/TransactionStatus';
import { useWallet } from '../hooks/useWallet';
import { useRiskAnalysis } from '../hooks/useRiskAnalysis';

interface AIDecision {
  reasoning: string;
  action: {
    type: 'swap' | 'none';
    fromToken?: string;
    toToken?: string;
    amount?: string;
    reason?: string;
  };
}

interface TransactionState {
  hash: string | null;
  status: 'pending' | 'confirmed' | 'failed' | null;
  explorerUrl?: string;
}

export default function Dashboard() {
  const wallet = useWallet();
  const riskAnalysis = useRiskAnalysis();
  
  const [aiDecision, setAiDecision] = useState<AIDecision | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [transaction, setTransaction] = useState<TransactionState>({
    hash: null,
    status: null,
  });
  const [isExecuting, setIsExecuting] = useState(false);

  const handleAnalyze = async () => {
    if (!wallet.isConnected || !wallet.address) {
      return;
    }

    try {
      // Reset previous states
      setAiDecision(null);
      setAiError(null);
      riskAnalysis.reset();

      // Step 1: Analyze risk and generate zk proof
      const analysisResult = await riskAnalysis.analyzeRisk(
        wallet.address,
        wallet.stableBalance,
        wallet.volatileBalance
      );

      // Step 2: Get AI decision
      setIsLoadingAI(true);
      const decisionResponse = await fetch('/api/decide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          riskScore: analysisResult.riskScore,
          stableBalance: wallet.stableBalance.toString(),
          volatileBalance: wallet.volatileBalance.toString(),
        }),
      });

      if (!decisionResponse.ok) {
        const errorData = await decisionResponse.json();
        throw new Error(errorData.error || 'AI decision failed');
      }

      const decisionData = await decisionResponse.json();
      setAiDecision(decisionData);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleProtect = async () => {
    if (!wallet.address || !aiDecision || aiDecision.action.type !== 'swap') {
      return;
    }

    try {
      setIsExecuting(true);
      setTransaction({ hash: null, status: null });

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          action: aiDecision.action,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transaction execution failed');
      }

      const data = await response.json();
      setTransaction({
        hash: data.transactionHash,
        status: data.status,
        explorerUrl: data.explorerUrl,
      });
    } catch (error: any) {
      console.error('Protection execution failed:', error);
      setTransaction({
        hash: null,
        status: 'failed',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTransactionComplete = () => {
    // Trigger balance refresh and reset for next cycle
    setTimeout(() => {
      // In a real implementation, this would refresh wallet balances
      // For now, we'll just reset the analysis to allow the next cycle
      riskAnalysis.reset();
      setAiDecision(null);
      setTransaction({ hash: null, status: null });
    }, 2000);
  };

  const handleProofVerification = (verified: boolean) => {
    riskAnalysis.setVerified(verified);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">zkSentinel</h1>
              <p className="text-gray-600 mt-1">
                AI Security Agent for Web3 Wallet Protection
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Analyze → Prove → Decide → Act → Repeat
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet & Actions */}
          <div className="space-y-6">
            <WalletConnect />
            
            <ActionPanel
              onAnalyze={handleAnalyze}
              onProtect={handleProtect}
              isAnalyzing={riskAnalysis.isLoading || isLoadingAI}
              isExecuting={isExecuting}
              hasRecommendation={!!aiDecision}
              recommendationType={aiDecision?.action.type || null}
              disabled={!wallet.isConnected}
            />
          </div>

          {/* Middle Column - Risk Analysis & AI */}
          <div className="space-y-6">
            {riskAnalysis.result ? (
              <RiskDisplay
                riskScore={riskAnalysis.result.riskScore}
                isVerified={riskAnalysis.result.verified}
              />
            ) : (
              <RiskDisplay
                riskScore={0}
                isVerified={false}
                isLoading={riskAnalysis.isLoading}
              />
            )}

            {riskAnalysis.result && (
              <ProofVerifier
                proof={riskAnalysis.result.proof}
                publicSignals={riskAnalysis.result.publicSignals}
                onVerificationComplete={handleProofVerification}
              />
            )}

            {(aiDecision || isLoadingAI || aiError) && (
              <div>
                {aiError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-800 font-medium">AI Analysis Failed</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{aiError}</p>
                  </div>
                ) : (
                  <AIRecommendation
                    reasoning={aiDecision?.reasoning || ''}
                    action={aiDecision?.action || { type: 'none' }}
                    isLoading={isLoadingAI}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Column - Transaction Status */}
          <div className="space-y-6">
            <TransactionStatus
              transactionHash={transaction.hash}
              status={transaction.status}
              explorerUrl={transaction.explorerUrl}
              onTransactionComplete={handleTransactionComplete}
            />

            {/* Workflow Status */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Workflow Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wallet Connected</span>
                  <div className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Analyzed</span>
                  <div className={`w-3 h-3 rounded-full ${riskAnalysis.result ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Proof Verified</span>
                  <div className={`w-3 h-3 rounded-full ${riskAnalysis.result?.verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Decision</span>
                  <div className={`w-3 h-3 rounded-full ${aiDecision ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transaction</span>
                  <div className={`w-3 h-3 rounded-full ${transaction.status === 'confirmed' ? 'bg-green-500' : transaction.status === 'pending' ? 'bg-yellow-500' : transaction.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>

            {/* Network Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Network Information</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Network: X Layer</div>
                <div>Chain ID: 196</div>
                <div>Currency: OKB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error States */}
        {riskAnalysis.error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">Risk Analysis Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{riskAnalysis.error}</p>
          </div>
        )}

        {wallet.error && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 font-medium">Wallet Connection Issue</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">{wallet.error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
