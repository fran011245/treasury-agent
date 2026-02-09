#!/usr/bin/env node
/**
 * Test Jupiter quote API
 * Usage: node scripts/test_jupiter_quote.js <inputMint> <outputMint> <amount>
 * Example: node scripts/test_jupiter_quote.js SOL USDC 0.01
 */

import fetch from 'node-fetch';

// Token addresses
const TOKENS = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
};

async function getJupiterQuote(inputToken, outputToken, amountSOL) {
  console.log('🔍 Jupiter Quote Request\n');
  
  // Resolve token addresses
  const inputMint = TOKENS[inputToken.toUpperCase()] || inputToken;
  const outputMint = TOKENS[outputToken.toUpperCase()] || outputToken;
  
  // Convert SOL to lamports (or use raw amount for other tokens)
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
  
  // Build Jupiter API URL
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: '50', // 0.5% slippage
    onlyDirectRoutes: 'false',
    asLegacyTransaction: 'false'
  });
  
  const url = `https://quote-api.jup.ag/v6/quote?${params}`;
  
  console.log('📡 Fetching quote from Jupiter...\n');
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Jupiter API error (${response.status}):`, errorText);
      process.exit(1);
    }
    
    const data = await response.json();
    
    // Parse response
    const inAmount = parseFloat(data.inAmount);
    const outAmount = parseFloat(data.outAmount);
    
    // Get decimals for display
    const inDecimals = inputToken.toUpperCase() === 'SOL' ? 9 : 
                       inputToken.toUpperCase() === 'USDC' || inputToken.toUpperCase() === 'USDT' ? 6 : 9;
    const outDecimals = outputToken.toUpperCase() === 'SOL' ? 9 :
                        outputToken.toUpperCase() === 'USDC' || outputToken.toUpperCase() === 'USDT' ? 6 : 9;
    
    const inAmountUI = inAmount / Math.pow(10, inDecimals);
    const outAmountUI = outAmount / Math.pow(10, outDecimals);
    
    const priceImpact = parseFloat(data.priceImpactPct || 0);
    
    console.log('✅ Quote received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 You send:     ${inAmountUI.toFixed(6)} ${inputToken}`);
    console.log(`📤 You receive:  ${outAmountUI.toFixed(6)} ${outputToken}`);
    console.log(`💱 Price:        1 ${inputToken} = ${(outAmountUI / inAmountUI).toFixed(4)} ${outputToken}`);
    console.log(`📊 Price Impact: ${priceImpact.toFixed(3)}%`);
    console.log(`🛣️  Routes found:  ${data.routePlan?.length || 1}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Show route details
    if (data.routePlan && data.routePlan.length > 0) {
      console.log('🗺️  Route Details:\n');
      data.routePlan.forEach((step, i) => {
        const swapInfo = step.swapInfo;
        const dex = swapInfo.label || swapInfo.ammKey || 'Unknown DEX';
        console.log(`  ${i + 1}. ${dex}`);
        console.log(`     Fee: ${(parseFloat(swapInfo.feeAmount || 0) / Math.pow(10, inDecimals)).toFixed(6)} ${inputToken}`);
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
    
    if (data.routePlan?.length > 3) {
      console.log('  🟡 Complex route with multiple hops. Higher gas costs.');
    }
    
    console.log('\n✅ Quote test successful! Ready to execute swaps.');
    
  } catch (error) {
    console.error('❌ Error fetching quote:', error.message);
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
