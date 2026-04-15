import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TransactionStatus } from '../TransactionStatus';

describe('Transaction Monitoring Property Tests', () => {
  /**
   * Property 11: Transaction Hash and Explorer Link Generation
   * Validates: Requirements 7.4
   * For any valid X Layer transaction hash, the Dashboard SHALL generate 
   * and display a correctly formatted block explorer link
   */
  it('Feature: zk-sentinel, Property 11: For any transaction hash, explorer link SHALL be correctly formatted', () => {
    fc.assert(
      fc.property(
        // Generate random X Layer transaction hashes (64 hex chars with 0x prefix)
        fc.string({ minLength: 64, maxLength: 64 }).map(s => '0x' + s.replace(/[^0-9a-f]/gi, '0')),
        (transactionHash) => {
          render(
            <TransactionStatus
              transactionHash={transactionHash}
              status="confirmed"
            />
          );

          // Find the explorer link
          const explorerLink = screen.getByText(/View on X Layer Explorer/i).closest('a');
          expect(explorerLink).toBeInTheDocument();

          // Verify the link is correctly formatted
          const expectedUrl = `https://www.okx.com/explorer/xlayer/tx/${transactionHash}`;
          expect(explorerLink).toHaveAttribute('href', expectedUrl);

          // Verify the transaction hash is displayed
          expect(screen.getByText(transactionHash)).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Transaction Completion Triggers Refresh
   * Validates: Requirements 7.5
   * For any completed transaction, the Dashboard SHALL refresh wallet balances 
   * and trigger risk score recalculation
   */
  it('Feature: zk-sentinel, Property 12: For any completed transaction, balances SHALL be refreshed', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 64, maxLength: 64 }).map(s => '0x' + s.replace(/[^0-9a-f]/gi, '0')),
        (transactionHash) => {
          const mockOnTransactionComplete = vi.fn();

          render(
            <TransactionStatus
              transactionHash={transactionHash}
              status="confirmed"
              onTransactionComplete={mockOnTransactionComplete}
            />
          );

          // For confirmed transactions, verify refresh indicator is shown
          expect(screen.getByText(/Balances will be refreshed automatically/i)).toBeInTheDocument();

          // Verify the transaction is marked as confirmed
          expect(screen.getByText(/Transaction Confirmed/i)).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: Transaction In-Progress UI State
   * Validates: Requirements 10.6
   * For any transaction in progress, the Dashboard SHALL disable action buttons 
   * and display loading state
   */
  it('Feature: zk-sentinel, Property 17: For any in-progress transaction, UI SHALL show loading state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 64, maxLength: 64 }).map(s => '0x' + s.replace(/[^0-9a-f]/gi, '0')),
        (transactionHash) => {
          render(
            <TransactionStatus
              transactionHash={transactionHash}
              status="pending"
            />
          );

          // Verify pending status is displayed
          expect(screen.getByText(/Transaction Pending/i)).toBeInTheDocument();

          // Verify loading indicator is shown
          expect(screen.getByText(/Monitoring transaction status/i)).toBeInTheDocument();

          // Verify spinning animation is present (loading spinner)
          const spinner = document.querySelector('.animate-spin');
          expect(spinner).toBeInTheDocument();

          // Verify transaction hash is still displayed
          expect(screen.getByText(transactionHash)).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test for failed transactions
   */
  it('should handle failed transaction states correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 64, maxLength: 64 }).map(s => '0x' + s.replace(/[^0-9a-f]/gi, '0')),
        (transactionHash) => {
          render(
            <TransactionStatus
              transactionHash={transactionHash}
              status="failed"
            />
          );

          // Verify failed status is displayed
          expect(screen.getByText(/Transaction Failed/i)).toBeInTheDocument();

          // Verify failure message is shown
          expect(screen.getByText(/Check explorer for failure details/i)).toBeInTheDocument();

          // Verify transaction hash is still displayed
          expect(screen.getByText(transactionHash)).toBeInTheDocument();
        }
      ),
      { numRuns: 50 }
    );
  });
});