#!/usr/bin/env node
/**
 * Test Jupiter quote API using official SDK
 * Usage: node scripts/test_jupiter_quote_v2.js <inputToken> <outputToken> <amount>
 * Example: node scripts/test_jupiter_quote_v2.js SOL USDC 0.01
 */

import { Jupiter } from '@jup-ag/api';
import { Connection, PublicKey } from '@solana/web3.js';

// Token addresses
const TOKENS = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
};

async function getJupiterQuote(inputToken, outputToken, amountSOL) {
  console.log('🔍 Jupiter Quote Request (SDK)\n');
  
  // Resolve token addresses
  const inputMint = TOKENS[inputToken.toUpperCase()] || inputToken;
  const outputMint = TOKENS[outputToken.toUpperCase()] || outputToken;
  
  // Convert SOL to lamports
  let amount;
  if (inputToken.toUpperCase() === 'SOL') {
    amount = Math.floor(parseFloat(amountSOL) * 1e9);
  } else if (inputToken.toUpperCase() === 'USDC' || inputToken.toUpperCase() === 'USDT') {
    amount = Math.floor(parseFloat(amountSOL) * 1e6);
  } else {
    amount = Math.floor(parseFloat(amountSOL) * 1e9);
  }
  
  console.log(`Input: ${amountSOL} ${inputToken}`);
  console.log(`Output: ${outputToken}`);
  console.log(`Amount (raw): ${amount}\n`);
  
  try {
    // Initialize connection
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Initialize Jupiter
    console.log('📡 Initializing Jupiter SDK...\n');
    const jupiter = await Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
      user: PublicKey.default, // We don't need a real user for quotes
    });
    
    console.log('📡 Fetching quote...\n');
    
    // Get quote
    const routes = await jupiter.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount,
      slippageBps: 50, // 0.5%
    });
    
    if (!routes || !routes.routesInfos || routes.routesInfos.length === 0) {
      console.log('❌ No routes found for this swap.');
      return;
    }
    
    // Get best route
    const bestRoute = routes.routesInfos[0];
    
    // Parse amounts
    const inDecimals = inputToken.toUpperCase() === 'SOL' ? 9 : 
                       inputToken.toUpperCase() === 'USDC' || inputToken.toUpperCase() === 'USDT' ? 6 : 9;
    const outDecimals = outputToken.toUpperCase() === 'SOL' ? 9 :
                        outputToken.toUpperCase() === 'USDC' || outputToken.toUpperCase() === 'USDT' ? 6 : 9;
    
    const inAmountUI = parseFloat(bestRoute.inAmount) / Math.pow(10, inDecimals);
    const outAmountUI = parseFloat(bestRoute.outAmount) / Math.pow(10, outDecimals);
    
    const priceImpact = parseFloat(bestRoute.priceImpactPct || 0);
    
    console.log('✅ Quote received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 You send:     ${inAmountUI.toFixed(6)} ${inputToken}`);
    console.log(`📤 You receive:  ${outAmountUI.toFixed(6)} ${outputToken}`);
    console.log(`💱 Price:        1 ${inputToken} = ${(outAmountUI / inAmountUI).toFixed(4)} ${outputToken}`);
    console.log(`📊 Price Impact: ${priceImpact.toFixed(3)}%`);
    console.log(`🛣️  Routes found:  ${routes.routesInfos.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Show market info
    if (bestRoute.marketInfos && bestRoute.marketInfos.length > 0) {
      console.log('🗺️  Route Details:\n');
      bestRoute.marketInfos.forEach((market, i) => {
        console.log(`  ${i + 1}. ${market.label || 'Unknown DEX'}`);
      });
      console.log('');
    }
    
    // Risk assessment
    console.log('⚠️  Risk Assessment:\n');
    if (priceImpact > 1) {
      console.log('  🔴 HIGH price impact! Consider smaller amount.');
    } else if (priceImpact > 0.5) {
      console.log('  🟡 MEDIUM price impact. Acceptable for small trades.');
    } else {
      console.log('  🟢 LOW price impact. Good liquidity.');
    }
    
    console.log('\n✅ Quote test successful! Ready to execute swaps.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Parse CLI args
const inputToken = process.argv[2] || 'SOL';
const outputToken = process.argv[3] || 'USDC';
const amount = process.argv[4] || '0.01';

getJupiterQuote(inputToken, outputToken, amount).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
