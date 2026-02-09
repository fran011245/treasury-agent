#!/usr/bin/env node
/**
 * Execute real swap on Solana mainnet via Jupiter
 * Usage: node scripts/execute_swap.js <amount> <inputToken> <outputToken>
 * Example: node scripts/execute_swap.js 0.1 SOL USDC
 */

import { createJupiterApiClient } from '@jup-ag/api';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Token addresses
const TOKENS = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
};

async function executeSwap(amountInput, inputToken, outputToken) {
  console.log('🔄 Executing Swap on Solana Mainnet\n');
  console.log('⚠️  REAL MONEY - REAL TRANSACTION\n');
  
  // Load wallet
  const keypairPath = path.join(__dirname, '../../crypto/wallets/walt_solana_hackathon-keypair.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  console.log(`Wallet: ${wallet.publicKey.toString()}\n`);
  
  // Connect to mainnet
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  // SECURITY: Check balance before proceeding
  const currentBalance = await connection.getBalance(wallet.publicKey);
  const currentBalanceSOL = currentBalance / 1e9;
  console.log(`💰 Current balance: ${currentBalanceSOL.toFixed(6)} SOL\n`);
  
  // Resolve token addresses
  const inputMint = TOKENS[inputToken.toUpperCase()] || inputToken;
  const outputMint = TOKENS[outputToken.toUpperCase()] || outputToken;
  
  // Convert to smallest unit
  let amount;
  if (inputToken.toUpperCase() === 'SOL') {
    amount = Math.floor(parseFloat(amountInput) * 1e9);
  } else if (inputToken.toUpperCase() === 'USDC' || inputToken.toUpperCase() === 'USDT') {
    amount = Math.floor(parseFloat(amountInput) * 1e6);
  } else {
    amount = Math.floor(parseFloat(amountInput) * 1e9);
  }
  
  console.log(`📊 Swap Details:`);
  console.log(`   Input: ${amountInput} ${inputToken}`);
  console.log(`   Output: ${outputToken}`);
  console.log(`   Amount: ${amount} (smallest unit)\n`);
  
  // SECURITY: Enforce maximum transaction limit
  const maxTransactionSOL = parseFloat(process.env.MAX_TRANSACTION_SOL || 10);
  if (inputToken.toUpperCase() === 'SOL' && parseFloat(amountInput) > maxTransactionSOL) {
    console.error(`❌ SECURITY LIMIT EXCEEDED`);
    console.error(`   Amount: ${amountInput} SOL`);
    console.error(`   Maximum allowed: ${maxTransactionSOL} SOL`);
    console.error(`   Set MAX_TRANSACTION_SOL in .env to increase limit\n`);
    process.exit(1);
  }
  console.log(`✅ Security check: Amount ${amountInput} SOL within limit (max: ${maxTransactionSOL} SOL)\n`);
  
  // SECURITY: Validate sufficient balance for SOL swaps
  if (inputToken.toUpperCase() === 'SOL') {
    const requiredAmount = amount + 10000000; // amount + 0.01 SOL for gas
    if (currentBalance < requiredAmount) {
      console.error(`❌ INSUFFICIENT BALANCE`);
      console.error(`   Current: ${currentBalanceSOL.toFixed(6)} SOL`);
      console.error(`   Required: ${(requiredAmount / 1e9).toFixed(6)} SOL (includes 0.01 SOL for gas)`);
      console.error(`   Missing: ${((requiredAmount - currentBalance) / 1e9).toFixed(6)} SOL\n`);
      process.exit(1);
    }
    console.log(`✅ Balance check: Sufficient SOL (${currentBalanceSOL.toFixed(6)} SOL available)\n`);
  }
  
  try {
    // Step 1: Get quote
    console.log('1️⃣ Getting quote from Jupiter...');
    const jupiterQuoteApi = createJupiterApiClient();
    
    const quote = await jupiterQuoteApi.quoteGet({
      inputMint,
      outputMint,
      amount,
      slippageBps: 50, // 0.5% slippage
      onlyDirectRoutes: false,
    });
    
    if (!quote) {
      console.error('❌ Failed to get quote');
      process.exit(1);
    }
    
    // Parse amounts
    const inDecimals = inputToken.toUpperCase() === 'SOL' ? 9 : 
                       inputToken.toUpperCase() === 'USDC' || inputToken.toUpperCase() === 'USDT' ? 6 : 9;
    const outDecimals = outputToken.toUpperCase() === 'SOL' ? 9 :
                        outputToken.toUpperCase() === 'USDC' || outputToken.toUpperCase() === 'USDT' ? 6 : 9;
    
    const inAmountUI = parseFloat(quote.inAmount) / Math.pow(10, inDecimals);
    const outAmountUI = parseFloat(quote.outAmount) / Math.pow(10, outDecimals);
    const priceImpact = parseFloat(quote.priceImpactPct || 0);
    
    console.log('✅ Quote received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 Sending:      ${inAmountUI.toFixed(6)} ${inputToken}`);
    console.log(`📤 Receiving:    ${outAmountUI.toFixed(6)} ${outputToken}`);
    console.log(`💱 Price:        1 ${inputToken} = ${(outAmountUI / inAmountUI).toFixed(4)} ${outputToken}`);
    console.log(`📊 Price Impact: ${priceImpact.toFixed(3)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Step 2: Get swap transaction
    console.log('2️⃣ Building swap transaction...');
    
    const swapResult = await jupiterQuoteApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 10000000,
            priorityLevel: 'medium'
          }
        }
      }
    });
    
    if (!swapResult || !swapResult.swapTransaction) {
      console.error('❌ Failed to get swap transaction');
      process.exit(1);
    }
    
    console.log('✅ Transaction built!\n');
    
    // SECURITY: Require human confirmation if enabled
    if (process.env.REQUIRE_CONFIRMATION === 'true') {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('⚠️  CONFIRM TRANSACTION? Type "yes" to proceed: ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Transaction cancelled by user\n');
        process.exit(0);
      }
      
      console.log('✅ Transaction confirmed by user\n');
    }
    
    // Step 3: Deserialize and sign transaction
    console.log('3️⃣ Signing transaction...');
    
    const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    transaction.sign([wallet]);
    
    console.log('✅ Transaction signed!\n');
    
    // Step 4: Send transaction
    console.log('4️⃣ Broadcasting to Solana mainnet...');
    console.log('⏳ This may take a few seconds...\n');
    
    const rawTransaction = transaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2
    });
    
    console.log(`📡 Transaction sent!`);
    console.log(`   Signature: ${txid}\n`);
    
    // Step 5: Confirm transaction
    console.log('5️⃣ Waiting for confirmation...');
    
    const confirmation = await connection.confirmTransaction(txid, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      process.exit(1);
    }
    
    console.log('✅ Transaction CONFIRMED!\n');
    
    // Final summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SWAP SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 Spent:    ${inAmountUI.toFixed(6)} ${inputToken}`);
    console.log(`📤 Received: ${outAmountUI.toFixed(6)} ${outputToken}`);
    console.log(`🔗 Explorer: https://solscan.io/tx/${txid}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Check new balances
    console.log('💰 Checking new balance...');
    const newBalance = await connection.getBalance(wallet.publicKey);
    console.log(`   SOL Balance: ${(newBalance / 1e9).toFixed(6)} SOL\n`);
    
    console.log('✅ First mainnet swap complete! TreasuryAgent is live. 🚀');
    
  } catch (error) {
    console.error('❌ Swap failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.logs) {
      console.error('Transaction logs:', error.logs);
    }
    process.exit(1);
  }
}

// Parse CLI args
const amountInput = process.argv[2];
const inputToken = process.argv[3];
const outputToken = process.argv[4];

if (!amountInput || !inputToken || !outputToken) {
  console.error('Usage: node execute_swap.js <amount> <inputToken> <outputToken>');
  console.error('Example: node execute_swap.js 0.1 SOL USDC');
  process.exit(1);
}

console.log('\n⚠️  WARNING: You are about to execute a REAL swap on Solana mainnet.');
console.log('⚠️  This will spend real SOL and execute a real transaction.');
console.log('⚠️  Transaction details will be shown before execution.\n');

executeSwap(amountInput, inputToken, outputToken).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
