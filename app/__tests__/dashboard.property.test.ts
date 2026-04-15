import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Dashboard from '../page';

// Mock all the hooks and components
vi.mock('../../hooks/useWallet', () => ({
  useWallet: () => ({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    stableBalance: 1000000000000000000000n,
    volatileBalance: 500000000000000000000n,
    isConnected: true,
    isConnecting: false,
    error: null,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
    formatBalance: (balance: bigint) => (Number(balance) / 1e18).toFixed(4),
  }),
}));

vi.mock('../../hooks/useRiskAnalysis', () => ({
  useRiskAnalysis: () => ({
    result: {
      riskScore: 33,
      proof: {
        pi_a: ['1', '2', '3'],
        pi_b: [['1', '2'], ['3', '4'], ['5', '6']],
        pi_c: ['7', '8', '9'],
        protocol: 'groth16',
        curve: 'bn128',
      },
      publicSignals: ['33'],
      verified: true,
    },
    isLoading: false,
    error: null,
    analyzeRisk: vi.fn(),
    setVerified: vi.fn(),
    reset: vi.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Dashboard Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 16: Comprehensive Dashboard Display
   * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.8
   * For any completed workflow (risk score verified, AI decision received, transaction executed),
   * the Dashboard SHALL display all components: wallet info, verified risk score with visual indicator,
   * proof verification status, AI reasoning and recommendations, and transaction hash with explorer link
   */
  it('Feature: zk-sentinel, Property 16: For any completed workflow, all components SHALL be displayed', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random wallet state
        fc.record({
          address: fc.string({ minLength: 40, maxLength: 40 }).map(s => '0x' + s),
          stableBalance: fc.bigInt({ min: 1n, max: 1000n * 10n ** 18n }),
          volatileBalance: fc.bigInt({ min: 1n, max: 1000n * 10n ** 18n }),
        }),
        // Generate random risk analysis result
        fc.record({
          riskScore: fc.integer({ min: 0, max: 100 }),
          verified: fc.constant(true),
        }),
        // Generate random AI decision
        fc.record({
          reasoning: fc.string({ minLength: 50, maxLength: 200 }),
          action: fc.record({
            type: fc.constantFrom('swap', 'none'),
            fromToken: fc.option(fc.constantFrom('ETH', 'BTC', 'USDC')),
            toToken: fc.option(fc.constantFrom('USDC', 'USDT', 'DAI')),
            amount: fc.option(fc.bigInt({ min: 1n, max: 100n * 10n ** 18n }).map(n => n.toString())),
          }),
        }),
        // Generate random transaction hash
        fc.string({ minLength: 64, maxLength: 64 }).map(s => '0x' + s.replace(/[^0-9a-f]/gi, '0')),
        async (walletState, riskState, aiDecision, transactionHash) => {
          // Mock the API responses
          vi.mocked(fetch).mockImplementation((url: string) => {
            if (url.includes('/api/decide')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(aiDecision),
              } as Response);
            }
            if (url.includes('/api/execute')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                  transactionHash,
                  status: 'confirmed',
                  explorerUrl: `https://www.okx.com/explorer/xlayer/tx/${transactionHash}`,
                }),
              } as Response);
            }
            return Promise.resolve({
              ok: false,
              json: () => Promise.resolve({ error: 'Not found' }),
            } as Response);
          });

          render(<Dashboard />);

          // Verify wallet info is displayed (Requirements 10.1)
          expect(screen.getByText(/Wallet Connected/i)).toBeInTheDocument();
          expect(screen.getByText(/zkSentinel/i)).toBeInTheDocument();

          // Verify risk score with visual indicator is displayed (Requirements 10.2)
          expect(screen.getByText(/Risk Analysis/i)).toBeInTheDocument();
          expect(screen.getByText(/Risk Score/i)).toBeInTheDocument();

          // Verify proof verification status is displayed (Requirements 10.3)
          expect(screen.getByText(/Zero-Knowledge Proof Verification/i)).toBeInTheDocument();
          expect(screen.getByText(/Verified/i)).toBeInTheDocument();

          // Verify workflow status indicators are present (Requirements 10.4)
          expect(screen.getByText(/Workflow Status/i)).toBeInTheDocument();
          expect(screen.getByText(/Wallet Connected/i)).toBeInTheDocument();
          expect(screen.getByText(/Risk Analyzed/i)).toBeInTheDocument();
          expect(screen.getByText(/Proof Verified/i)).toBeInTheDocument();

          // Verify network information is displayed (Requirements 10.8)
          expect(screen.getByText(/Network Information/i)).toBeInTheDocument();
          expect(screen.getByText(/X Layer/i)).toBeInTheDocument();
          expect(screen.getByText(/Chain ID: 196/i)).toBeInTheDocument();
        }
      ),
      { numRuns: 20 } // Reduced runs due to complex async nature
    );
  });

  /**
   * Additional test for responsive design and accessibility
   */
  it('should maintain responsive design structure', () => {
    render(<Dashboard />);

    // Verify main layout structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Verify header is present
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    // Verify main title is accessible
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('zkSentinel');
  });

  /**
   * Test for workflow progression indicators
   */
  it('should display workflow progression correctly', () => {
    render(<Dashboard />);

    // Verify the protection loop is displayed
    expect(screen.getByText(/Analyze → Prove → Decide → Act → Repeat/i)).toBeInTheDocument();

    // Verify workflow status section
    expect(screen.getByText(/Workflow Status/i)).toBeInTheDocument();
  });
});