#!/usr/bin/env node
/**
 * Check Solana wallet balance
 * Usage: node scripts/check_balance.js [network]
 * Network: mainnet-beta (default) | devnet
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl, PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkBalance(network = 'mainnet-beta') {
  console.log('💰 Checking Solana Wallet Balance...\n');

  // Load keypair
  const keypairPath = path.join(__dirname, '../../crypto/wallets/walt_solana_hackathon-keypair.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  const address = keypair.publicKey.toString();
  console.log(`Wallet: ${address}`);
  
  // Connect to specified network
  const connection = new Connection(clusterApiUrl(network), 'confirmed');
  console.log(`Network: Solana ${network}\n`);

  try {
    // Get balance
    const balance = await connection.getBalance(keypair.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    
    console.log(`Balance: ${balanceSOL} SOL (${balance} lamports)`);
    
    if (balance === 0) {
      console.log('\n❌ Wallet is empty!');
      if (network === 'mainnet-beta') {
        console.log('\n💡 Fund mainnet wallet:');
        console.log(`   Address: ${address}`);
        console.log(`   Recommended: 0.1-0.2 SOL (~$20-40 USD)`);
        console.log(`   • Covers gas fees (~0.00001 SOL per tx)`);
        console.log(`   • Room for swaps and testing`);
      } else {
        console.log(`\n💡 Fund ${network} wallet:`);
        console.log(`   1. Web faucet: https://faucet.solana.com/`);
        console.log(`   2. Paste address: ${address}`);
      }
    } else {
      console.log('\n✅ Wallet funded!');
      
      // Calculate transaction capacity
      const avgTxCost = 0.00001; // SOL per transaction
      const maxTxs = Math.floor(balanceSOL / avgTxCost);
      console.log(`\nApprox capacity: ~${maxTxs.toLocaleString()} transactions`);
      
      if (network === 'mainnet-beta' && balanceSOL < 0.01) {
        console.log('\n⚠️  Low balance warning: Consider adding more SOL');
      }
    }
    
    // Get account info
    const accountInfo = await connection.getAccountInfo(keypair.publicKey);
    if (accountInfo) {
      console.log(`\nAccount owner: ${accountInfo.owner.toString()}`);
      console.log(`Executable: ${accountInfo.executable}`);
      console.log(`Data size: ${accountInfo.data.length} bytes`);
    }
    
    // Show explorer link
    const explorerUrl = network === 'mainnet-beta' 
      ? `https://explorer.solana.com/address/${address}`
      : `https://explorer.solana.com/address/${address}?cluster=${network}`;
    console.log(`\n🔍 Explorer: ${explorerUrl}`);
    
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
    process.exit(1);
  }
}

// Parse CLI args
const networkArg = process.argv[2] || 'mainnet-beta';
checkBalance(networkArg).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
