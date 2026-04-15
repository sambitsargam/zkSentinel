import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/execute/route';
import { NextRequest } from 'next/server';

describe('Execute API Endpoint', () => {
  it('should return 200 for valid execute request', async () => {
    const requestBody = {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      action: {
        type: 'swap',
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '1000000000000000000'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/execute', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toHaveProperty('transactionHash');
    expect(responseData).toHaveProperty('status');
    expect(responseData).toHaveProperty('explorerUrl');
    expect(responseData.status).toBe('pending');
    expect(typeof responseData.transactionHash).toBe('string');
    expect(typeof responseData.explorerUrl).toBe('string');
  });

  it('should return 400 for invalid wallet address', async () => {
    const requestBody = {
      walletAddress: 'invalid-address',
      action: {
        type: 'swap',
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '1000000000000000000'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/execute', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty('error');
  });
});