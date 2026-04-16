import OpenAI from 'openai';

export interface AIAgentInput {
  riskScore: number;
  stableBalance: string;
  volatileBalance: string;
}

export interface AIAgentOutput {
  reasoning: string;
  recommendedAction: {
    type: 'swap' | 'none';
    fromToken?: string;
    toToken?: string;
    amount?: string;
    reason?: string;
  };
}

export class AIAgent {
  private openai: OpenAI;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Analyze risk and generate action recommendation
   */
  async analyzeRisk(input: AIAgentInput): Promise<AIAgentOutput> {
    try {
      // Build analysis prompt
      const prompt = this.buildPrompt(input);
      
      // Get action recommendation function schema
      const actionFunction = this.getActionRecommendationFunction();
      
      // Call OpenAI with retry logic
      const response = await this.callOpenAIWithRetry(prompt, actionFunction);
      
      // Parse and validate response
      return this.parseResponse(response, input);
      
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`AI risk analysis failed: ${err.message}`);
      }
      throw new Error('AI risk analysis failed: Unknown error');
    }
  }

  /**
   * Build analysis prompt from risk data
   */
  private buildPrompt(input: AIAgentInput): string {
    const totalBalance = BigInt(input.stableBalance) + BigInt(input.volatileBalance);
    const stableRatio = Number((BigInt(input.stableBalance) * 100n) / totalBalance);
    const volatileRatio = Number((BigInt(input.volatileBalance) * 100n) / totalBalance);

    return `You are zkSentinel, an autonomous AI security agent for Web3 wallet protection.

WALLET ANALYSIS:
- Risk Score: ${input.riskScore}/100
- Stable Balance: ${input.stableBalance} wei (${stableRatio.toFixed(1)}% of total)
- Volatile Balance: ${input.volatileBalance} wei (${volatileRatio.toFixed(1)}% of total)
- Total Balance: ${totalBalance.toString()} wei

RISK ASSESSMENT GUIDELINES:
- Risk Score 0-30: Low risk - portfolio is well-balanced with sufficient stable assets
- Risk Score 31-49: Moderate risk - consider rebalancing if volatile exposure is high
- Risk Score 50-100: High risk - immediate protective action recommended

PROTECTIVE ACTIONS:
- If risk score >= 50: Recommend swapping volatile tokens to stablecoins
- If risk score < 50: Recommend no action (portfolio is acceptable)

Please analyze this wallet's risk profile and provide:
1. Clear reasoning about the risk level based on the stable-to-volatile balance ratio
2. Specific action recommendation with detailed parameters

Focus on the balance ratio in your reasoning and be specific about recommended actions.`;
  }

  /**
   * Get OpenAI function calling schema for action recommendations
   */
  private getActionRecommendationFunction(): OpenAI.Chat.Completions.ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'recommend_protective_action',
        description: 'Recommend a protective action based on wallet risk analysis',
        parameters: {
          type: 'object',
          properties: {
            action_type: {
              type: 'string',
              enum: ['swap', 'none'],
              description: 'Type of protective action to take'
            },
            from_token: {
              type: 'string',
              description: 'Token to swap from (if action_type is swap). Use "ETH" for volatile tokens.'
            },
            to_token: {
              type: 'string',
              description: 'Token to swap to (if action_type is swap). Use "USDC" for stable tokens.'
            },
            amount: {
              type: 'string',
              description: 'Amount to swap in wei (if action_type is swap). Should be portion of volatile balance.'
            },
            reasoning: {
              type: 'string',
              description: 'Detailed explanation for the recommended action, referencing the balance ratio'
            }
          },
          required: ['action_type', 'reasoning']
        }
      }
    };
  }

  /**
   * Call OpenAI API with exponential backoff retry logic
   */
  private async callOpenAIWithRetry(
    prompt: string, 
    actionFunction: OpenAI.Chat.Completions.ChatCompletionTool
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          tools: [actionFunction],
          tool_choice: { type: 'function', function: { name: 'recommend_protective_action' } },
          temperature: 0.1, // Low temperature for consistent recommendations
          max_tokens: 500
        });
        
        return response;
        
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown OpenAI API error');
        
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = this.baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`OpenAI API failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Parse and validate OpenAI response
   */
  private parseResponse(
    response: OpenAI.Chat.Completions.ChatCompletion, 
    input: AIAgentInput
  ): AIAgentOutput {
    const message = response.choices[0]?.message;
    if (!message?.tool_calls?.[0]) {
      throw new Error('Invalid OpenAI response: missing function call');
    }

    const functionCall = message.tool_calls[0];
    if (functionCall.function.name !== 'recommend_protective_action') {
      throw new Error('Invalid OpenAI response: unexpected function name');
    }

    let functionArgs;
    try {
      functionArgs = JSON.parse(functionCall.function.arguments);
    } catch {
      throw new Error('Invalid OpenAI response: malformed function arguments');
    }

    // Validate required fields
    if (!functionArgs.action_type || !functionArgs.reasoning) {
      throw new Error('Invalid OpenAI response: missing required fields');
    }

    // Validate action type
    if (!['swap', 'none'].includes(functionArgs.action_type)) {
      throw new Error('Invalid OpenAI response: invalid action type');
    }

    // Build recommended action
    const recommendedAction: AIAgentOutput['recommendedAction'] = {
      type: functionArgs.action_type,
      reason: functionArgs.reasoning
    };

    // Add swap-specific fields if action is swap
    if (functionArgs.action_type === 'swap') {
      recommendedAction.fromToken = functionArgs.from_token || 'ETH';
      recommendedAction.toToken = functionArgs.to_token || 'USDC';
      recommendedAction.amount = functionArgs.amount || this.calculateDefaultSwapAmount(input);
    }

    return {
      reasoning: functionArgs.reasoning,
      recommendedAction
    };
  }

  /**
   * Calculate default swap amount (50% of volatile balance)
   */
  private calculateDefaultSwapAmount(input: AIAgentInput): string {
    const volatileBalance = BigInt(input.volatileBalance);
    const swapAmount = volatileBalance / 2n; // Swap 50% of volatile balance
    return swapAmount.toString();
  }
}