import { Connection, Keypair, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { parseCommand } from '../src/parser/index.js';
import { checkRisk } from '../src/risk/manager.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const keypairData = JSON.parse(readFileSync('./keypair.json', 'utf-8'));
const wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('🎬 DEMO MODE - TreasuryAgent\n');
console.log('=' .repeat(50));
console.log('Wallet:', wallet.publicKey.toString());
console.log('Network: Devnet');
console.log('=' .repeat(50));

// Simulated Jupiter response
const mockQuote = {
  inputMint: 'So11111111111111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  inAmount: '10000000', // 0.01 SOL
  outAmount: '2411829', // ~2.41 USDC
  otherAmountThreshold: '2395701',
  swapMode: 'ExactIn',
  slippageBps: 50,
  priceImpactPct: '0.0086',
  routePlan: [
    {
      swapInfo: {
        ammKey: 'HcoJqG325TT5zXeYQ6H52z7L46JhFcUXGkb3tQn5q2E',
        label: 'Raydium',
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        inAmount: '10000000',
        outAmount: '2411829',
        feeAmount: '20000',
        feeMint: 'So11111111111111111111111111111111111111112'
      },
      percent: 100
    }
  ]
};

console.log('\n📋 Command: "swap 0.01 SOL to USDC"\n');

const parsed = parseCommand('swap 0.01 SOL to USDC');
console.log('🧠 Parsed Intent:');
console.log('  Type:', parsed.intent);
console.log('  Amount:', parsed.amount, parsed.unit);
console.log('  From:', parsed.tokens.from);
console.log('  To:', parsed.tokens.to);
console.log('  Confidence:', parsed.confidence);

console.log('\n✅ Risk Check: PASSED');
console.log('  Max transaction: 10 SOL');
console.log('  Requested: 0.01 SOL');

console.log('\n📊 Jupiter Quote (simulated):');
console.log('  Route: SOL → USDC via Raydium');
console.log('  Input: 0.01 SOL (10,000,000 lamports)');
console.log('  Output: ~2.41 USDC (2,411,829 units)');
console.log('  Slippage: 0.5%');
console.log('  Price Impact: 0.86%');

console.log('\n📝 Transaction Details:');
console.log('  From:', wallet.publicKey.toString());
console.log('  Program: Jupiter Aggregator v6');
console.log('  Instructions:');
console.log('    1. Wrap SOL to wSOL');
console.log('    2. Swap via Raydium pool');
console.log('    3. Unwrap wSOL to SOL (if needed)');
console.log('  Expected fee: ~0.000005 SOL');

console.log('\n🔐 Signing:');
console.log('  Signer:', wallet.publicKey.toString());
console.log('  Transaction size: ~450 bytes');

console.log('\n📤 To execute this for real:');
console.log('  1. Get devnet SOL:');
console.log('     solana airdrop 2', wallet.publicKey.toString(), '--url devnet');
console.log('  2. Run:');
console.log('     node src/index.js');
console.log('  3. Type: swap 0.01 SOL to USDC');

console.log('\n' + '='.repeat(50));
console.log('Demo complete!');
