import { NextRequest, NextResponse } from 'next/server';
import { RiskEngine } from '@/lib/risk-engine';

interface AnalyzeRequest {
  walletAddress: string;
  stableBalance: string;
  volatileBalance: string;
}

interface AnalyzeResponse {
  riskScore: number;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: AnalyzeRequest;
    try {
      body = await request.json();
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate input parameters
    const validation = validateAnalyzeRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Initialize Risk Engine
    const riskEngine = new RiskEngine();

    // Convert string balances to bigint
    const stableBalance = BigInt(body.stableBalance);
    const volatileBalance = BigInt(body.volatileBalance);

    // Compute risk score and generate zk proof
    const result = await riskEngine.computeRisk({
      stableBalance,
      volatileBalance
    });

    // Format response
    const response: AnalyzeResponse = {
      riskScore: result.riskScore,
      proof: result.proof,
      publicSignals: result.publicSignals
    };

    return NextResponse.json(response);

  } catch (_error) {
    console.error('Risk analysis failed:', _error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Risk computation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Validate analyze request parameters
 */
function validateAnalyzeRequest(body: any): { isValid: boolean; error?: string } {
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

    // Check for reasonable upper bounds (2^64 - 1)
    const maxValue = 2n ** 64n - 1n;
    if (stableBalance > maxValue) {
      return { isValid: false, error: 'stableBalance exceeds maximum supported value' };
    }

    if (volatileBalance > maxValue) {
      return { isValid: false, error: 'volatileBalance exceeds maximum supported value' };
    }

  } catch (_error) {
    return { isValid: false, error: 'Invalid balance format - must be valid integer strings' };
  }

  return { isValid: true };
}