#!/usr/bin/env node

// This script forces database schema updates without interactive prompts
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function forcePushDatabase() {
  try {
    console.log('Force pushing database schema changes...');
    
    // Set environment variable to skip interactive prompts
    process.env.DRIZZLE_KIT_SKIP_PROMPTS = '1';
    
    const { stdout, stderr } = await execPromise('npx drizzle-kit push --config=./drizzle.config.ts', {
      env: {
        ...process.env,
        DRIZZLE_KIT_SKIP_PROMPTS: '1',
        CI: '1' // Often helps skip interactive prompts
      }
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('Database schema push completed successfully');
  } catch (error) {
    console.error('Error pushing database schema:', error.message);
    process.exit(1);
  }
}

forcePushDatabase();