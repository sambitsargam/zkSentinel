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
  status: 'pending';
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

    // Execute the action
    const result = await executionEngine.executeSwap({
      action: body.action,
      walletAddress: body.walletAddress
    });

    // Format response
    const response: ExecuteResponse = {
      transactionHash: result.transactionHash,
      status: 'pending',
      explorerUrl: result.explorerUrl
    };

    return NextResponse.json(response);

  } catch (_error) {
    console.error('Transaction execution failed:', _error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Transaction execution failed: ${errorMessage}` },
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

  if (!body.walletAddress || typeof body.walletAddress !== 'string') {
    return { isValid: false, error: 'walletAddress is required and must be a string' };
  }

  // Validate wallet address format (Ethereum address)
  if (!/^0x[a-fA-F0-9]{40}$/.test(body.walletAddress)) {
    return { isValid: false, error: 'Invalid wallet address format' };
  }

  if (!body.action) {
    return { isValid: false, error: 'action is required' };
  }

  if (body.action.type !== 'swap') {
    return { isValid: false, error: 'Only swap actions are currently supported' };
  }

  if (!body.action.fromToken || typeof body.action.fromToken !== 'string') {
    return { isValid: false, error: 'action.fromToken is required and must be a string' };
  }

  if (!body.action.toToken || typeof body.action.toToken !== 'string') {
    return { isValid: false, error: 'action.toToken is required and must be a string' };
  }

  if (!body.action.amount || typeof body.action.amount !== 'string') {
    return { isValid: false, error: 'action.amount is required and must be a string' };
  }

  // Validate amount is positive
  try {
    const amount = BigInt(body.action.amount);
    if (amount <= 0n) {
      return { isValid: false, error: 'action.amount must be positive' };
    }
  } catch (_error) {
    return { isValid: false, error: 'Invalid action.amount format - must be a valid integer string' };
  }

  // Validate tokens are different
  if (body.action.fromToken === body.action.toToken) {
    return { isValid: false, error: 'fromToken and toToken must be different' };
  }

  return { isValid: true };
}