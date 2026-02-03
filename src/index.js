#!/usr/bin/env node

/**
 * TreasuryAgent - Autonomous Portfolio Manager for Solana
 * Built by walt-openclaw for Colosseum Agent Hackathon
 */

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

// Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Agent state
const state = {
  wallet: null,
  balance: 0,
  status: 'initializing'
};

/**
 * Initialize agent with wallet
 */
async function initialize() {
  console.log('🤖 TreasuryAgent initializing...');
  console.log('📍 RPC:', RPC_URL);
  
  try {
    // Load wallet
    const keypairPath = process.env.SOLANA_KEYPAIR_PATH;
    if (!keypairPath) {
      console.error('❌ SOLANA_KEYPAIR_PATH not set in .env');
      process.exit(1);
    }
    
    const keypairData = JSON.parse(readFileSync(keypairPath, 'utf-8'));
    state.wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log('✅ Wallet loaded:', state.wallet.publicKey.toString());
    
    // Check balance
    state.balance = await connection.getBalance(state.wallet.publicKey);
    console.log(`💰 Balance: ${(state.balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    
    if (state.balance === 0) {
      console.log('⚠️  Zero balance - request airdrop:');
      console.log(`   solana airdrop 2 ${state.wallet.publicKey.toString()} --url devnet`);
    }
    
    state.status = 'ready';
    console.log('✅ TreasuryAgent ready!\n');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main agent loop
 */
async function main() {
  await initialize();
  
  console.log('Available commands:');
  console.log('  - "Check balance"');
  console.log('  - "Swap X SOL to USDC" (coming soon)');
  console.log('  - "Stake X SOL with Jito" (coming soon)');
  console.log('  - "Deposit X USDC to Kamino" (coming soon)');
  console.log('\nPress Ctrl+C to exit');
  
  // Keep alive
  process.stdin.resume();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 TreasuryAgent shutting down...');
  process.exit(0);
});

// Start
main().catch(console.error);
