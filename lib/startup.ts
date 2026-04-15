/**
 * Application Startup Validation
 * 
 * This module runs validation checks when the application starts
 * to ensure all required configuration is present.
 */

import { validateOnStartup } from './env-validation';

/**
 * Run all startup validations
 * Call this at the entry point of your application
 */
export function runStartupValidation(): void {
  console.log('Running zkSentinel startup validation...');
  
  // Validate environment variables
  validateOnStartup();
  
  console.log('✓ All startup validations passed');
}
