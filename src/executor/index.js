/**
 * Executor Coordinator
 * Routes intents to appropriate protocol executors
 */

import { executeSwap, TOKENS } from './jupiter.js';
import { depositToKamino, withdrawFromKamino, getKaminoPosition, getKaminoAPY } from './kamino.js';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Execute parsed intent
 */
export async function executeIntent(connection, wallet, intent) {
  console.log(`\n🎯 Executing intent: ${intent.type}`);
  console.log(`   Amount: ${intent.amount} ${intent.unit || 'SOL'}`);

  try {
    switch (intent.type) {
      case 'swap':
        return await executeSwapIntent(connection, wallet, intent);
      
      case 'balance':
        return await checkBalance(connection, wallet);
      
      case 'stake':
        console.log('⚠️  Staking not yet implemented');
        return { status: 'pending', type: 'stake' };
      
      case 'lend':
        return await executeLendIntent(connection, wallet, intent);
      
      case 'withdraw':
        return await executeWithdrawIntent(connection, wallet, intent);
      
      case 'position':
        return await executePositionIntent(connection, wallet, intent);
      
      default:
        throw new Error(`Unknown intent type: ${intent.type}`);
    }
  } catch (error) {
    console.error(`❌ Execution failed: ${error.message}`);
    throw error;
  }
}

/**
 * Execute swap intent
 */
async function executeSwapIntent(connection, wallet, intent) {
  const fromToken = intent.tokens?.from || 'SOL';
  const toToken = intent.tokens?.to || 'USDC';
  
  const inputMint = TOKENS[fromToken];
  const outputMint = TOKENS[toToken];
  
  if (!inputMint || !outputMint) {
    throw new Error(`Unknown token pair: ${fromToken} → ${toToken}`);
  }

  // Convert amount to lamports/raw amount
  let amount = intent.amount;
  if (fromToken === 'SOL') {
    amount = amount * LAMPORTS_PER_SOL;
  } else {
    amount = amount * 1_000_000; // USDC/USDT have 6 decimals
  }

  return await executeSwap(connection, wallet, inputMint, outputMint, amount);
}

/**
 * Check wallet balance
 */
async function checkBalance(connection, wallet) {
  const balance = await connection.getBalance(wallet.publicKey);
  const solBalance = balance / LAMPORTS_PER_SOL;
  
  console.log(`\n💰 Wallet Balance`);
  console.log(`   Address: ${wallet.publicKey.toString()}`);
  console.log(`   SOL: ${solBalance.toFixed(4)}`);
  console.log(`   View: https://explorer.solana.com/address/${wallet.publicKey.toString()}?cluster=devnet`);
  
  return {
    status: 'success',
    type: 'balance',
    balance: solBalance,
    address: wallet.publicKey.toString(),
  };
}

/**
 * Execute lend/deposit intent
 */
async function executeLendIntent(connection, wallet, intent) {
  const token = intent.unit?.toUpperCase() || 'USDC';
  const amount = intent.amount;
  
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount for lending');
  }
  
  // Check current position first
  const position = await getKaminoPosition(connection, wallet, token);
  
  // Show APY
  console.log(`📈 Current ${token} APY on Kamino: ${position.apy}%`);
  
  // Execute deposit
  return await depositToKamino(connection, wallet, token, amount);
}

/**
 * Execute withdraw intent
 */
export async function executeWithdrawIntent(connection, wallet, intent) {
  const token = intent.unit?.toUpperCase() || 'USDC';
  const amount = intent.amount;
  
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount for withdrawal');
  }
  
  return await withdrawFromKamino(connection, wallet, token, amount);
}

/**
 * Execute position check intent
 */
async function executePositionIntent(connection, wallet, intent) {
  const token = intent.unit?.toUpperCase() || 'USDC';
  
  console.log(`📊 Checking ${token} position on Kamino...`);
  
  const position = await getKaminoPosition(connection, wallet, token);
  const apy = await getKaminoAPY(token);
  
  console.log(`\n📈 ${token} Position:`);
  console.log(`   Deposited: ${position.deposited} ${token}`);
  console.log(`   Earned: ${position.earned} ${token}`);
  console.log(`   APY: ${apy}%`);
  
  return {
    status: 'success',
    type: 'position',
    token,
    position,
    apy
  };
}
