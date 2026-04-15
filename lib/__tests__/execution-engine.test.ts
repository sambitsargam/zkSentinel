import { describe, it, expect } from 'vitest';
import { ExecutionEngine, ExecutionInput } from '../execution-engine';

describe('Execution Engine Tests', () => {
  const executionEngine = new ExecutionEngine();

  it('should validate execution input parameters', async () => {
    const invalidInputs: Partial<ExecutionInput>[] = [
      // Missing action
      { walletAddress: '0x1234567890123456789012345678901234567890' },
      
      // Invalid action type
      { 
        action: { type: 'invalid' as any, fromToken: 'ETH', toToken: 'USDC', amount: '1000' },
        walletAddress: '0x1234567890123456789012345678901234567890'
      },
      
      // Missing tokens
      {
        action: { type: 'swap', fromToken: '', toToken: 'USDC', amount: '1000' },
        walletAddress: '0x1234567890123456789012345678901234567890'
      },
      
      // Invalid amount
      {
        action: { type: 'swap', fromToken: 'ETH', toToken: 'USDC', amount: '0' },
        walletAddress: '0x1234567890123456789012345678901234567890'
      },
      
      // Invalid wallet address
      {
        action: { type: 'swap', fromToken: 'ETH', toToken: 'USDC', amount: '1000' },
        walletAddress: 'invalid-address'
      }
    ];

    for (const invalidInput of invalidInputs) {
      await expect(executionEngine.executeSwap(invalidInput as ExecutionInput))
        .rejects.toThrow();
    }
  });

  it('should execute swap with valid inputs', async () => {
    const validInput: ExecutionInput = {
      action: {
        type: 'swap',
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '1000000000000000000' // 1 ETH in wei
      },
      walletAddress: '0x1234567890123456789012345678901234567890'
    };

    const result = await executionEngine.executeSwap(validInput);

    expect(result).toHaveProperty('transactionHash');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('explorerUrl');
    
    expect(typeof result.transactionHash).toBe('string');
    expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(result.status).toBe('pending');
    expect(result.explorerUrl).toContain('https://www.okx.com/explorer/xlayer/tx/');
  });

  it('should generate correct explorer URLs', async () => {
    const validInput: ExecutionInput = {
      action: {
        type: 'swap',
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '1000000000000000000'
      },
      walletAddress: '0x1234567890123456789012345678901234567890'
    };

    const result = await executionEngine.executeSwap(validInput);
    const expectedUrl = `https://www.okx.com/explorer/xlayer/tx/${result.transactionHash}`;
    
    expect(result.explorerUrl).toBe(expectedUrl);
  });

  it('should get transaction status', async () => {
    const mockTxHash = '0x1234567890123456789012345678901234567890123456789012345678901234';
    
    const status = await executionEngine.getTransactionStatus(mockTxHash);
    
    expect(status).toHaveProperty('hash');
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('explorerUrl');
    
    expect(status.hash).toBe(mockTxHash);
    expect(['pending', 'confirmed', 'failed']).toContain(status.status);
    expect(status.explorerUrl).toBe(`https://www.okx.com/explorer/xlayer/tx/${mockTxHash}`);
  });

  it('should normalize token addresses correctly', async () => {
    const inputs = [
      {
        action: { type: 'swap' as const, fromToken: 'ETH', toToken: 'USDC', amount: '1000' },
        walletAddress: '0x1234567890123456789012345678901234567890'
      },
      {
        action: { type: 'swap' as const, fromToken: 'USDT', toToken: 'ETH', amount: '1000' },
        walletAddress: '0x1234567890123456789012345678901234567890'
      }
    ];

    // These should not throw errors due to token normalization
    for (const input of inputs) {
      const result = await executionEngine.executeSwap(input);
      expect(result).toHaveProperty('transactionHash');
    }
  });
});