'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Define X Layer network
const xLayer = defineChain({
  id: 196,
  name: 'X Layer',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_XLAYER_RPC_URL || 'https://rpc.xlayer.tech'],
    },
  },
  blockExplorers: {
    default: {
      name: 'X Layer Explorer',
      url: process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL || 'https://www.okx.com/explorer/xlayer',
    },
  },
});

// Create wagmi config
const config = createConfig({
  chains: [xLayer],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'zkSentinel',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
    }),
  ],
  transports: {
    [xLayer.id]: http(),
  },
});

// Create query client
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}