#!/usr/bin/env node

/**
 * TreasuryAgent - Autonomous Portfolio Manager for Solana
 * Built by walt-openclaw for Colosseum Agent Hackathon
 */

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { parseCommand } from './parser/index.js';
import { executeIntent } from './executor/index.js';
import { checkRisk } from './risk/manager.js';

config();

// Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Agent state
const state = {
  wallet: null,
  balance: 0,
  status: 'initializing',
  history: []
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
 * Process user command
 */
async function processCommand(command) {
  console.log(`\n👤 User: "${command}"`);
  
  // Parse intent
  const parsed = parseCommand(command);
  const intent = {
    type: parsed.intent,
    amount: parsed.amount,
    unit: parsed.unit,
    tokens: parsed.tokens,
    protocol: parsed.protocol,
    raw: parsed.raw
  };
  
  console.log(`🧠 Intent: ${intent.type} (${intent.amount || 'no amount'} ${intent.unit || 'SOL'})`);
  
  if (intent.type === 'unknown') {
    console.log('❓ I don\'t understand that command. Try:');
    console.log('   - "check balance"');
    console.log('   - "swap 0.1 SOL to USDC"');
    return { status: 'unknown_command' };
  }
  
  // Risk check
  const riskCheck = checkRisk(intent, state.balance);
  if (!riskCheck.approved) {
    console.log(`⚠️  Risk check failed: ${riskCheck.reason}`);
    return { status: 'rejected', reason: riskCheck.reason };
  }
  
  console.log('✅ Risk check passed');
  
  // Execute
  try {
    const result = await executeIntent(connection, state.wallet, intent);
    state.history.push({
      timestamp: new Date().toISOString(),
      command,
      intent,
      result
    });
    return result;
  } catch (error) {
    console.error(`❌ Execution error: ${error.message}`);
    throw error;
  }
}

/**
 * Interactive mode
 */
async function interactiveMode() {
  console.log('\n🎮 Interactive Mode');
  console.log('Commands:');
  console.log('  "check balance"');
  console.log('  "swap 0.1 SOL to USDC"');
  console.log('  "deposit 100 USDC"');
  console.log('  "withdraw 50 USDC"');
  console.log('  "check my USDC position"');
  console.log('  "exit"\n');
  
  const stdin = process.stdin;
  stdin.setEncoding('utf8');
  
  stdin.on('data', async (data) => {
    const command = data.trim();
    
    if (command === 'exit' || command === 'quit') {
      console.log('\n👋 Goodbye!');
      process.exit(0);
    }
    
    if (command) {
      try {
        await processCommand(command);
      } catch (error) {
        console.error('Error:', error.message);
      }
      console.log('\n> ');
    }
  });
  
  console.log('> ');
}

/**
 * Demo mode - run example commands
 */
async function demoMode() {
  console.log('\n🎬 Demo Mode\n');
  
  const commands = [
    'check balance',
    'deposit 100 USDC to Kamino',
    'check my USDC position',
  ];
  
  for (const command of commands) {
    await processCommand(command);
    console.log('\n---\n');
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('✅ Demo complete!');
  process.exit(0);
}

/**
 * Main
 */
async function main() {
  await initialize();
  
  const mode = process.argv[2] || 'interactive';
  
  if (mode === 'demo') {
    await demoMode();
  } else {
    await interactiveMode();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 TreasuryAgent shutting down...');
  process.exit(0);
});

// Start
main().catch(console.error);
