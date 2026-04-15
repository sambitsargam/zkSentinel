import { NextRequest, NextResponse } from 'next/server';
import { ExecutionEngine } from '@/lib/execution-engine';

interface ExecuteRequest {
  walletAddress: string;
  action: {
    type: 'swap';
    fromToken: string;
    toToken: string;
    amount: string;
  };
}

interface ExecuteResponse {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  riskLevel: 'low' | 'medium' | 'high';
  explorerUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: ExecuteRequest;
    try {
      body = await request.json();
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate input parameters
    const validation = validateExecuteRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Initialize Execution Engine
    const executionEngine = new ExecutionEngine();

    // Prepare execution input
    const executionInput = {
      action: body.action,
      walletAddress: body.walletAddress
    };

    // Step 1: Assess transaction risk using OKX's built-in risk grading
    let riskAssessment;
    try {
      riskAssessment = await executionEngine.assessTransactionRisk(executionInput);
    } catch (error) {
      console.error('Risk assessment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json(
        { error: `Risk assessment failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Step 2: Check if transaction is blocked due to high risk
    if (riskAssessment.recommendation === 'block') {
      return NextResponse.json(
        { 
          error: 'Transaction blocked due to high risk',
          riskLevel: riskAssessment.level,
          factors: riskAssessment.factors
        },
        { status: 403 }
      );
    }

    // Step 3: Execute the swap transaction via OKX Agentic Wallet
    let executionResult;
    try {
      executionResult = await executionEngine.executeSwap(executionInput);
    } catch (error) {
      console.error('Transaction execution failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check for specific error types
      if (errorMessage.includes('insufficient')) {
        return NextResponse.json(
          { error: `Insufficient funds: ${errorMessage}` },
          { status: 400 }
        );
      }
      
      if (errorMessage.includes('slippage') || errorMessage.includes('liquidity')) {
        return NextResponse.json(
          { error: `Market conditions: ${errorMessage}` },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Transaction execution failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Format response
    const response: ExecuteResponse = {
      transactionHash: executionResult.transactionHash,
      status: executionResult.status,
      riskLevel: riskAssessment.level,
      explorerUrl: executionResult.explorerUrl
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Execute API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Execution failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Validate execute request parameters
 */
function validateExecuteRequest(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  // Validate wallet address
  if (!body.walletAddress || typeof body.walletAddress !== 'string') {
    return { isValid: false, error: 'walletAddress is required and must be a string' };
  }

  // Validate wallet address format (Ethereum address)
  if (!/^0x[a-fA-F0-9]{40}$/.test(body.walletAddress)) {
    return { isValid: false, error: 'Invalid wallet address format' };
  }

  // Validate action object
  if (!body.action || typeof body.action !== 'object') {
    return { isValid: false, error: 'action is required and must be an object' };
  }

  const { action } = body;

  // Validate action type
  if (!action.type || action.type !== 'swap') {
    return { isValid: false, error: 'action.type must be "swap"' };
  }

  // Validate fromToken
  if (!action.fromToken || typeof action.fromToken !== 'string') {
    return { isValid: false, error: 'action.fromToken is required and must be a string' };
  }

  // Validate toToken
  if (!action.toToken || typeof action.toToken !== 'string') {
    return { isValid: false, error: 'action.toToken is required and must be a string' };
  }

  // Validate amount
  if (!action.amount || typeof action.amount !== 'string') {
    return { isValid: false, error: 'action.amount is required and must be a string' };
  }

  // Validate token addresses (if they look like addresses)
  const tokenAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  const tokenSymbolRegex = /^[A-Z]{2,10}$/;

  if (!tokenAddressRegex.test(action.fromToken) && !tokenSymbolRegex.test(action.fromToken)) {
    return { isValid: false, error: 'action.fromToken must be a valid token address or symbol' };
  }

  if (!tokenAddressRegex.test(action.toToken) && !tokenSymbolRegex.test(action.toToken)) {
    return { isValid: false, error: 'action.toToken must be a valid token address or symbol' };
  }

  // Validate amount is a valid number
  try {
    const amount = BigInt(action.amount);
    if (amount <= 0n) {
      return { isValid: false, error: 'action.amount must be greater than zero' };
    }

    // Check for reasonable upper bounds (2^64 - 1)
    const maxValue = 2n ** 64n - 1n;
    if (amount > maxValue) {
      return { isValid: false, error: 'action.amount exceeds maximum supported value' };
    }

  } catch (_error) {
    return { isValid: false, error: 'action.amount must be a valid integer string' };
  }

  // Validate tokens are different
  if (action.fromToken.toLowerCase() === action.toToken.toLowerCase()) {
    return { isValid: false, error: 'fromToken and toToken must be different' };
  }

  return { isValid: true };
}