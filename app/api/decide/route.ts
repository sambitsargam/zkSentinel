import { NextRequest, NextResponse } from 'next/server';
import { AIAgent } from '@/lib/ai-agent';

interface DecideRequest {
  walletAddress: string;
  riskScore: number;
  stableBalance: string;
  volatileBalance: string;
}

interface DecideResponse {
  reasoning: string;
  action: {
    type: 'swap' | 'none';
    fromToken?: string;
    toToken?: string;
    amount?: string;
    reason?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: DecideRequest;
    try {
      body = await request.json();
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate input parameters
    const validation = validateDecideRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Initialize AI Agent
    const aiAgent = new AIAgent();

    // Analyze risk and get recommendation
    const result = await aiAgent.analyzeRisk({
      riskScore: body.riskScore,
      stableBalance: body.stableBalance,
      volatileBalance: body.volatileBalance
    });

    // Format response
    const response: DecideResponse = {
      reasoning: result.reasoning,
      action: result.recommendedAction
    };

    return NextResponse.json(response);

  } catch (_error) {
    console.error('AI decision failed:', _error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `AI decision failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Validate decide request parameters
 */
function validateDecideRequest(body: any): { isValid: boolean; error?: string } {
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

  if (typeof body.riskScore !== 'number') {
    return { isValid: false, error: 'riskScore is required and must be a number' };
  }

  if (body.riskScore < 0 || body.riskScore > 100) {
    return { isValid: false, error: 'riskScore must be between 0 and 100' };
  }

  if (!body.stableBalance || typeof body.stableBalance !== 'string') {
    return { isValid: false, error: 'stableBalance is required and must be a string' };
  }

  if (!body.volatileBalance || typeof body.volatileBalance !== 'string') {
    return { isValid: false, error: 'volatileBalance is required and must be a string' };
  }

  // Validate balance values are valid numbers
  try {
    const stableBalance = BigInt(body.stableBalance);
    const volatileBalance = BigInt(body.volatileBalance);

    if (stableBalance < 0n) {
      return { isValid: false, error: 'stableBalance must be non-negative' };
    }

    if (volatileBalance < 0n) {
      return { isValid: false, error: 'volatileBalance must be non-negative' };
    }

    if (stableBalance === 0n && volatileBalance === 0n) {
      return { isValid: false, error: 'At least one balance must be greater than zero' };
    }

  } catch (_error) {
    return { isValid: false, error: 'Invalid balance format - must be valid integer strings' };
  }

  return { isValid: true };
}