'use client';

import { useState, useEffect } from 'react';

interface TransactionStatusProps {
  transactionHash: string | null;
  status: 'pending' | 'confirmed' | 'failed' | null;
  explorerUrl?: string;
  onTransactionComplete?: () => void;
}

export function TransactionStatus({
  transactionHash,
  status,
  explorerUrl,
  onTransactionComplete,
}: TransactionStatusProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  // Generate X Layer explorer URL if not provided
  const getExplorerUrl = (hash: string) => {
    if (explorerUrl) return explorerUrl;
    const baseUrl = process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL || 'https://www.okx.com/explorer/xlayer';
    return `${baseUrl}/tx/${hash}`;
  };

  // Poll transaction status
  useEffect(() => {
    if (transactionHash && currentStatus === 'pending') {
      const interval = setInterval(async () => {
        try {
          // In a real implementation, this would query the blockchain
          // For demo purposes, we'll simulate status changes
          const randomOutcome = Math.random();
          if (randomOutcome > 0.7) {
            setCurrentStatus('confirmed');
            onTransactionComplete?.();
            clearInterval(interval);
          } else if (randomOutcome < 0.1) {
            setCurrentStatus('failed');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error polling transaction status:', error);
        }
      }, 3000); // Poll every 3 seconds

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [transactionHash, currentStatus, onTransactionComplete]);

  // Update status when prop changes
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  if (!transactionHash) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No transaction to monitor</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'pending':
        return {
          color: 'blue',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ),
          label: 'Transaction Pending',
          description: 'Your transaction is being processed on X Layer',
        };
      case 'confirmed':
        return {
          color: 'green',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Transaction Confirmed',
          description: 'Your protective action has been successfully executed',
        };
      case 'failed':
        return {
          color: 'red',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: (
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Transaction Failed',
          description: 'Your transaction failed to execute. Please try again.',
        };
      default:
        return {
          color: 'gray',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          label: 'Transaction Status Unknown',
          description: 'Unable to determine transaction status',
        };
    }
  };

  const statusConfig = getStatusConfig(currentStatus);
  const fullExplorerUrl = getExplorerUrl(transactionHash);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Monitor</h3>
      
      <div className={`rounded-md p-4 border ${statusConfig.border} ${statusConfig.bg}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {statusConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${statusConfig.text} mb-1`}>
              {statusConfig.label}
            </h4>
            <p className={`text-sm ${statusConfig.text} mb-3`}>
              {statusConfig.description}
            </p>
            
            {/* Transaction Hash */}
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Transaction Hash
              </label>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-800 break-all">
                  {transactionHash}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(transactionHash)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy transaction hash"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Explorer Link */}
            <div className="mt-3">
              <a
                href={fullExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View on X Layer Explorer</span>
              </a>
            </div>

            {/* Status Updates */}
            {currentStatus === 'pending' && (
              <div className="mt-3 text-xs text-blue-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Monitoring transaction status...</span>
                </div>
              </div>
            )}

            {currentStatus === 'confirmed' && (
              <div className="mt-3 text-xs text-green-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Balances will be refreshed automatically</span>
                </div>
              </div>
            )}

            {currentStatus === 'failed' && (
              <div className="mt-3 text-xs text-red-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>Check explorer for failure details</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}