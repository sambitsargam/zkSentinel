pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template RiskCalculator() {
    // Private inputs - wallet balances and computed risk score
    signal input stableBalance;
    signal input volatileBalance;
    signal input riskScore;
    
    // Intermediate signals
    signal totalBalance;
    signal scaledVolatile;
    
    // Compute total balance
    totalBalance <== stableBalance + volatileBalance;
    
    // Ensure total balance is not zero to avoid division by zero
    component isZero = IsZero();
    isZero.in <== totalBalance;
    isZero.out === 0;
    
    // Scale volatile balance by 100
    scaledVolatile <== volatileBalance * 100;
    
    // Verify that the provided riskScore is correct:
    // riskScore * totalBalance should equal scaledVolatile
    riskScore * totalBalance === scaledVolatile;
    
    // Constraint: riskScore must be between 0 and 100
    component lowerBound = GreaterEqThan(8);
    lowerBound.in[0] <== riskScore;
    lowerBound.in[1] <== 0;
    lowerBound.out === 1;
    
    component upperBound = LessEqThan(8);
    upperBound.in[0] <== riskScore;
    upperBound.in[1] <== 100;
    upperBound.out === 1;
}

component main {public [riskScore]} = RiskCalculator();