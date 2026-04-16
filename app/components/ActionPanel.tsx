'use client';

interface ActionPanelProps {
  onAnalyze: () => void;
  onProtect: () => void;
  isAnalyzing: boolean;
  isExecuting: boolean;
  hasRecommendation: boolean;
  recommendationType: 'swap' | 'none' | null;
  disabled?: boolean;
}

export function ActionPanel({
  onAnalyze,
  onProtect,
  isAnalyzing,
  isExecuting,
  hasRecommendation,
  recommendationType,
  disabled = false
}: ActionPanelProps) {
  const canAnalyze = !disabled && !isAnalyzing && !isExecuting;
  const canProtect = !disabled && !isAnalyzing && !isExecuting && hasRecommendation && recommendationType === 'swap';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Actions</h3>
      
      <div className="space-y-4">
        {/* Analyze Button */}
        <div>
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              canAnalyze
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Risk...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Analyze Wallet Risk</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Generate zero-knowledge proof of your wallet&apos;s risk level
          </p>
        </div>

        {/* Protect Button */}
        <div>
          <button
            onClick={onProtect}
            disabled={!canProtect}
            className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              canProtect
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isExecuting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing Protection...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Execute Protection</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {hasRecommendation && recommendationType === 'swap'
              ? 'Execute AI-recommended protective swap on X Layer'
              : hasRecommendation && recommendationType === 'none'
              ? 'No protective action needed - wallet is secure'
              : 'Complete risk analysis first to get recommendations'
            }
          </p>
        </div>

        {/* Status Indicators */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Protection Loop Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">1. Analyze</span>
              <div className={`w-3 h-3 rounded-full ${
                isAnalyzing ? 'bg-blue-500 animate-pulse' : 
                hasRecommendation ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">2. Prove (zk)</span>
              <div className={`w-3 h-3 rounded-full ${
                isAnalyzing ? 'bg-blue-500 animate-pulse' : 
                hasRecommendation ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">3. Decide</span>
              <div className={`w-3 h-3 rounded-full ${
                isAnalyzing ? 'bg-blue-500 animate-pulse' : 
                hasRecommendation ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">4. Act</span>
              <div className={`w-3 h-3 rounded-full ${
                isExecuting ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Core Loop Emphasis */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-3 border border-blue-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-blue-800">
              Analyze → Prove → Decide → Act → Repeat
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Continuous autonomous protection for your Web3 wallet
          </p>
        </div>
      </div>
    </div>
  );
}