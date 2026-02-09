/**
 * Jupiter Exchange Integration
 * Executes swaps on Solana via Jupiter V6 API
 */

import { Connection, VersionedTransaction } from '@solana/web3.js';

const JUPITER_API = 'https://quote-api.jup.ag/v6';

/**
 * Get swap quote from Jupiter
 */
export async function getSwapQuote(inputMint, outputMint, amount, slippageBps = 50) {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps.toString(),
    onlyDirectRoutes: 'false',
    asLegacyTransaction: 'false',
  });

  const url = `${JUPITER_API}/quote?${params}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Quote failed: ${response.status} ${await response.text()}`);
  }

  return await response.json();
}

/**
 * Get swap transaction from Jupiter
 */
export async function getSwapTransaction(quoteResponse, userPublicKey) {
  const response = await fetch(`${JUPITER_API}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      computeUnitPriceMicroLamports: 1000,
      asLegacyTransaction: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Swap transaction failed: ${response.status}`);
  }

  const data = await response.json();
  return data.swapTransaction;
}

/**
 * Execute swap (quote + transaction + sign + send)
 */
export async function executeSwap(connection, wallet, inputMint, outputMint, amount) {
  console.log(`🔄 Getting quote: ${amount} ${inputMint.slice(0, 4)}... → ${outputMint.slice(0, 4)}...`);
  
  // Get quote
  const quote = await getSwapQuote(inputMint, outputMint, amount);
  console.log(`📊 Quote received: ${quote.outAmount} out`);
  console.log(`   Route: ${quote.routePlan.map(r => r.swapInfo.label).join(' → ')}`);

  // Get swap transaction
  console.log('📝 Building transaction...');
  const swapTransactionBase64 = await getSwapTransaction(quote, wallet.publicKey.toString());

  // Deserialize and sign
  const swapTransactionBuf = Buffer.from(swapTransactionBase64, 'base64');
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
  
  console.log('✍️  Signing transaction...');
  transaction.sign([wallet]);

  // Send transaction
  console.log('📤 Sending transaction...');
  const signature = await connection.sendTransaction(transaction, {
    maxRetries: 3,
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  console.log(`✅ Transaction sent: ${signature}`);
  console.log(`   View: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  // Wait for confirmation
  console.log('⏳ Waiting for confirmation...');
  await connection.confirmTransaction(signature, 'confirmed');
  console.log('✅ Transaction confirmed!');

  return {
    signature,
    inputAmount: amount,
    outputAmount: quote.outAmount,
    route: quote.routePlan,
  };
}

// Token mints (devnet)
export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};
