# Risk Calculator Circuit

This directory contains the Circom circuit implementation for zkSentinel's risk calculation system.

## Files

- `risk_calculator.circom` - The main circuit implementation
- `test_circuit.js` - Test script to verify circuit functionality
- `build/` - Compiled circuit artifacts

## Circuit Description

The `RiskCalculator` circuit computes a risk score based on wallet balance composition:

**Inputs:**
- `stableBalance` (private) - Amount of stablecoin assets
- `volatileBalance` (private) - Amount of volatile cryptocurrency assets  
- `riskScore` (public) - The computed risk score (0-100)

**Logic:**
- Computes `totalBalance = stableBalance + volatileBalance`
- Verifies `riskScore * totalBalance === volatileBalance * 100`
- Ensures `riskScore` is between 0 and 100
- Prevents division by zero with non-zero total balance constraint

**Risk Formula:**
```
riskScore = (volatileBalance * 100) / totalBalance
```

Higher volatile asset ratio = higher risk score.

## Generated Files

- `risk_calculator.wasm` - WebAssembly witness generator
- `risk_calculator_final.zkey` - Proving key for proof generation
- `verification_key.json` - Verification key for proof verification
- `risk_calculator.r1cs` - R1CS constraint system

## Testing

Run the test script to verify circuit functionality:

```bash
node test_circuit.js
```

The test covers three scenarios:
1. 50% volatile assets (medium risk)
2. 25% volatile assets (low risk)  
3. 75% volatile assets (high risk)

## Usage

The circuit enables zero-knowledge proof generation for risk scores while keeping wallet balances private. Only the computed risk score is revealed as a public signal, maintaining financial privacy.