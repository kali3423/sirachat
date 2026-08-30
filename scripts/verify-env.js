#!/usr/bin/env node

/**
 * Environment Verification Script
 * Checks that all required environment variables are set before deployment
 */

const requiredEnvVars = [
  'VITE_BASE44_APP_ID',
  'VITE_BASE44_API_KEY',
  'VITE_BASE44_API_URL'
];

const optionalEnvVars = [
  'VITE_BASE44_FUNCTIONS_VERSION',
  'VITE_BASE44_APP_BASE_URL'
];

console.log('🔍 Verifying environment configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('Required environment variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ❌ ${varName} - MISSING`);
    hasErrors = true;
  } else {
    console.log(`  ✅ ${varName} - SET`);
  }
});

// Check optional variables
console.log('\nOptional environment variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ⚠️  ${varName} - NOT SET (using defaults)`);
    hasWarnings = true;
  } else {
    console.log(`  ✅ ${varName} - SET`);
  }
});

// Validate API URL format
if (process.env.VITE_BASE44_API_URL) {
  try {
    new URL(process.env.VITE_BASE44_API_URL);
    console.log('\n✅ API URL format is valid');
  } catch {
    console.log('\n❌ API URL format is invalid');
    hasErrors = true;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Environment verification FAILED');
  console.log('\nPlease set the missing environment variables before deploying.');
  console.log('For Vercel deployment, add them in your dashboard:');
  console.log('https://vercel.com/docs/concepts/projects/environment-variables');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Environment verification passed with warnings');
  console.log('\nYou can proceed with deployment.');
  process.exit(0);
} else {
  console.log('✅ Environment verification passed');
  console.log('\nAll required variables are set. Ready to deploy!');
  process.exit(0);
}
