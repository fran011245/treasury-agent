#!/usr/bin/env node
/**
 * Check complete wallet portfolio (SOL + all tokens)
 * Usage: node scripts/check_portfolio.js
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Known token metadata
const TOKEN_INFO = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', decimals: 6, name: 'Tether USD' },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', decimals: 5, name: 'Bonk' },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', decimals: 6, name: 'Jupiter' },
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9, name: 'Wrapped SOL' }
};

async function checkPortfolio() {
  console.log('💼 Portfolio Overview\n');

  // Load keypair
  const keypairPath = path.join(__dirname, '../../crypto/wallets/walt_solana_hackathon-keypair.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const publicKey = new PublicKey(keypairData.slice(32, 64));
  
  const address = publicKey.toString();
  console.log(`Wallet: ${address}`);
  console.log('Network: Solana Mainnet\n');
  
  // Connect to mainnet
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  try {
    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceUI = solBalance / LAMPORTS_PER_SOL;
    
    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 Holdings\n');
    
    let totalUSD = 0;
    const holdings = [];
    
    // SOL
    const solPriceUSD = 99.73; // From last swap
    const solValueUSD = solBalanceUI * solPriceUSD;
    totalUSD += solValueUSD;
    
    holdings.push({
      symbol: 'SOL',
      balance: solBalanceUI,
      valueUSD: solValueUSD,
      isNative: true
    });
    
    console.log(`SOL:     ${solBalanceUI.toFixed(6)} SOL (~$${solValueUSD.toFixed(2)})`);
    
    // Token accounts
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info;
      const mint = parsedInfo.mint;
      const balance = parsedInfo.tokenAmount.uiAmount;
      
      if (balance > 0) {
        const tokenInfo = TOKEN_INFO[mint];
        const symbol = tokenInfo?.symbol || mint.slice(0, 8);
        const name = tokenInfo?.name || 'Unknown Token';
        
        // Estimate USD value (USDC/USDT = 1:1, others skip for now)
        let valueUSD = 0;
        if (symbol === 'USDC' || symbol === 'USDT') {
          valueUSD = balance;
          totalUSD += valueUSD;
        }
        
        holdings.push({
          symbol,
          balance,
          valueUSD,
          mint,
          name
        });
        
        const valueStr = valueUSD > 0 ? ` (~$${valueUSD.toFixed(2)})` : '';
        console.log(`${symbol}:    ${balance.toFixed(6)} ${symbol}${valueStr}`);
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`💵 Total Value: ~$${totalUSD.toFixed(2)} USD`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Portfolio breakdown
    console.log('📊 Allocation:\n');
    holdings.forEach(h => {
      if (h.valueUSD > 0) {
        const percentage = (h.valueUSD / totalUSD * 100).toFixed(1);
        console.log(`   ${h.symbol}: ${percentage}% ($${h.valueUSD.toFixed(2)})`);
      }
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 Status Summary\n');
    console.log(`✅ Active Holdings: ${holdings.length}`);
    console.log(`✅ Total Value: $${totalUSD.toFixed(2)}`);
    console.log(`✅ Gas Reserve: ${solBalanceUI.toFixed(6)} SOL`);
    
    if (solBalanceUI < 0.01) {
      console.log(`⚠️  Low SOL balance - consider keeping more for gas`);
    } else if (solBalanceUI > 0.2) {
      console.log(`✅ Healthy SOL reserve`);
    }
    
    console.log(`\n🔍 Explorer: https://solscan.io/account/${address}`);
    
  } catch (error) {
    console.error('❌ Error checking portfolio:', error.message);
    process.exit(1);
  }
}

checkPortfolio().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
