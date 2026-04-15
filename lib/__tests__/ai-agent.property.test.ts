import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { AIAgent, AIAgentInput } from '../ai-agent';

// Mock OpenAI to avoid actual API calls during testing
const mockCreate = vi.fn();
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

describe('AI Agent Property Tests', () => {
  let aiAgent: AIAgent;

  beforeEach(() => {
    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    // Reset mock
    mockCreate.mockReset();
    
    // Create AI agent instance
    aiAgent = new AIAgent();
  });

  it('Property 7: For any verified risk score, the AI Agent SHALL generate structured reasoning', async () => {
    // Tag: Feature: zk-sentinel, Property 7: For any verified risk score, the AI Agent SHALL generate structured reasoning
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          riskScore: fc.integer({ min: 0, max: 100 }),
          stableBalance: fc.bigUintN(32).map(n => n.toString()),
          volatileBalance: fc.bigUintN(32).map(n => n.toString())
        }).filter(input => BigInt(input.stableBalance) > 0n || BigInt(input.volatileBalance) > 0n),
        
        async (input: AIAgentInput) => {
          // Mock OpenAI response with structured output
          const mockResponse = {
            choices: [{
              message: {
                tool_calls: [{
                  function: {
                    name: 'recommend_protective_action',
                    arguments: JSON.stringify({
                      action_type: input.riskScore >= 50 ? 'swap' : 'none',
                      reasoning: `Risk analysis: ${input.riskScore}/100. Stable balance: ${input.stableBalance} wei, Volatile balance: ${input.volatileBalance} wei. Balance ratio indicates ${input.riskScore >= 50 ? 'high' : 'acceptable'} risk level.`,
                      from_token: input.riskScore >= 50 ? 'ETH' : undefined,
                      to_token: input.riskScore >= 50 ? 'USDC' : undefined,
                      amount: input.riskScore >= 50 ? (BigInt(input.volatileBalance) / 2n).toString() : undefined
                    })
                  }
                }]
              }
            }]
          };
          
          mockCreate.mockResolvedValue(mockResponse);
          
          // Execute AI analysis
          const result = await aiAgent.analyzeRisk(input);
          
          // Verify structured output
          expect(result).toHaveProperty('reasoning');
          expect(result).toHaveProperty('recommendedAction');
          
          // Verify reasoning is a non-empty string that references balance ratio
          expect(typeof result.reasoning).toBe('string');
          expect(result.reasoning.length).toBeGreaterThan(0);
          expect(result.reasoning.toLowerCase()).toMatch(/balance|ratio|risk/);
          
          // Verify recommended action structure
          expect(result.recommendedAction).toHaveProperty('type');
          expect(['swap', 'none']).toContain(result.recommendedAction.type);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: For any high risk score, the AI Agent SHALL suggest protective actions', async () => {
    // Tag: Feature: zk-sentinel, Property 8: For any high risk score, the AI Agent SHALL suggest protective actions
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          riskScore: fc.integer({ min: 50, max: 100 }), // High risk scores only
          stableBalance: fc.bigUintN(32).map(n => n.toString()),
          volatileBalance: fc.bigUintN(32).map(n => (n + 1n).toString()) // Ensure > 0 for high risk
        }),
        
        async (input: AIAgentInput) => {
          // Mock OpenAI response for high risk scenario
          const mockResponse = {
            choices: [{
              message: {
                tool_calls: [{
                  function: {
                    name: 'recommend_protective_action',
                    arguments: JSON.stringify({
                      action_type: 'swap',
                      reasoning: `High risk detected: ${input.riskScore}/100. Recommend swapping volatile assets to reduce exposure.`,
                      from_token: 'ETH',
                      to_token: 'USDC',
                      amount: (BigInt(input.volatileBalance) / 2n).toString()
                    })
                  }
                }]
              }
            }]
          };
          
          mockCreate.mockResolvedValue(mockResponse);
          
          // Execute AI analysis
          const result = await aiAgent.analyzeRisk(input);
          
          // Verify protective actions are suggested for high risk
          expect(result.recommendedAction.type).toBe('swap');
          expect(result.recommendedAction).toHaveProperty('fromToken');
          expect(result.recommendedAction).toHaveProperty('toToken');
          expect(result.recommendedAction).toHaveProperty('amount');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10: For any low risk score, action type SHALL be none', async () => {
    // Tag: Feature: zk-sentinel, Property 10: For any low risk score, action type SHALL be none
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          riskScore: fc.integer({ min: 0, max: 49 }), // Low risk scores only
          stableBalance: fc.bigUintN(32).map(n => (n + 1n).toString()), // Ensure > 0 for low risk
          volatileBalance: fc.bigUintN(32).map(n => n.toString())
        }),
        
        async (input: AIAgentInput) => {
          // Mock OpenAI response for low risk scenario
          const mockResponse = {
            choices: [{
              message: {
                tool_calls: [{
                  function: {
                    name: 'recommend_protective_action',
                    arguments: JSON.stringify({
                      action_type: 'none',
                      reasoning: `Low risk detected: ${input.riskScore}/100. Portfolio balance is acceptable, no action needed.`
                    })
                  }
                }]
              }
            }]
          };
          
          mockCreate.mockResolvedValue(mockResponse);
          
          // Execute AI analysis
          const result = await aiAgent.analyzeRisk(input);
          
          // Verify no action is recommended for low risk
          expect(result.recommendedAction.type).toBe('none');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: For any action recommendation, all required fields SHALL be present', async () => {
    // Tag: Feature: zk-sentinel, Property 9: For any action recommendation, all required fields SHALL be present
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          riskScore: fc.integer({ min: 0, max: 100 }),
          stableBalance: fc.bigUintN(32).map(n => n.toString()),
          volatileBalance: fc.bigUintN(32).map(n => n.toString())
        }).filter(input => BigInt(input.stableBalance) > 0n || BigInt(input.volatileBalance) > 0n),
        
        async (input: AIAgentInput) => {
          // Mock OpenAI response with complete action structure
          const isHighRisk = input.riskScore >= 50;
          const mockResponse = {
            choices: [{
              message: {
                tool_calls: [{
                  function: {
                    name: 'recommend_protective_action',
                    arguments: JSON.stringify({
                      action_type: isHighRisk ? 'swap' : 'none',
                      reasoning: `Risk analysis complete: ${input.riskScore}/100 risk level.`,
                      ...(isHighRisk && {
                        from_token: 'ETH',
                        to_token: 'USDC',
                        amount: (BigInt(input.volatileBalance) / 2n).toString()
                      })
                    })
                  }
                }]
              }
            }]
          };
          
          mockCreate.mockResolvedValue(mockResponse);
          
          // Execute AI analysis
          const result = await aiAgent.analyzeRisk(input);
          
          // Verify all required fields are present
          expect(result.recommendedAction).toHaveProperty('type');
          expect(result.recommendedAction).toHaveProperty('reason');
          expect(typeof result.recommendedAction.type).toBe('string');
          expect(['swap', 'none']).toContain(result.recommendedAction.type);
          
          // If action is swap, verify swap-specific fields
          if (result.recommendedAction.type === 'swap') {
            expect(result.recommendedAction).toHaveProperty('fromToken');
            expect(result.recommendedAction).toHaveProperty('toToken');
            expect(result.recommendedAction).toHaveProperty('amount');
            expect(typeof result.recommendedAction.fromToken).toBe('string');
            expect(typeof result.recommendedAction.toToken).toBe('string');
            expect(typeof result.recommendedAction.amount).toBe('string');
          }
          
          // Verify reasoning is present and meaningful
          expect(typeof result.reasoning).toBe('string');
          expect(result.reasoning.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});