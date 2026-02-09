#!/usr/bin/env node
/**
 * Fund Solana devnet wallet with SOL airdrop
 * Usage: node scripts/fund_devnet.js [amount_in_sol]
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fundDevnetWallet(amountSOL = 2) {
  console.log('🪂 Funding Solana Devnet Wallet...\n');

  // Load keypair
  const keypairPath = path.join(__dirname, '../../crypto/wallets/walt_solana_hackathon-keypair.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  console.log(`Wallet: ${keypair.publicKey.toString()}`);
  
  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  console.log('Network: Solana Devnet\n');

  // Check current balance
  const balanceBefore = await connection.getBalance(keypair.publicKey);
  console.log(`Balance before: ${balanceBefore / LAMPORTS_PER_SOL} SOL`);

  // Request airdrop
  console.log(`\nRequesting ${amountSOL} SOL airdrop...`);
  try {
    const airdropSignature = await connection.requestAirdrop(
      keypair.publicKey,
      amountSOL * LAMPORTS_PER_SOL
    );

    console.log('Waiting for confirmation...');
    await connection.confirmTransaction(airdropSignature);
    
    console.log(`✅ Airdrop confirmed!`);
    console.log(`Signature: ${airdropSignature}`);

    // Check new balance
    const balanceAfter = await connection.getBalance(keypair.publicKey);
    console.log(`\nBalance after: ${balanceAfter / LAMPORTS_PER_SOL} SOL`);
    console.log(`Received: ${(balanceAfter - balanceBefore) / LAMPORTS_PER_SOL} SOL`);
    
  } catch (error) {
    console.error('❌ Airdrop failed:', error.message);
    
    // Try to get balance anyway
    const currentBalance = await connection.getBalance(keypair.publicKey);
    console.log(`\nCurrent balance: ${currentBalance / LAMPORTS_PER_SOL} SOL`);
    
    if (error.message.includes('airdrop request limit')) {
      console.log('\n💡 Hint: Devnet airdrop is rate-limited. Wait a few minutes and try again.');
      console.log('Or use: https://faucet.solana.com/');
    }
    
    process.exit(1);
  }
}

// Parse CLI args
const amountArg = process.argv[2];
const amount = amountArg ? parseFloat(amountArg) : 2;

fundDevnetWallet(amount).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
