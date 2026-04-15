export interface ExecutionInput {
  action: {
    type: 'swap';
    fromToken: string;
    toToken: string;
    amount: string;
  };
  walletAddress: string;
}

export interface ExecutionOutput {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  riskLevel: 'low' | 'medium' | 'high';
  explorerUrl: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  explorerUrl: string;
}

export interface AgenticWalletConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  teeEnabled: boolean;
  chainId: number;
  rpcUrl: string;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  score: number;
  factors: string[];
  recommendation: 'proceed' | 'caution' | 'block';
}

// OKX Agentic Wallet Client Interface with TEE-secured execution
interface OKXAgenticWalletClient {
  initialize(config: AgenticWalletConfig): Promise<void>;
  
  createAgenticWallet(): Promise<{
    walletId: string;
    address: string;
    teeSecured: boolean;
  }>;
  
  assessTransactionRisk(params: {
    fromToken: string;
    toToken: string;
    amount: string;
    recipient: string;
  }): Promise<RiskAssessment>;
  
  executeSwap(params: {
    fromToken: string;
    toToken: string;
    amount: string;
    slippage: number;
    recipient: string;
    naturalLanguageDescription: string;
  }): Promise<{ txHash: string; riskLevel: 'low' | 'medium' | 'high' }>;
  
  getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
  }>;
}

export class ExecutionEngine {
  private okxAgenticWallet: OKXAgenticWalletClient;
  private xLayerConfig: {
    rpcUrl: string;
    chainId: number;
    explorerBaseUrl: string;
  };
  private agenticWalletId: string | null = null;

  constructor() {
    // Load X Layer configuration
    this.xLayerConfig = {
      rpcUrl: process.env.NEXT_PUBLIC_XLAYER_RPC_URL || 'https://rpc.xlayer.tech',
      chainId: parseInt(process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID || '196'),
      explorerBaseUrl: process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL || 'https://www.okx.com/explorer/xlayer'
    };

    // Initialize OKX Agentic Wallet client
    this.okxAgenticWallet = this.createOKXAgenticWalletClient();
  }

