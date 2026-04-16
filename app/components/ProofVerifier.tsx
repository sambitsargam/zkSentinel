'use client';

import { useState, useEffect, useCallback } from 'react';

interface ProofVerifierProps {
  proof: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  publicSignals: string[];
  onVerificationComplete: (verified: boolean, error?: string) => void;
  onVerificationStart?: () => void;
}

export function ProofVerifier({ proof, publicSignals, onVerificationComplete, onVerificationStart }: ProofVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyProof = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    onVerificationStart?.();
    
    try {
      // Load SnarkJS dynamically to avoid SSR issues
      const snarkjs = await import('snarkjs');
      
      // Load verification key
      const vKeyResponse = await fetch('/circuits/build/verification_key.json');
      if (!vKeyResponse.ok) {
        throw new Error('Failed to load verification key');
      }
      const vKey = await vKeyResponse.json();
      
      // Verify the proof using SnarkJS
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      setVerified(isValid);
      onVerificationComplete(isValid);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Proof verification error:', err);
      const errorMessage = `Proof verification failed: ${err.message}`;
      setError(errorMessage);
      setVerified(false);
      onVerificationComplete(false, errorMessage);
    } finally {
      setIsVerifying(false);
    }
  }, [proof, publicSignals, onVerificationComplete, onVerificationStart]);

  useEffect(() => {
    if (proof && publicSignals) {
      verifyProof();
    }
  }, [proof, publicSignals, verifyProof]);

  if (!proof || !publicSignals) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-gray-600">No proof to verify</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Zero-Knowledge Proof Verification</h3>
      
      {isVerifying && (
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-md">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700">Verifying proof...</span>
        </div>
      )}

      {verified === true && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-md border border-green-200">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-green-800">Proof Verified Successfully</p>
              <p className="text-sm text-green-600">Risk computation is cryptographically proven correct</p>
            </div>
          </div>

          {/* Public Signals Display */}
          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="font-medium text-gray-800 mb-2">Public Signals</h4>
            <div className="space-y-2">
              {publicSignals.map((signal, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Signal {index + 1}:</span>
                  <span className="font-mono text-gray-800">{signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proof Details */}
          <details className="bg-gray-50 rounded-md p-4">
            <summary className="cursor-pointer font-medium text-gray-800 hover:text-gray-600">
              View Proof Details
            </summary>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="text-gray-600">Protocol:</span>
                <span className="ml-2 font-mono">{proof.protocol || 'groth16'}</span>
              </div>
              <div>
                <span className="text-gray-600">Curve:</span>
                <span className="ml-2 font-mono">{proof.curve || 'bn128'}</span>
              </div>
              <div>
                <span className="text-gray-600">Proof Size:</span>
                <span className="ml-2">{JSON.stringify(proof).length} bytes</span>
              </div>
            </div>
          </details>
        </div>
      )}

      {verified === false && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-md border border-red-200">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-medium text-red-800">Proof Verification Failed</p>
            <p className="text-sm text-red-600">
              {error || 'The proof could not be verified. Risk score may be incorrect.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}