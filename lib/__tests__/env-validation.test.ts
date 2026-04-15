/**
 * Environment Validation Tests
 * 
 * Tests for environment variable validation logic
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnvironment, getEnvConfig } from '../env-validation';

describe('Environment Validation', () => {
  // Store original environment
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });
  
  describe('validateEnvironment', () => {
    it('should pass validation with all required variables', () => {
      // Set all required environment variables
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      expect(() => validateEnvironment()).not.toThrow();
    });
    
    it('should throw error when NEXT_PUBLIC_XLAYER_RPC_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_XLAYER_RPC_URL;
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      expect(() => validateEnvironment()).toThrow(/NEXT_PUBLIC_XLAYER_RPC_URL/);
    });
    
    it('should throw error when NEXT_PUBLIC_XLAYER_CHAIN_ID is missing', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      delete process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID;
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      expect(() => validateEnvironment()).toThrow(/NEXT_PUBLIC_XLAYER_CHAIN_ID/);
    });
    
    it('should throw error when NEXT_PUBLIC_XLAYER_CHAIN_ID is invalid', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '1'; // Wrong chain ID
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      expect(() => validateEnvironment()).toThrow(/Invalid X Layer Chain ID/);
    });
    
    it('should throw error when OKX_API_KEY is missing', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      delete process.env.OKX_API_KEY;
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      expect(() => validateEnvironment()).toThrow(/OKX_API_KEY/);
    });
    
    it('should throw error when OKX_SECRET_KEY is missing', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      delete process.env.OKX_SECRET_KEY;
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      expect(() => validateEnvironment()).toThrow(/OKX_SECRET_KEY/);
    });
    
    it('should throw error when OKX_PASSPHRASE is missing', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      delete process.env.OKX_PASSPHRASE;
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      expect(() => validateEnvironment()).toThrow(/OKX_PASSPHRASE/);
    });
    
    it('should throw error when OPENAI_API_KEY is missing', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      delete process.env.OPENAI_API_KEY;
      
      expect(() => validateEnvironment()).toThrow(/OPENAI_API_KEY/);
    });
    
    it('should throw error when OPENAI_API_KEY has invalid format', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'invalid-key-format'; // Should start with 'sk-'
      
      expect(() => validateEnvironment()).toThrow(/Invalid OpenAI API Key format/);
    });
    
    it('should throw error with multiple missing variables', () => {
      delete process.env.NEXT_PUBLIC_XLAYER_RPC_URL;
      delete process.env.OKX_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      expect(() => validateEnvironment()).toThrow(/NEXT_PUBLIC_XLAYER_RPC_URL/);
      expect(() => validateEnvironment()).toThrow(/OKX_API_KEY/);
      expect(() => validateEnvironment()).toThrow(/OPENAI_API_KEY/);
    });
    
    it('should return validated config object', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      const config = validateEnvironment();
      
      expect(config).toEqual({
        NEXT_PUBLIC_XLAYER_RPC_URL: 'https://rpc.xlayer.tech',
        NEXT_PUBLIC_XLAYER_CHAIN_ID: '196',
        NEXT_PUBLIC_XLAYER_EXPLORER_URL: 'https://www.okx.com/explorer/xlayer',
        OKX_API_KEY: 'test_api_key',
        OKX_SECRET_KEY: 'test_secret_key',
        OKX_PASSPHRASE: 'test_passphrase',
        OPENAI_API_KEY: 'sk-test-key-123'
      });
    });
  });
  
  describe('getEnvConfig', () => {
    it('should return cached config on subsequent calls', () => {
      process.env.NEXT_PUBLIC_XLAYER_RPC_URL = 'https://rpc.xlayer.tech';
      process.env.NEXT_PUBLIC_XLAYER_CHAIN_ID = '196';
      process.env.NEXT_PUBLIC_XLAYER_EXPLORER_URL = 'https://www.okx.com/explorer/xlayer';
      process.env.OKX_API_KEY = 'test_api_key';
      process.env.OKX_SECRET_KEY = 'test_secret_key';
      process.env.OKX_PASSPHRASE = 'test_passphrase';
      process.env.OPENAI_API_KEY = 'sk-test-key-123';
      
      const config1 = getEnvConfig();
      const config2 = getEnvConfig();
      
      expect(config1).toBe(config2); // Same reference
    });
  });
});
