import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { WalletConnect } from '../WalletConnect';

// Mock the useWallet hook
let mockUseWallet = {
  address: null as string | null,
  stableBalance: 0n,
  volatileBalance: 0n,
  isConnected: false,
  isConnecting: false,
  error: null as string | null,
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  formatBalance: (balance: bigint) => (Number(balance) / 1e18).toFixed(4),
};

// Mock the hook module
vi.mock('../../../hooks/useWallet', () => ({
  useWallet: () => mockUseWallet,
}));

describe('Wallet Connection Property Tests', () => {
  beforeEach(() => {
    // Clean up DOM before each test
    cleanup();
    
    // Reset mock before each test
    mockUseWallet = {
      address: null,
      stableBalance: 0n,
      volatileBalance: 0n,
      isConnected: false,
      isConnecting: false,
      error: null,
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      formatBalance: (balance: bigint) => (Number(balance) / 1e18).toFixed(4),
    };
  });

  /**
   * Property 1: Wallet Connection State Display
   * Validates: Requirements 1.2, 1.3
   * For any successfully connected wallet with balances, the Dashboard SHALL display 
   * the wallet address, stable balance, and volatile balance
   */
  it('Feature: zk-sentinel, Property 1: For any successfully connected wallet with balances, the Dashboard SHALL display the wallet address, stable balance, and volatile balance', () => {
    fc.assert(
      fc.property(
        // Generate random wallet addresses (40 hex chars after 0x) - avoid all zeros
        fc.hexaString({ minLength: 40, maxLength: 40 })
          .filter(s => s !== '0000000000000000000000000000000000000000')
          .map(s => '0x' + s),
        // Generate random balances (up to 1000 ETH equivalent)
        fc.bigInt({ min: 1n, max: 1000n * 10n ** 18n }),
        fc.bigInt({ min: 1n, max: 1000n * 10n ** 18n }),
        (address, stableBalance, volatileBalance) => {
          // Update mock state for connected wallet
          mockUseWallet.address = address;
          mockUseWallet.stableBalance = stableBalance;
          mockUseWallet.volatileBalance = volatileBalance;
          mockUseWallet.isConnected = true;

          const { container } = render(React.createElement(WalletConnect));

          // Verify all three components are displayed using more specific queries
          expect(container.querySelector('.text-sm.font-mono')?.textContent).toBe(address);
          expect(screen.getByText(/Stable Balance/)).toBeInTheDocument();
          expect(screen.getByText(/Volatile Balance/)).toBeInTheDocument();
          
          // Verify balance values are displayed
          const stableText = mockUseWallet.formatBalance(stableBalance);
          const volatileText = mockUseWallet.formatBalance(volatileBalance);
          expect(screen.getByText(new RegExp(stableText))).toBeInTheDocument();
          expect(screen.getByText(new RegExp(volatileText))).toBeInTheDocument();

          // Verify connected status indicator
          expect(screen.getByText('Connected')).toBeInTheDocument();
          expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Wallet Disconnection Round-Trip
   * Validates: Requirements 1.5
   * For any connected wallet, disconnecting then reconnecting SHALL restore the connection state
   */
  it('Feature: zk-sentinel, Property 2: For any connected wallet, disconnecting then reconnecting SHALL restore the connection state', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 40, maxLength: 40 })
          .filter(s => s !== '0000000000000000000000000000000000000000')
          .map(s => '0x' + s),
        fc.bigInt({ min: 1n, max: 1000n * 10n ** 18n }),
        fc.bigInt({ min: 1n, max: 1000n * 10n ** 18n }),
        (address, stableBalance, volatileBalance) => {
          // Step 1: Set up initial connected state
          mockUseWallet.address = address;
          mockUseWallet.stableBalance = stableBalance;
          mockUseWallet.volatileBalance = volatileBalance;
          mockUseWallet.isConnected = true;

          // Store initial state for comparison
          const initialState = {
            address: mockUseWallet.address,
            stableBalance: mockUseWallet.stableBalance,
            volatileBalance: mockUseWallet.volatileBalance,
            isConnected: mockUseWallet.isConnected,
          };

          // Render connected wallet
          const { rerender } = render(React.createElement(WalletConnect));
          
          // Verify initial connected state is displayed
          expect(container.querySelector('.text-sm.font-mono')?.textContent).toBe(address);
          expect(screen.getByText('Connected')).toBeInTheDocument();
          expect(screen.getByText('Disconnect Wallet')).toBeInTheDocument();

          // Step 2: Simulate disconnection
          mockUseWallet.address = null;
          mockUseWallet.stableBalance = 0n;
          mockUseWallet.volatileBalance = 0n;
          mockUseWallet.isConnected = false;

          // Re-render with disconnected state
          rerender(React.createElement(WalletConnect));

          // Verify disconnected state is displayed
          expect(screen.queryByText(address)).not.toBeInTheDocument();
          expect(screen.queryByText('Connected')).not.toBeInTheDocument();
          expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
          expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();

          // Step 3: Simulate reconnection (restore original state)
          mockUseWallet.address = initialState.address;
          mockUseWallet.stableBalance = initialState.stableBalance;
          mockUseWallet.volatileBalance = initialState.volatileBalance;
          mockUseWallet.isConnected = initialState.isConnected;

          // Re-render with reconnected state
          rerender(React.createElement(WalletConnect));

          // Step 4: Verify round-trip property - state is fully restored
          expect(mockUseWallet.address).toBe(initialState.address);
          expect(mockUseWallet.stableBalance).toBe(initialState.stableBalance);
          expect(mockUseWallet.volatileBalance).toBe(initialState.volatileBalance);
          expect(mockUseWallet.isConnected).toBe(initialState.isConnected);

          // Verify UI displays restored state correctly
          expect(screen.getByText(address)).toBeInTheDocument();
          expect(screen.getByText('Connected')).toBeInTheDocument();
          expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
          
          // Verify balance values are restored and displayed
          const stableText = mockUseWallet.formatBalance(stableBalance);
          const volatileText = mockUseWallet.formatBalance(volatileBalance);
          expect(screen.getByText(new RegExp(stableText))).toBeInTheDocument();
          expect(screen.getByText(new RegExp(volatileText))).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });
});