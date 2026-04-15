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
  explorerUrl: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  explorerUrl: string;
}

// OKX Onchain OS Plugin Client Interface
interface OKXPluginClient {
  initialize(config: {
    rpcUrl: string;
    chainId: number;
    apiKey: string;
    secretKey: string;
    passphrase: string;
  }): Promise<void>;
  
  uniswap: {
    swap(params: {
      fromToken: string;
      toToken: string;
      amount: string;
      slippage: number;
      recipient: string;
    }): Promise<{ txHash: string }>;
  };
  
  getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
  }>;
}

export class ExecutionEngine {
  private okxClient: OKXPluginClient;
  private xLayerConfig: {
    rpcUrl: string;
    chainId: number;
    explorerBaseUrl: string;
  };

  constructor() {
    // Load X Layer configuration
    this.xLayerConfig = {
      rpcUrl: process.env.NEXT_PUBLIC_XLAYER_RPC_URL || 'https://rpc.xlayer.tech',
      chainId: parseInt(process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID || '196'),
      explorerBaseUrl: process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL || 'https://www.okx.com/explorer/xlayer'
    };

    // Initialize OKX Onchain OS plugin client (mock implementation for now)
    this.okxClient = this.createOKXClient();
  }

  /**
   * Execute token swap via OKX Onchain OS plugin
   */
  async executeSwap(input: ExecutionInput): Promise<ExecutionOutput> {
    try {
      // Validate input parameters
      this.validateExecutionInput(input);

      // Initialize OKX plugin if not already done
      await this.initializeOKXPlugin();

      // Execute swap using OKX Onchain OS plugin's Uniswap skill
      const swapResult = await this.okxClient.uniswap.swap({
        fromToken: this.normalizeTokenAddress(input.action.fromToken),
        toToken: this.normalizeTokenAddress(input.action.toToken),
        amount: input.action.amount,
        slippage: 0.5, // 0.5% slippage tolerance
        recipient: input.walletAddress
      });

      // Generate explorer URL
      const explorerUrl = this.generateExplorerUrl(swapResult.txHash);

      return {
        transactionHash: swapResult.txHash,
        status: 'pending',
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
   * Get transaction status from OKX plugin
   */
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      if (!txHash || typeof txHash !== 'string') {
        throw new Error('Invalid transaction hash');
      }

      // Query transaction status from OKX plugin
      const statusResult = await this.okxClient.getTransactionStatus(txHash);

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
    } catch (_error) {
      throw new Error('Invalid amount format');
    }

    if (!input.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Basic wallet address validation (Ethereum format)
    if (!/^0x[a-fA-F0-9]{40}$/.test(input.walletAddress)) {
      throw new Error('Invalid wallet address format');
    }
  }

  /**
   * Normalize token addresses for OKX plugin
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
   * Initialize OKX Onchain OS plugin
   */
  private async initializeOKXPlugin(): Promise<void> {
    try {
      const config = {
        rpcUrl: this.xLayerConfig.rpcUrl,
        chainId: this.xLayerConfig.chainId,
        apiKey: process.env.OKX_API_KEY || '',
        secretKey: process.env.OKX_SECRET_KEY || '',
        passphrase: process.env.OKX_PASSPHRASE || ''
      };

      // In test environment, skip credential validation
      if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
        console.log('Test environment detected, skipping OKX credential validation');
        await this.okxClient.initialize(config);
        return;
      }

      // Validate OKX credentials in production
      if (!config.apiKey || !config.secretKey || !config.passphrase) {
        throw new Error('OKX API credentials are required (OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE)');
      }

      await this.okxClient.initialize(config);

    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`OKX plugin initialization failed: ${err.message}`);
      }
      throw new Error('OKX plugin initialization failed: Unknown error');
    }
  }

  /**
   * Create OKX plugin client (mock implementation for development)
   */
  private createOKXClient(): OKXPluginClient {
    // This is a mock implementation for development/testing
    // In production, this would use the actual @okx/onchain-os-sdk
    return {
      async initialize(config) {
        // Mock initialization - in production this would connect to OKX services
        console.log('OKX Plugin initialized with config:', {
          rpcUrl: config.rpcUrl,
          chainId: config.chainId,
          hasCredentials: !!(config.apiKey && config.secretKey && config.passphrase)
        });
      },

      uniswap: {
        async swap(params) {
          // Mock swap execution - in production this would call OKX Uniswap skill
          console.log('Executing swap via OKX Uniswap skill:', params);
          
          // Simulate transaction hash generation
          const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('');
          
          return { txHash: mockTxHash };
        }
      },

      async getTransactionStatus(txHash) {
        // Mock status query - in production this would query actual transaction status
        console.log('Querying transaction status:', txHash);
        
        // Simulate random status for testing
        const statuses: ('pending' | 'confirmed' | 'failed')[] = ['pending', 'confirmed', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        return {
          status: randomStatus,
          blockNumber: randomStatus === 'confirmed' ? Math.floor(Math.random() * 1000000) : undefined
        };
      }
    };
  }
}