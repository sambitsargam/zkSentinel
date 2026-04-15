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
  disabled = false,
}: ActionPanelProps) {
  const canAnalyze = !disabled && !isAnalyzing && !isExecuting;
  const canProtect = !disabled && !isExecuting && hasRecommendation && recommendationType === 'swap';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Protection Actions</h3>
      
      <div className="space-y-4">
        {/* Analyze Button */}
        <div>
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
              canAnalyze
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Risk...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analyze Risk</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Generate zk proof and get AI risk assessment
          </p>
        </div>

        {/* Protect Button */}
        <div>
          <button
            onClick={onProtect}
            disabled={!canProtect}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
              canProtect
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Execute Protection</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {hasRecommendation && recommendationType === 'swap'
              ? 'Execute AI-recommended protective action'
              : hasRecommendation && recommendationType === 'none'
              ? 'No protective action needed'
              : 'Analyze risk first to get recommendations'
            }
          </p>
        </div>

        {/* Status Indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Workflow Status:</span>
            <div className="flex items-center space-x-2">
              {isAnalyzing && (
                <span className="text-blue-600 font-medium">Analyzing...</span>
              )}
              {isExecuting && (
                <span className="text-green-600 font-medium">Executing...</span>
              )}
              {!isAnalyzing && !isExecuting && hasRecommendation && (
                <span className="text-green-600 font-medium">Ready</span>
              )}
              {!isAnalyzing && !isExecuting && !hasRecommendation && (
                <span className="text-gray-500">Waiting</span>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Protection Loop</h4>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className={isAnalyzing ? 'text-blue-600 font-medium' : ''}>Analyze</span>
            <span>→</span>
            <span className={isAnalyzing ? 'text-blue-600 font-medium' : ''}>Prove</span>
            <span>→</span>
            <span className={isAnalyzing ? 'text-blue-600 font-medium' : ''}>Decide</span>
            <span>→</span>
            <span className={isExecuting ? 'text-green-600 font-medium' : ''}>Act</span>
            <span>→</span>
            <span>Repeat</span>
          </div>
        </div>
      </div>
    </div>
  );
}