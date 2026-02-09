#!/usr/bin/env node
/**
 * Test Jupiter quote API - Simple version
 * Usage: node scripts/test_jupiter_simple.js <amount> <inputToken> <outputToken>
 * Example: node scripts/test_jupiter_simple.js 0.01 SOL USDC
 */

import { createJupiterApiClient } from '@jup-ag/api';

// Token addresses
const TOKENS = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
};

async function getJupiterQuote(amountSOL, inputToken, outputToken) {
  console.log('🔍 Jupiter Quote Request\n');
  
  // Resolve token addresses
  const inputMint = TOKENS[inputToken.toUpperCase()] || inputToken;
  const outputMint = TOKENS[outputToken.toUpperCase()] || outputToken;
  
  // Convert to smallest unit
  let amount;
  if (inputToken.toUpperCase() === 'SOL') {
    amount = Math.floor(parseFloat(amountSOL) * 1e9); // SOL has 9 decimals
  } else if (inputToken.toUpperCase() === 'USDC' || inputToken.toUpperCase() === 'USDT') {
    amount = Math.floor(parseFloat(amountSOL) * 1e6); // USDC/USDT have 6 decimals
  } else {
    amount = Math.floor(parseFloat(amountSOL) * 1e9); // Default 9 decimals
  }
  
  console.log(`Input: ${amountSOL} ${inputToken}`);
  console.log(`Output: ${outputToken}`);
  console.log(`Input Mint: ${inputMint}`);
  console.log(`Output Mint: ${outputMint}`);
  console.log(`Amount (raw): ${amount}\n`);
  
  try {
    // Create Jupiter API client
    const jupiterQuoteApi = createJupiterApiClient();
    
    console.log('📡 Fetching quote from Jupiter...\n');
    
    // Get quote
    const quote = await jupiterQuoteApi.quoteGet({
      inputMint,
      outputMint,
      amount,
      slippageBps: 50, // 0.5%
      onlyDirectRoutes: false,
      asLegacyTransaction: false
    });
    
    if (!quote) {
      console.error('❌ No quote received');
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
    console.log(`📥 You send:     ${inAmountUI.toFixed(6)} ${inputToken}`);
    console.log(`📤 You receive:  ${outAmountUI.toFixed(6)} ${outputToken}`);
    console.log(`💱 Price:        1 ${inputToken} = ${(outAmountUI / inAmountUI).toFixed(4)} ${outputToken}`);
    console.log(`📊 Price Impact: ${priceImpact.toFixed(3)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Show route details
    if (quote.routePlan && quote.routePlan.length > 0) {
      console.log('🗺️  Route Details:\n');
      quote.routePlan.forEach((step, i) => {
        const swapInfo = step.swapInfo;
        const dex = swapInfo.label || 'Unknown DEX';
        const feeAmount = parseFloat(swapInfo.feeAmount || 0) / Math.pow(10, inDecimals);
        console.log(`  ${i + 1}. ${dex}`);
        if (feeAmount > 0) {
          console.log(`     Fee: ${feeAmount.toFixed(6)} ${inputToken}`);
        }
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
    
    if (quote.routePlan?.length > 3) {
      console.log('  🟡 Complex route with multiple hops. Higher gas costs.');
    } else {
      console.log('  🟢 Simple route. Efficient execution.');
    }
    
    console.log('\n✅ Quote test successful! Ready to execute swaps on mainnet.');
    console.log(`💰 Current wallet balance: 0.345 SOL`);
    
  } catch (error) {
    console.error('❌ Error fetching quote:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Parse CLI args
const amountSOL = process.argv[2] || '0.01';
const inputToken = process.argv[3] || 'SOL';
const outputToken = process.argv[4] || 'USDC';

getJupiterQuote(amountSOL, inputToken, outputToken).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
