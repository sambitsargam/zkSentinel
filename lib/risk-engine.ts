import * as snarkjs from 'snarkjs';
import * as fs from 'fs';
import * as path from 'path';

export interface RiskEngineInput {
  stableBalance: bigint;
  volatileBalance: bigint;
}

export interface RiskEngineOutput {
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

export class RiskEngine {
  private wasmPath: string;
  private zkeyPath: string;
  private vkeyPath: string;

  constructor() {
    // Circuit build paths
    this.wasmPath = path.join(process.cwd(), 'circuits/build/risk_calculator_js/risk_calculator.wasm');
    this.zkeyPath = path.join(process.cwd(), 'circuits/build/risk_calculator_final.zkey');
    this.vkeyPath = path.join(process.cwd(), 'circuits/build/verification_key.json');
  }

  /**
   * Compute risk score and generate zero-knowledge proof
   */
  async computeRisk(input: RiskEngineInput): Promise<RiskEngineOutput> {
    try {
      // Input validation
      this.validateInputs(input);

      // Calculate risk score: (volatileBalance * 100) / totalBalance
      const totalBalance = input.stableBalance + input.volatileBalance;
      if (totalBalance === 0n) {
        throw new Error('Total balance cannot be zero');
      }

      // For the circuit constraint to work: riskScore * totalBalance === volatileBalance * 100
      // We need to find the exact integer riskScore that satisfies this
      const scaledVolatile = input.volatileBalance * 100n;
      let riskScore = Number(scaledVolatile / totalBalance);
      
      // Check if exact division works, if not, find the closest valid riskScore
      let constraintCheck = BigInt(riskScore) * totalBalance;
      if (constraintCheck !== scaledVolatile) {
        // Try riskScore + 1 to see if it's closer
        const nextRiskScore = riskScore + 1;
        const nextConstraintCheck = BigInt(nextRiskScore) * totalBalance;
        
        // Choose the riskScore that makes the constraint closest to valid
        if (nextConstraintCheck <= scaledVolatile && nextRiskScore <= 100) {
          riskScore = nextRiskScore;
          constraintCheck = nextConstraintCheck;
        }
        
        // If still not exact, this input combination won't work with the circuit
        if (constraintCheck !== scaledVolatile) {
          throw new Error(`Risk score calculation precision issue: cannot find exact integer solution for balances ${input.stableBalance}/${input.volatileBalance}`);
        }
      }

      // Prepare circuit inputs (all inputs including the computed risk score)
      const circuitInputs = {
        stableBalance: input.stableBalance.toString(),
        volatileBalance: input.volatileBalance.toString(),
        riskScore: riskScore.toString()
      };

      // Generate witness and proof
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInputs,
        this.wasmPath,
        this.zkeyPath
      );

      return {
        riskScore,
        proof: {
          pi_a: proof.pi_a.map((x: any) => x.toString()),
          pi_b: proof.pi_b.map((row: any[]) => row.map((x: any) => x.toString())),
          pi_c: proof.pi_c.map((x: any) => x.toString()),
          protocol: proof.protocol || 'groth16',
          curve: proof.curve || 'bn128'
        },
        publicSignals: publicSignals.map((x: any) => x.toString())
      };

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Risk computation failed: ${err.message}`);
      }
      throw new Error('Risk computation failed: Unknown error');
    }
  }

  /**
   * Verify zero-knowledge proof
   */
  async verifyProof(proof: RiskEngineOutput['proof'], publicSignals: string[]): Promise<boolean> {
    try {
      // Load verification key
      const vKey = JSON.parse(fs.readFileSync(this.vkeyPath, 'utf8'));

      // Reconstruct proof object for SnarkJS
      const proofObj = {
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c,
        protocol: proof.protocol,
        curve: proof.curve
      };

      // Verify proof
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proofObj);
      return isValid;

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Proof verification failed: ${err.message}`);
      }
      throw new Error('Proof verification failed: Unknown error');
    }
  }

  /**
   * Validate input parameters
   */
  private validateInputs(input: RiskEngineInput): void {
    if (input.stableBalance < 0n) {
      throw new Error('Stable balance must be non-negative');
    }
    if (input.volatileBalance < 0n) {
      throw new Error('Volatile balance must be non-negative');
    }
    if (input.stableBalance === 0n && input.volatileBalance === 0n) {
      throw new Error('At least one balance must be greater than zero');
    }
    
    // Check for reasonable upper bounds (2^64 - 1)
    const maxValue = 2n ** 64n - 1n;
    if (input.stableBalance > maxValue) {
      throw new Error('Stable balance exceeds maximum supported value');
    }
    if (input.volatileBalance > maxValue) {
      throw new Error('Volatile balance exceeds maximum supported value');
    }
  }
}