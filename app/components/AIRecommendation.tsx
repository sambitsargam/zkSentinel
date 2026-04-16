'use client';

interface AIRecommendationProps {
  reasoning: string;
  action: {
    type: 'swap' | 'none';
    fromToken?: string;
    toToken?: string;
    amount?: string;
    reason?: string;
  };
  isLoading?: boolean;
}

export function AIRecommendation({ reasoning, action, isLoading = false }: AIRecommendationProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">AI Security Analysis</h3>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-purple-600">Analyzing...</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/5"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
        </div>
      </div>
    );
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'swap':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        );
      case 'none':
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'swap':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-800'
        };
      case 'none':
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800'
        };
    }
  };

  const colors = getActionColor(action.type);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">AI Security Analysis</h3>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-green-600 font-medium">Complete</span>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2">Analysis</h4>
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-gray-700 leading-relaxed">{reasoning}</p>
        </div>
      </div>

      {/* Action Recommendation */}
      <div className={`rounded-lg p-4 border ${colors.border} ${colors.bg}`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${colors.icon}`}>
            {getActionIcon(action.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className={`font-medium ${colors.text}`}>
                {action.type === 'swap' ? 'Protective Action Recommended' : 'No Action Required'}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                {action.type === 'swap' ? 'SWAP' : 'SAFE'}
              </span>
            </div>
            
            {action.type === 'swap' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">From:</span>
                    <span className={`ml-2 font-medium ${colors.text}`}>
                      {action.fromToken || 'ETH'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">To:</span>
                    <span className={`ml-2 font-medium ${colors.text}`}>
                      {action.toToken || 'USDC'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className={`ml-2 font-medium ${colors.text}`}>
                      {action.amount ? `${parseFloat(action.amount) / 1e18} ${action.fromToken || 'ETH'}` : 'Auto'}
                    </span>
                  </div>
                </div>
                {action.reason && (
                  <p className={`text-sm ${colors.text} mt-2`}>
                    <span className="font-medium">Reason:</span> {action.reason}
                  </p>
                )}
              </div>
            )}
            
            {action.type === 'none' && (
              <p className={`text-sm ${colors.text}`}>
                Your wallet allocation is well-balanced. Continue monitoring for changes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}