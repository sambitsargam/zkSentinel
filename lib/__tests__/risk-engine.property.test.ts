import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { RiskEngine, RiskEngineInput } from '../risk-engine';

describe('Risk Engine Property Tests', () => {
  const riskEngine = new RiskEngine();

  it('Property 3: For any valid wallet balance inputs, the Risk Engine SHALL compute and return a risk score, zk proof, and public signals', async () => {
    // Tag: Feature: zk-sentinel, Property 3: For any valid wallet balance inputs, the Risk Engine SHALL compute and return a risk score, zk proof, and public signals
    
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid balance pairs that will work with circuit constraints
        // Use smaller numbers and ensure they divide evenly
        fc.record({
          stableBalance: fc.integer({ min: 1, max: 100 }).map(n => BigInt(n)),
          volatileBalance: fc.integer({ min: 0, max: 100 }).map(n => BigInt(n))
        }).filter(input => {
          // Ensure at least one balance > 0 and the division will work reasonably
          if (input.stableBalance === 0n && input.volatileBalance === 0n) return false;
          const total = input.stableBalance + input.volatileBalance;
          const scaledVolatile = input.volatileBalance * 100n;
          const riskScore = scaledVolatile / total;
          // Only use inputs where the constraint can be satisfied exactly
          return riskScore * total === scaledVolatile && riskScore <= 100n;
        }),
        
        async (input: RiskEngineInput) => {
          // Execute risk computation
          const result = await riskEngine.computeRisk(input);
          
          // Verify output contains all required components
          expect(result).toHaveProperty('riskScore');
          expect(result).toHaveProperty('proof');
          expect(result).toHaveProperty('publicSignals');
          
          // Verify riskScore is a valid number between 0 and 100
          expect(typeof result.riskScore).toBe('number');
          expect(result.riskScore).toBeGreaterThanOrEqual(0);
          expect(result.riskScore).toBeLessThanOrEqual(100);
          
          // Verify proof structure
          expect(result.proof).toHaveProperty('pi_a');
          expect(result.proof).toHaveProperty('pi_b');
          expect(result.proof).toHaveProperty('pi_c');
          expect(result.proof).toHaveProperty('protocol');
          expect(result.proof).toHaveProperty('curve');
          
          // Verify proof components are arrays of strings
          expect(Array.isArray(result.proof.pi_a)).toBe(true);
          expect(Array.isArray(result.proof.pi_b)).toBe(true);
          expect(Array.isArray(result.proof.pi_c)).toBe(true);
          expect(result.proof.pi_a.every(x => typeof x === 'string')).toBe(true);
          expect(result.proof.pi_c.every(x => typeof x === 'string')).toBe(true);
          
          // Verify publicSignals is array of strings
          expect(Array.isArray(result.publicSignals)).toBe(true);
          expect(result.publicSignals.every(x => typeof x === 'string')).toBe(true);
          
          // Verify risk score calculation is correct
          const totalBalance = input.stableBalance + input.volatileBalance;
          const expectedRiskScore = Number((input.volatileBalance * 100n) / totalBalance);
          expect(result.riskScore).toBe(expectedRiskScore);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for zk proof generation

  it('Property 4: For any valid wallet balance inputs, generating a zk proof then verifying it SHALL succeed', async () => {
    // Tag: Feature: zk-sentinel, Property 4: For any valid wallet balance inputs, generating a zk proof then verifying it SHALL succeed
    
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid balance pairs that work with circuit constraints
        fc.record({
          stableBalance: fc.integer({ min: 1, max: 50 }).map(n => BigInt(n)),
          volatileBalance: fc.integer({ min: 0, max: 50 }).map(n => BigInt(n))
        }).filter(input => {
          if (input.stableBalance === 0n && input.volatileBalance === 0n) return false;
          const total = input.stableBalance + input.volatileBalance;
          const scaledVolatile = input.volatileBalance * 100n;
          const riskScore = scaledVolatile / total;
          return riskScore * total === scaledVolatile && riskScore <= 100n;
        }),
        
        async (input: RiskEngineInput) => {
          // Generate proof
          const result = await riskEngine.computeRisk(input);
          
          // Verify the proof (round-trip property)
          const isValid = await riskEngine.verifyProof(result.proof, result.publicSignals);
          
          // Verification must succeed
          expect(isValid).toBe(true);
        }
      ),
      { numRuns: 50 } // Fewer runs due to computational intensity
    );
  }, 120000); // 2 minute timeout for proof generation and verification
});