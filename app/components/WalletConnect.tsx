'use client';

import { useWallet } from '../../hooks/useWallet';

export function WalletConnect() {
  const {
    address,
    stableBalance,
    volatileBalance,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    formatBalance,
  } = useWallet();

  if (isConnected && address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Wallet Connected</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">Connected</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-md p-3">
            <label className="text-sm font-medium text-gray-600">Address</label>
            <p className="text-sm font-mono text-gray-800 break-all">
              {address}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-md p-3">
              <label className="text-sm font-medium text-blue-600">Stable Balance</label>
              <p className="text-lg font-semibold text-blue-800">
                {formatBalance(stableBalance)} USDC
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-md p-3">
              <label className="text-sm font-medium text-orange-600">Volatile Balance</label>
              <p className="text-lg font-semibold text-orange-800">
                {formatBalance(volatileBalance)} OKB
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={disconnectWallet}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 text-sm">
            Connect your MetaMask wallet to start analyzing your security risk
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
            {error.includes('MetaMask not installed') && (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
              >
                Install MetaMask
              </a>
            )}
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.06 13.94L1.66 15.34C1.26 15.74 1.26 16.37 1.66 16.77L7.23 22.34C7.63 22.74 8.26 22.74 8.66 22.34L10.06 20.94L3.06 13.94ZM21.66 2.34C21.26 1.94 20.63 1.94 20.23 2.34L18.83 3.74L20.26 5.17L21.66 3.77C22.06 3.37 22.06 2.74 21.66 2.34ZM19.45 6.88L17.17 4.6L8.83 12.94L11.11 15.22L19.45 6.88Z"/>
              </svg>
              <span>Connect MetaMask</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 mt-3">
          Make sure you&apos;re connected to X Layer network
        </p>
      </div>
    </div>
  );
}