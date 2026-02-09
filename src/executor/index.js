/**
 * Executor Coordinator
 * Routes intents to appropriate protocol executors
 */

import { executeSwap, TOKENS } from './jupiter.js';
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
        console.log('⚠️  Lending not yet implemented');
        return { status: 'pending', type: 'lend' };
      
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
