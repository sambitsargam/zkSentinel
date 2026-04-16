declare module 'snarkjs' {
  export interface SnarkJSProof {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  }

  export namespace groth16 {
    export function fullProve(
      input: any,
      wasmPath: string,
      zkeyPath: string
    ): Promise<{ proof: SnarkJSProof; publicSignals: string[] }>;

    export function verify(
      vKey: any,
      publicSignals: string[],
      proof: SnarkJSProof
    ): Promise<boolean>;
  }

  export function powersOfTau: any;
  export function zKey: any;
}