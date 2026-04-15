# zkSentinel

An autonomous AI security agent for Web3 wallet protection that combines zero-knowledge proofs, AI-powered risk analysis, and onchain execution on X Layer.

## Features

- **Zero-Knowledge Proofs**: Private risk computation using Circom circuits and SnarkJS
- **AI-Powered Analysis**: LLM-based risk analysis and action recommendations
- **Autonomous Execution**: Onchain transaction execution via OKX Onchain OS plugin on X Layer
- **Continuous Protection Loop**: Analyze → Prove (zk) → Decide → Act → Repeat

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
- **Web3**: wagmi, viem, ethers
- **Zero-Knowledge**: Circom, SnarkJS, circomlib
- **AI**: OpenAI API
- **Execution**: OKX Onchain OS SDK
- **Testing**: Vitest, fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MetaMask or compatible Web3 wallet
- X Layer network access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sambitsargam/zkSentinel.git
cd zkSentinel
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- X Layer RPC URL
- OKX Onchain OS plugin credentials
- OpenAI API key

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Project Structure

```
zkSentinel/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   └── api/               # API routes
├── lib/                   # Core engine modules
│   ├── risk-engine.ts     # Zero-knowledge risk computation
│   ├── ai-agent.ts        # AI-powered analysis
│   └── execution-engine.ts # Onchain execution
├── circuits/              # Circom circuits
├── test/                  # Test files
└── public/                # Static assets
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Testing

zkSentinel uses property-based testing with fast-check to validate correctness properties:

```bash
npm run test
```

## License

ISC

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

An autonomous AI security agent for Web3 wallet protection that combines zero-knowledge proofs, AI-powered risk analysis, and onchain execution on X Layer.

## Quick Start

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   - OpenAI API key (already configured)
   - OKX Onchain OS plugin credentials (get from https://www.okx.com/web3/build)

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

- `/circuits` - Circom circuits for zk risk computation
- `/lib` - Core engines (Risk, AI, Execution)
- `/app` - Next.js frontend and API routes
- `/app/components` - React UI components

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, wagmi, ethers
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4 with function calling
- **zk**: Circom + SnarkJS
- **Blockchain**: X Layer (zkEVM)
- **Execution**: OKX Onchain OS plugin

## License

MIT
zkSentinel is an autonomous AI agent that continuously monitors wallet risk and executes private, zero-knowledge-powered protective actions onchain.
