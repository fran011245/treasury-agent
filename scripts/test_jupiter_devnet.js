import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readFileSync } from 'fs';

const JUPITER_API = 'https://quote-api.jup.ag/v6';

// Devnet token addresses
const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC
};

console.log('🧪 Testing Jupiter API on devnet...\n');

// Test quote
const amount = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL in lamports
const params = new URLSearchParams({
  inputMint: TOKENS.SOL,
  outputMint: TOKENS.USDC,
  amount: amount.toString(),
  slippageBps: '50',
});

const url = `${JUPITER_API}/quote?${params}`;
console.log('Requesting:', url.slice(0, 80) + '...\n');

try {
  const response = await fetch(url);
  console.log('Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Quote received!');
    console.log('  Input:', data.inputMint.slice(0, 16) + '...');
    console.log('  Output:', data.outputMint.slice(0, 16) + '...');
    console.log('  In amount:', data.inAmount);
    console.log('  Out amount:', data.outAmount);
    console.log('  Routes:', data.routePlan.length);
  } else {
    console.log('❌ Error:', await response.text());
  }
} catch (error) {
  console.log('❌ Fetch error:', error.message);
}