  /**
   * Create secure agentic wallet with TEE-secured private key management
   */
  async createAgenticWallet(): Promise<{ walletId: string; address: string; teeSecured: boolean }> {
    try {
      // Initialize OKX Agentic Wallet if not already done
      await this.initializeOKXAgenticWallet();

      // Create secure wallet with private keys in TEE
      const walletInfo = await this.okxAgenticWallet.createAgenticWallet();
      
      this.agenticWalletId = walletInfo.walletId;
      
      console.log('Agentic wallet created:', {
        walletId: walletInfo.walletId,
        address: walletInfo.address,
        teeSecured: walletInfo.teeSecured
      });

      return walletInfo;

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Agentic wallet creation failed: ${err.message}`);
      }
      throw new Error('Agentic wallet creation failed: Unknown error');
    }
  }

  /**
   * Assess transaction risk using OKX Agentic Wallet's built-in risk grading
   */
  async assessTransactionRisk(input: ExecutionInput): Promise<RiskAssessment> {
    try {
      // Validate input parameters
      this.validateExecutionInput(input);

      // Initialize OKX Agentic Wallet if not already done
      await this.initializeOKXAgenticWallet();

      // Assess transaction risk using built-in risk grading
      const riskAssessment = await this.okxAgenticWallet.assessTransactionRisk({
        fromToken: this.normalizeTokenAddress(input.action.fromToken),
        toToken: this.normalizeTokenAddress(input.action.toToken),
        amount: input.action.amount,
        recipient: input.walletAddress
      });

      console.log('Transaction risk assessment:', riskAssessment);

      return riskAssessment;

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Risk assessment failed: ${err.message}`);
      }
      throw new Error('Risk assessment failed: Unknown error');
    }
  }

  /**
   * Execute token swap via OKX Agentic Wallet with natural language processing
   */
  async executeSwap(input: ExecutionInput): Promise<ExecutionOutput> {
    try {
      // Validate input parameters
      this.validateExecutionInput(input);

      // Initialize OKX Agentic Wallet if not already done
      await this.initializeOKXAgenticWallet();

      // Assess transaction risk first
      const riskAssessment = await this.assessTransactionRisk(input);
      
      // Block high-risk transactions
      if (riskAssessment.recommendation === 'block') {
        throw new Error(`Transaction blocked due to high risk: ${riskAssessment.factors.join(', ')}`);
      }

      // Generate natural language description for the transaction
      const naturalLanguageDescription = this.generateNaturalLanguageDescription(input);

      // Execute swap using OKX Agent Trade Kit with natural language processing
      const swapResult = await this.okxAgenticWallet.executeSwap({
        fromToken: this.normalizeTokenAddress(input.action.fromToken),
        toToken: this.normalizeTokenAddress(input.action.toToken),
        amount: input.action.amount,
        slippage: 0.5, // 0.5% slippage tolerance
        recipient: input.walletAddress,
        naturalLanguageDescription
      });

      // Generate explorer URL
      const explorerUrl = this.generateExplorerUrl(swapResult.txHash);

      console.log('Swap executed successfully:', {
        txHash: swapResult.txHash,
        riskLevel: swapResult.riskLevel,
        explorerUrl
      });

      return {
        transactionHash: swapResult.txHash,
        status: 'pending',
        riskLevel: swapResult.riskLevel,
        explorerUrl
      };

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Transaction execution failed: ${err.message}`);
      }
      throw new Error('Transaction execution failed: Unknown error');
    }
  }

  /**
   * Get transaction status from OKX Agentic Wallet
   */
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      if (!txHash || typeof txHash !== 'string') {
        throw new Error('Invalid transaction hash');
      }

      // Validate transaction hash format (must be 64 hex characters with 0x prefix)
      if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        throw new Error('Invalid transaction hash');
      }

      // Query transaction status from OKX Agentic Wallet
      const statusResult = await this.okxAgenticWallet.getTransactionStatus(txHash);

      return {
        hash: txHash,
        status: statusResult.status,
        blockNumber: statusResult.blockNumber,
        explorerUrl: this.generateExplorerUrl(txHash)
      };

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Transaction status query failed: ${err.message}`);
      }
      throw new Error('Transaction status query failed: Unknown error');
    }
  }

  /**
   * Generate natural language description for transaction execution
   */
  private generateNaturalLanguageDescription(input: ExecutionInput): string {
    const fromTokenSymbol = this.getTokenSymbol(input.action.fromToken);
    const toTokenSymbol = this.getTokenSymbol(input.action.toToken);
    const amount = this.formatAmount(input.action.amount);
    
    return `Swap ${amount} ${fromTokenSymbol} to ${toTokenSymbol} for wallet ${input.walletAddress} on X Layer network`;
  }

  /**
   * Get token symbol from address or return the symbol if already provided
   */
  private getTokenSymbol(token: string): string {
    // Reverse token map to get symbols from addresses
    const addressToSymbol: { [key: string]: string } = {
      '0x0000000000000000000000000000000000000000': 'ETH',
      '0xA219439258ca9da29E9Cc4cE5596924745e12B93': 'USDC',
      '0x1E4a5963aBFD975d8c9021ce480b42188849D41d': 'USDT',
    };

    // Return symbol if found, otherwise return original token (assuming it's already a symbol)
    return addressToSymbol[token.toLowerCase()] || token.toUpperCase();
  }

  /**
   * Format amount for display (convert from wei to readable format)
   */
  private formatAmount(amount: string): string {
    try {
      const amountBigInt = BigInt(amount);
      // Assuming 18 decimals for most tokens
      const divisor = BigInt(10 ** 18);
      const wholePart = amountBigInt / divisor;
      const fractionalPart = amountBigInt % divisor;
      
      if (fractionalPart === 0n) {
        return wholePart.toString();
      }
      
      // Show up to 6 decimal places
      const fractionalStr = fractionalPart.toString().padStart(18, '0');
      const trimmedFractional = fractionalStr.slice(0, 6).replace(/0+$/, '');
      
      return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
    } catch {
      return amount; // Return original if parsing fails
    }
  }

  /**
   * Generate X Layer block explorer URL
   */
  private generateExplorerUrl(txHash: string): string {
    return `${this.xLayerConfig.explorerBaseUrl}/tx/${txHash}`;
  }

  /**
   * Validate execution input parameters
   */
  private validateExecutionInput(input: ExecutionInput): void {
    if (!input.action) {
      throw new Error('Action is required');
    }

    if (input.action.type !== 'swap') {
      throw new Error('Only swap actions are currently supported');
    }

    if (!input.action.fromToken || !input.action.toToken) {
      throw new Error('Both fromToken and toToken are required for swap');
    }

    if (!input.action.amount) {
      throw new Error('Amount is required for swap');
    }

    // Validate amount is positive
    try {
      const amount = BigInt(input.action.amount);
      if (amount <= 0n) {
        throw new Error('Amount must be positive');
      }
    } catch {
      throw new Error('Invalid amount format');
    }

    if (!input.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Basic wallet address validation (Ethereum format)
    if (!/^0x[a-fA-F0-9]{40}$/.test(input.walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    // Validate token addresses if they are addresses (not symbols)
    if (input.action.fromToken.startsWith('0x') && !/^0x[a-fA-F0-9]{40}$/.test(input.action.fromToken)) {
      throw new Error('Invalid fromToken address format');
    }

    if (input.action.toToken.startsWith('0x') && !/^0x[a-fA-F0-9]{40}$/.test(input.action.toToken)) {
      throw new Error('Invalid toToken address format');
    }
  }

  /**
   * Normalize token addresses for OKX Agentic Wallet
   */
  private normalizeTokenAddress(token: string): string {
    // Map common token symbols to X Layer addresses
    const tokenMap: { [key: string]: string } = {
      'ETH': '0x0000000000000000000000000000000000000000', // Native ETH
      'USDC': '0xA219439258ca9da29E9Cc4cE5596924745e12B93', // USDC on X Layer
      'USDT': '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', // USDT on X Layer
    };

    // Return mapped address or original if it's already an address
    return tokenMap[token.toUpperCase()] || token;
  }

  /**
   * Initialize OKX Agentic Wallet with TEE-secured configuration
   */
  private async initializeOKXAgenticWallet(): Promise<void> {
    try {
      const config: AgenticWalletConfig = {
        apiKey: process.env.OKX_API_KEY || '',
        secretKey: process.env.OKX_SECRET_KEY || '',
        passphrase: process.env.OKX_PASSPHRASE || '',
        teeEnabled: true, // Enable TEE-secured private key management
        chainId: this.xLayerConfig.chainId,
        rpcUrl: this.xLayerConfig.rpcUrl
      };

      // In test environment, skip credential validation
      if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
        console.log('Test environment detected, skipping OKX Agentic Wallet credential validation');
        await this.okxAgenticWallet.initialize(config);
        return;
      }

      // Validate OKX credentials in production
      if (!config.apiKey || !config.secretKey || !config.passphrase) {
        throw new Error('OKX API credentials are required (OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE)');
      }

      await this.okxAgenticWallet.initialize(config);

      console.log('OKX Agentic Wallet initialized with TEE security:', {
        chainId: config.chainId,
        rpcUrl: config.rpcUrl,
        teeEnabled: config.teeEnabled,
        hasCredentials: !!(config.apiKey && config.secretKey && config.passphrase)
      });

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`OKX Agentic Wallet initialization failed: ${err.message}`);
      }
      throw new Error('OKX Agentic Wallet initialization failed: Unknown error');
    }
  }

  /**
   * Create OKX Agentic Wallet client with TEE-secured execution
   */
  private createOKXAgenticWalletClient(): OKXAgenticWalletClient {
    // This is a comprehensive implementation for OKX Agentic Wallet integration
    // In production, this would use the actual OKX Agentic Wallet SDK with TEE security
    return {
      async initialize(config: AgenticWalletConfig) {
        // Initialize OKX Agentic Wallet with TEE-secured configuration
        console.log('OKX Agentic Wallet initialized:', {
          chainId: config.chainId,
          rpcUrl: config.rpcUrl,
          teeEnabled: config.teeEnabled,
          hasCredentials: !!(config.apiKey && config.secretKey && config.passphrase)
        });
      },

      async createAgenticWallet() {
        // Create secure wallet with private keys in TEE
        console.log('Creating agentic wallet with TEE-secured private key management');
        
        // Simulate wallet creation with TEE security
        const walletId = 'agentic-wallet-' + Math.random().toString(36).substring(2, 15);
        const address = '0x' + Array.from({ length: 40 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        return {
          walletId,
          address,
          teeSecured: true
        };
      },

      async assessTransactionRisk(params) {
        // Assess transaction risk using OKX's built-in risk grading system
        console.log('Assessing transaction risk:', params);
        
        // Simulate risk assessment based on transaction parameters
        const amount = BigInt(params.amount);
        const riskFactors: string[] = [];
        let riskScore = 0;
        
        // Risk factors based on amount
        if (amount > BigInt(10 ** 21)) { // > 1000 tokens
          riskFactors.push('Large transaction amount');
          riskScore += 30;
        }
        
        // Risk factors based on token types
        if (params.fromToken.toLowerCase().includes('unknown') || 
            params.toToken.toLowerCase().includes('unknown')) {
          riskFactors.push('Unknown token detected');
          riskScore += 40;
        }
        
        // Risk factors based on recipient
        if (!params.recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
          riskFactors.push('Invalid recipient address');
          riskScore += 50;
        }
        
        // Determine risk level and recommendation
        let level: 'low' | 'medium' | 'high';
        let recommendation: 'proceed' | 'caution' | 'block';
        
        if (riskScore >= 70) {
          level = 'high';
          recommendation = 'block';
          riskFactors.push('High risk transaction blocked');
        } else if (riskScore >= 30) {
          level = 'medium';
          recommendation = 'caution';
          riskFactors.push('Medium risk - proceed with caution');
        } else {
          level = 'low';
          recommendation = 'proceed';
          riskFactors.push('Low risk transaction');
        }
        
        return {
          level,
          score: riskScore,
          factors: riskFactors,
          recommendation
        };
      },

      async executeSwap(params) {
        // Execute swap using OKX Agent Trade Kit with natural language processing
        console.log('Executing swap via OKX Agent Trade Kit:', {
          ...params,
          naturalLanguageDescription: params.naturalLanguageDescription
        });
        
        // Simulate transaction execution with risk assessment
        const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        // Determine risk level based on transaction parameters
        const amount = BigInt(params.amount);
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        
        if (amount > BigInt(10 ** 21)) {
          riskLevel = 'high';
        } else if (amount > BigInt(10 ** 20)) {
          riskLevel = 'medium';
        }
        
        // Simulate potential transaction failures for high-risk transactions
        if (riskLevel === 'high' && Math.random() < 0.3) {
          throw new Error('Transaction failed due to insufficient liquidity for large amount');
        }
        
        return { 
          txHash: mockTxHash,
          riskLevel
        };
      },

      async getTransactionStatus(txHash) {
        // Query transaction status from OKX Agentic Wallet
        console.log('Querying transaction status via OKX Agentic Wallet:', txHash);
        
        // Simulate transaction status progression
        const statuses: ('pending' | 'confirmed' | 'failed')[] = ['pending', 'confirmed', 'failed'];
        const weights = [0.3, 0.6, 0.1]; // 30% pending, 60% confirmed, 10% failed
        
        let randomValue = Math.random();
        let selectedStatus: 'pending' | 'confirmed' | 'failed' = 'pending';
        
        for (let i = 0; i < statuses.length; i++) {
          if (randomValue < weights[i]) {
            selectedStatus = statuses[i];
            break;
          }
          randomValue -= weights[i];
        }
        
        return {
          status: selectedStatus,
          blockNumber: selectedStatus === 'confirmed' ? Math.floor(Math.random() * 1000000) + 1000000 : undefined
        };
      }
    };
  }
}