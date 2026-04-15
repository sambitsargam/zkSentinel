# zkSentinel Library

This directory contains core library modules for zkSentinel.

## Environment Configuration

### Files

- **`env-validation.ts`**: Environment variable validation logic
- **`startup.ts`**: Application startup validation orchestration

### Usage

#### Validating Environment on Startup

Add this to your application entry point (e.g., `app/layout.tsx` or `next.config.js`):

```typescript
import { runStartupValidation } from '@/lib/startup';

// Run validation when the application starts
if (typeof window === 'undefined') {
  // Server-side only
  runStartupValidation();
}
```

#### Getting Validated Configuration

```typescript
import { getEnvConfig } from '@/lib/env-validation';

// Get validated environment configuration
const config = getEnvConfig();

// Use configuration values
const rpcUrl = config.NEXT_PUBLIC_XLAYER_RPC_URL;
const apiKey = config.OKX_API_KEY;
```

### Required Environment Variables

All required environment variables are documented in `.env.example`. Copy it to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

#### X Layer Network Configuration

- `NEXT_PUBLIC_XLAYER_RPC_URL`: X Layer RPC endpoint (https://rpc.xlayer.tech)
- `NEXT_PUBLIC_XLAYER_CHAIN_ID`: X Layer chain ID (196)
- `NEXT_PUBLIC_XLAYER_EXPLORER_URL`: X Layer block explorer URL

#### OKX Onchain OS Plugin Configuration

- `OKX_API_KEY`: OKX API key for plugin authentication
- `OKX_SECRET_KEY`: OKX secret key for plugin authentication
- `OKX_PASSPHRASE`: OKX passphrase for plugin authentication

Get credentials from: https://www.okx.com/web3/build/docs/devportal/introduction

#### OpenAI API Configuration

- `OPENAI_API_KEY`: OpenAI API key for LLM integration

Get your API key from: https://platform.openai.com/api-keys

### Error Handling

If any required environment variables are missing or invalid, the application will fail to start with a descriptive error message:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   ENVIRONMENT CONFIGURATION ERROR                          ║
╚════════════════════════════════════════════════════════════════════════════╝

zkSentinel requires the following environment variables to be configured.
Please check your .env.local file and ensure all required variables are set.

Missing or Invalid Variables:

1. OKX_API_KEY
   → OKX API Key is required. Get credentials from: https://www.okx.com/web3/build/docs/devportal/introduction
```

This ensures that configuration issues are caught early during development and deployment.
