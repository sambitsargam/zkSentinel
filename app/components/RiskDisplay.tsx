'use client';

interface RiskDisplayProps {
  riskScore: number;
  isVerified: boolean;
  isLoading?: boolean;
}

export function RiskDisplay({ riskScore, isVerified, isLoading = false }: RiskDisplayProps) {
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-200' };
    if (score <= 60) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', borderColor: 'border-yellow-200' };
    return { level: 'High', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-800', borderColor: 'border-red-200' };
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return '#10B981'; // green-500
    if (score <= 60) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Risk Analysis</h3>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-600">Analyzing...</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  const risk = getRiskLevel(riskScore);

  return (
    <div className={`rounded-lg shadow-md p-6 border ${risk.borderColor} ${risk.bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Risk Analysis</h3>
        {isVerified ? (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-green-600 font-medium">Verified</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-red-600 font-medium">Unverified</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Risk Score Display */}
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-3">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={getRiskColor(riskScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 314} 314`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${risk.textColor}`}>
                  {riskScore}
                </div>
                <div className="text-xs text-gray-600">Risk Score</div>
              </div>
            </div>
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${risk.bgColor} ${risk.textColor}`}>
            <div className={`w-2 h-2 rounded-full bg-${risk.color}-500 mr-2`}></div>
            {risk.level} Risk
          </div>
        </div>

        {/* Risk Level Description */}
        <div className="text-center text-sm text-gray-600">
          {riskScore <= 30 && "Your wallet has a balanced allocation with low volatility exposure."}
          {riskScore > 30 && riskScore <= 60 && "Your wallet has moderate risk with mixed asset allocation."}
          {riskScore > 60 && "Your wallet has high volatility exposure that may require protective action."}
        </div>
      </div>
    </div>
  );
}