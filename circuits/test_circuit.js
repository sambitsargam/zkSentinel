const snarkjs = require("snarkjs");
const fs = require("fs");

async function testCircuit() {
    console.log("Testing Risk Calculator Circuit...\n");

    // Test case 1: 50% volatile (high risk)
    const input1 = {
        stableBalance: "1000000000000000000000", // 1000 tokens
        volatileBalance: "1000000000000000000000", // 1000 tokens
        riskScore: "50" // 50% risk score
    };

    console.log("Test Case 1: 50% volatile assets");
    console.log("Stable Balance:", input1.stableBalance);
    console.log("Volatile Balance:", input1.volatileBalance);
    console.log("Expected Risk Score:", input1.riskScore);

    try {
        // Generate witness and proof
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input1,
            "circuits/build/risk_calculator_js/risk_calculator.wasm",
            "circuits/build/risk_calculator_final.zkey"
        );

        console.log("Generated Proof:", JSON.stringify(proof, null, 2));
        console.log("Public Signals:", publicSignals);

        // Verify the proof
        const vKey = JSON.parse(fs.readFileSync("circuits/build/verification_key.json"));
        const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        console.log("Proof Verified:", verified);
        console.log("Risk Score from proof:", publicSignals[0]);
        console.log("✅ Test Case 1 passed!\n");

    } catch (error) {
        console.error("❌ Test Case 1 failed:", error.message);
        return;
    }

    // Test case 2: 25% volatile (low risk)
    const input2 = {
        stableBalance: "3000000000000000000000", // 3000 tokens
        volatileBalance: "1000000000000000000000", // 1000 tokens
        riskScore: "25" // 25% risk score
    };

    console.log("Test Case 2: 25% volatile assets");
    console.log("Stable Balance:", input2.stableBalance);
    console.log("Volatile Balance:", input2.volatileBalance);
    console.log("Expected Risk Score:", input2.riskScore);

    try {
        // Generate witness and proof
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input2,
            "circuits/build/risk_calculator_js/risk_calculator.wasm",
            "circuits/build/risk_calculator_final.zkey"
        );

        console.log("Generated Proof:", JSON.stringify(proof, null, 2));
        console.log("Public Signals:", publicSignals);

        // Verify the proof
        const vKey = JSON.parse(fs.readFileSync("circuits/build/verification_key.json"));
        const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        console.log("Proof Verified:", verified);
        console.log("Risk Score from proof:", publicSignals[0]);
        console.log("✅ Test Case 2 passed!\n");

    } catch (error) {
        console.error("❌ Test Case 2 failed:", error.message);
        return;
    }

    // Test case 3: 75% volatile (very high risk)
    const input3 = {
        stableBalance: "1000000000000000000000", // 1000 tokens
        volatileBalance: "3000000000000000000000", // 3000 tokens
        riskScore: "75" // 75% risk score
    };

    console.log("Test Case 3: 75% volatile assets");
    console.log("Stable Balance:", input3.stableBalance);
    console.log("Volatile Balance:", input3.volatileBalance);
    console.log("Expected Risk Score:", input3.riskScore);

    try {
        // Generate witness and proof
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input3,
            "circuits/build/risk_calculator_js/risk_calculator.wasm",
            "circuits/build/risk_calculator_final.zkey"
        );

        console.log("Generated Proof:", JSON.stringify(proof, null, 2));
        console.log("Public Signals:", publicSignals);

        // Verify the proof
        const vKey = JSON.parse(fs.readFileSync("circuits/build/verification_key.json"));
        const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        console.log("Proof Verified:", verified);
        console.log("Risk Score from proof:", publicSignals[0]);
        console.log("✅ Test Case 3 passed!\n");

    } catch (error) {
        console.error("❌ Test Case 3 failed:", error.message);
        return;
    }

    console.log("🎉 All tests passed! Circuit is working correctly.");
}

testCircuit().catch(console.error);