import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ProofVerifier } from '../ProofVerifier';

describe('Proof Verification Property Tests', () => {
  /**
   * Property 5: Proof Verification Workflow
   * Validates: Requirements 3.1, 3.2
   * For any valid zk proof with public signals, the Dashboard SHALL verify the proof 
   * using SnarkJS and display a verified indicator with the risk score
   */
  it('Feature: zk-sentinel, Property 5: For any valid zk proof, the Dashboard SHALL verify and display a verified indicator', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid proof structure
        fc.record({
          pi_a: fc.array(fc.string(), { minLength: 3, maxLength: 3 }),
          pi_b: fc.array(fc.array(fc.string(), { minLength: 2, maxLength: 2 }), { minLength: 3, maxLength: 3 }),
          pi_c: fc.array(fc.string(), { minLength: 3, maxLength: 3 }),
          protocol: fc.constant('groth16'),
          curve: fc.constant('bn128'),
        }),
        // Generate random public signals
        fc.array(fc.integer({ min: 0, max: 100 }).map(n => n.toString()), { minLength: 1, maxLength: 5 }),
        async (proof, publicSignals) => {
          const mockOnVerificationComplete = vi.fn();

          render(
            <ProofVerifier
              proof={proof}
              publicSignals={publicSignals}
              onVerificationComplete={mockOnVerificationComplete}
            />
          );

          // Wait for verification to complete
          await waitFor(() => {
            expect(mockOnVerificationComplete).toHaveBeenCalled();
          }, { timeout: 2000 });

          // Verify that verification indicator is displayed
          const verifiedElement = screen.getByText(/Proof Verified Successfully/i);
          expect(verifiedElement).toBeInTheDocument();

          // Verify that the verification callback was called with true
          expect(mockOnVerificationComplete).toHaveBeenCalledWith(true);
        }
      ),
      { numRuns: 50 } // Reduced runs due to async nature
    );
  });

  /**
   * Property 6: Public Signals Display
   * Validates: Requirements 3.5
   * For any zk proof with public signals, the Dashboard SHALL display the public signals
   */
  it('Feature: zk-sentinel, Property 6: For any zk proof with public signals, the Dashboard SHALL display them', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random proof
        fc.record({
          pi_a: fc.array(fc.string(), { minLength: 3, maxLength: 3 }),
          pi_b: fc.array(fc.array(fc.string(), { minLength: 2, maxLength: 2 }), { minLength: 3, maxLength: 3 }),
          pi_c: fc.array(fc.string(), { minLength: 3, maxLength: 3 }),
          protocol: fc.constant('groth16'),
          curve: fc.constant('bn128'),
        }),
        // Generate random public signals with specific values
        fc.array(fc.integer({ min: 0, max: 100 }).map(n => n.toString()), { minLength: 1, maxLength: 3 }),
        async (proof, publicSignals) => {
          const mockOnVerificationComplete = vi.fn();

          render(
            <ProofVerifier
              proof={proof}
              publicSignals={publicSignals}
              onVerificationComplete={mockOnVerificationComplete}
            />
          );

          // Wait for verification to complete
          await waitFor(() => {
            expect(mockOnVerificationComplete).toHaveBeenCalled();
          }, { timeout: 2000 });

          // Verify that public signals section is displayed
          expect(screen.getByText(/Public Signals/i)).toBeInTheDocument();

          // Verify that each public signal is displayed
          publicSignals.forEach((signal, index) => {
            expect(screen.getByText(signal)).toBeInTheDocument();
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});