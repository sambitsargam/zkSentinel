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
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">AI Analysis</h3>
        </div>
        
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/5"></div>
        </div>
      </div>
    );
  }

  if (!reasoning) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm">No AI analysis available</p>
        </div>
      </div>
    );
  }

  const getActionIcon = (actionType: string) => {
    if (actionType === 'swap') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getActionColor = (actionType: string) => {
    if (actionType === 'swap') {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: 'text-orange-600',
      };
    }
    return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
    };
  };

  const actionColors = getActionColor(action.type);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">AI Security Analysis</h3>
      </div>

      {/* AI Reasoning */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2">Risk Assessment</h4>
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-gray-700 leading-relaxed">{reasoning}</p>
        </div>
      </div>

      {/* Recommended Action */}
      <div className={`rounded-md p-4 border ${actionColors.border} ${actionColors.bg}`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${actionColors.icon}`}>
            {getActionIcon(action.type)}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${actionColors.text} mb-1`}>
              {action.type === 'swap' ? 'Protective Action Recommended' : 'No Action Required'}
            </h4>
            
            {action.type === 'swap' ? (
              <div className="space-y-2">
                <p className={`text-sm ${actionColors.text}`}>
                  {action.reason || 'Swap recommended to reduce risk exposure'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <label className="text-xs font-medium text-gray-600">From Token</label>
                    <p className="font-semibold text-gray-800">{action.fromToken}</p>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <label className="text-xs font-medium text-gray-600">To Token</label>
                    <p className="font-semibold text-gray-800">{action.toToken}</p>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <label className="text-xs font-medium text-gray-600">Amount</label>
                    <p className="font-semibold text-gray-800 text-sm">
                      {action.amount ? `${(Number(action.amount) / 1e18).toFixed(4)}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className={`text-sm ${actionColors.text}`}>
                Your current asset allocation is within acceptable risk parameters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}