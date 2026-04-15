import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

/**
 * Property 14: API Input Validation
 * **Validates: Requirements 8.5**
 * For any invalid input parameters to the analyze endpoint, 
 * the API SHALL return status code 400.
 */
describe('Feature: zk-sentinel, Property 14: For any invalid input, API SHALL return 400', () => {
  it('should return 400 for invalid wallet addresses', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid wallet addresses
        fc.oneof(
          fc.constant(''), // empty string
          fc.constant('0x'), // too short
          fc.string().filter(s => !s.match(/^0x[a-fA-F0-9]{40}$/)), // invalid format
          fc.hexaString({ minLength: 1, maxLength: 39 }).map(hex => `0x${hex}`), // too short
          fc.hexaString({ minLength: 41, maxLength: 50 }).map(hex => `0x${hex}`), // too long
          fc.constant('not-an-address'), // completely invalid
          fc.constant(null), // null value
          fc.constant(undefined) // undefined value
        ),
        fc.bigUintN(32).map(n => n.toString()), // valid stableBalance
        fc.bigUintN(32).map(n => n.toString()), // valid volatileBalance
        async (invalidWalletAddress, stableBalance, volatileBalance) => {
          // Skip if both balances are zero
          if (stableBalance === '0' && volatileBalance === '0') {
            return;
          }

          const requestBody = {
            walletAddress: invalidWalletAddress,
            stableBalance,
            volatileBalance
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const response = await POST(request);
          
          // Should return 400 status for invalid wallet address
          expect(response.status).toBe(400);
          
          const responseData = await response.json();
          expect(responseData).toHaveProperty('error');
          expect(typeof responseData.error).toBe('string');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return 400 for invalid balance values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.hexaString({ minLength: 40, maxLength: 40 }).map(hex => `0x${hex}`), // valid wallet
        // Generate invalid balance combinations
        fc.oneof(
          // Negative balances
          fc.record({
            stableBalance: fc.constant('-1'),
            volatileBalance: fc.bigUintN(32).map(n => n.toString())
          }),
          fc.record({
            stableBalance: fc.bigUintN(32).map(n => n.toString()),
            volatileBalance: fc.constant('-1')
          }),
          // Both balances zero
          fc.record({
            stableBalance: fc.constant('0'),
            volatileBalance: fc.constant('0')
          }),
          // Invalid format balances
          fc.record({
            stableBalance: fc.constant('not-a-number'),
            volatileBalance: fc.bigUintN(32).map(n => n.toString())
          }),
          fc.record({
            stableBalance: fc.bigUintN(32).map(n => n.toString()),
            volatileBalance: fc.constant('invalid')
          }),
          // Missing balances
          fc.record({
            stableBalance: fc.constant(null),
            volatileBalance: fc.bigUintN(32).map(n => n.toString())
          }),
          fc.record({
            stableBalance: fc.bigUintN(32).map(n => n.toString()),
            volatileBalance: fc.constant(undefined)
          }),
          // Empty string balances
          fc.record({
            stableBalance: fc.constant(''),
            volatileBalance: fc.bigUintN(32).map(n => n.toString())
          })
        ),
        async (walletAddress, balances) => {
          const requestBody = {
            walletAddress,
            stableBalance: balances.stableBalance,
            volatileBalance: balances.volatileBalance
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const response = await POST(request);
          
          // Should return 400 status for invalid balances
          expect(response.status).toBe(400);
          
          const responseData = await response.json();
          expect(responseData).toHaveProperty('error');
          expect(typeof responseData.error).toBe('string');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return 400 for missing required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate requests with missing fields
        fc.oneof(
          fc.constant({}), // empty body
          fc.record({ walletAddress: fc.hexaString({ minLength: 40, maxLength: 40 }).map(hex => `0x${hex}`) }), // missing balances
          fc.record({ stableBalance: fc.bigUintN(32).map(n => n.toString()) }), // missing wallet and volatile
          fc.record({ volatileBalance: fc.bigUintN(32).map(n => n.toString()) }), // missing wallet and stable
          fc.record({ 
            walletAddress: fc.hexaString({ minLength: 40, maxLength: 40 }).map(hex => `0x${hex}`),
            stableBalance: fc.bigUintN(32).map(n => n.toString())
          }), // missing volatileBalance
          fc.record({ 
            walletAddress: fc.hexaString({ minLength: 40, maxLength: 40 }).map(hex => `0x${hex}`),
            volatileBalance: fc.bigUintN(32).map(n => n.toString())
          }) // missing stableBalance
        ),
        async (incompleteBody) => {
          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(incompleteBody),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const response = await POST(request);
          
          // Should return 400 status for missing fields
          expect(response.status).toBe(400);
          
          const responseData = await response.json();
          expect(responseData).toHaveProperty('error');
          expect(typeof responseData.error).toBe('string');
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should return 400 for malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: '{ invalid json }',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    
    // Should return 400 status for malformed JSON
    expect(response.status).toBe(400);
  });
});