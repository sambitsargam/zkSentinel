/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are present
 * and properly configured before the application starts.
 */

interface EnvConfig {
  // X Layer Network Configuration
  NEXT_PUBLIC_XLAYER_RPC_URL: string;
  NEXT_PUBLIC_XLAYER_CHAIN_ID: string;
  NEXT_PUBLIC_XLAYER_EXPLORER_URL: string;
  
  // OKX Onchain OS Plugin Configuration
  OKX_API_KEY: string;
  OKX_SECRET_KEY: string;
  OKX_PASSPHRASE: string;
  
  // OpenAI API Configuration
  OPENAI_API_KEY: string;
}

interface ValidationError {
  variable: string;
  message: string;
}

/**
 * Validates that all required environment variables are present and non-empty
 * @throws Error if any required variables are missing or invalid
 */
export function validateEnvironment(): EnvConfig {
  const errors: ValidationError[] = [];
  
  // X Layer Network Configuration
  const xlayerRpcUrl = process.env.NEXT_PUBLIC_XLAYER_RPC_URL;
  if (!xlayerRpcUrl || xlayerRpcUrl.trim() === '') {
    errors.push({
      variable: 'NEXT_PUBLIC_XLAYER_RPC_URL',
      message: 'X Layer RPC URL is required. Expected: https://rpc.xlayer.tech'
    });
  }
  
  const xlayerChainId = process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID;
  if (!xlayerChainId || xlayerChainId.trim() === '') {
    errors.push({
      variable: 'NEXT_PUBLIC_XLAYER_CHAIN_ID',
      message: 'X Layer Chain ID is required. Expected: 196'
    });
  } else if (xlayerChainId !== '196') {
    errors.push({
      variable: 'NEXT_PUBLIC_XLAYER_CHAIN_ID',
      message: `Invalid X Layer Chain ID: ${xlayerChainId}. Expected: 196`
    });
  }
  
  const xlayerExplorerUrl = process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL;
  if (!xlayerExplorerUrl || xlayerExplorerUrl.trim() === '') {
    errors.push({
      variable: 'NEXT_PUBLIC_XLAYER_EXPLORER_URL',
      message: 'X Layer Explorer URL is required. Expected: https://www.okx.com/explorer/xlayer'
    });
  }
  
  // OKX Onchain OS Plugin Configuration
  const okxApiKey = process.env.OKX_API_KEY;
  if (!okxApiKey || okxApiKey.trim() === '') {
    errors.push({
      variable: 'OKX_API_KEY',
      message: 'OKX API Key is required. Get credentials from: https://www.okx.com/web3/build/docs/devportal/introduction'
    });
  }
  
  const okxSecretKey = process.env.OKX_SECRET_KEY;
  if (!okxSecretKey || okxSecretKey.trim() === '') {
    errors.push({
      variable: 'OKX_SECRET_KEY',
      message: 'OKX Secret Key is required. Get credentials from: https://www.okx.com/web3/build/docs/devportal/introduction'
    });
  }
  
  const okxPassphrase = process.env.OKX_PASSPHRASE;
  if (!okxPassphrase || okxPassphrase.trim() === '') {
    errors.push({
      variable: 'OKX_PASSPHRASE',
      message: 'OKX Passphrase is required. Get credentials from: https://www.okx.com/web3/build/docs/devportal/introduction'
    });
  }
  
  // OpenAI API Configuration
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey || openaiApiKey.trim() === '') {
    errors.push({
      variable: 'OPENAI_API_KEY',
      message: 'OpenAI API Key is required. Get your API key from: https://platform.openai.com/api-keys'
    });
  } else if (!openaiApiKey.startsWith('sk-')) {
    errors.push({
      variable: 'OPENAI_API_KEY',
      message: 'Invalid OpenAI API Key format. API keys should start with "sk-"'
    });
  }
  
  // If there are any validation errors, throw a descriptive error
  if (errors.length > 0) {
    const errorMessage = formatValidationErrors(errors);
    throw new Error(errorMessage);
  }
  
  // Return validated configuration
  return {
    NEXT_PUBLIC_XLAYER_RPC_URL: xlayerRpcUrl!,
    NEXT_PUBLIC_XLAYER_CHAIN_ID: xlayerChainId!,
    NEXT_PUBLIC_XLAYER_EXPLORER_URL: xlayerExplorerUrl!,
    OKX_API_KEY: okxApiKey!,
    OKX_SECRET_KEY: okxSecretKey!,
    OKX_PASSPHRASE: okxPassphrase!,
    OPENAI_API_KEY: openaiApiKey!
  };
}

/**
 * Formats validation errors into a readable error message
 */
function formatValidationErrors(errors: ValidationError[]): string {
  const header = `
╔════════════════════════════════════════════════════════════════════════════╗
║                   ENVIRONMENT CONFIGURATION ERROR                          ║
╚════════════════════════════════════════════════════════════════════════════╝

zkSentinel requires the following environment variables to be configured.
Please check your .env.local file and ensure all required variables are set.

Missing or Invalid Variables:
`;

  const errorList = errors.map((error, index) => {
    return `
${index + 1}. ${error.variable}
   → ${error.message}
`;
  }).join('');

  const footer = `
Setup Instructions:
1. Copy .env.example to .env.local if you haven't already
2. Fill in all required values in .env.local
3. Restart the application

For more information, see the documentation at:
https://github.com/your-repo/zksentinel#environment-configuration
`;

  return header + errorList + footer;
}

/**
 * Gets a validated environment configuration
 * Safe to call multiple times - will cache the result
 */
let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvironment();
  }
  return cachedConfig;
}

/**
 * Validates environment on module load for server-side code
 * This ensures errors are caught early during build/startup
 */
export function validateOnStartup(): void {
  try {
    validateEnvironment();
    console.log('✓ Environment configuration validated successfully');
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Environment validation failed');
    process.exit(1);
  }
}
