import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readFileSync } from 'fs';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const keypairData = JSON.parse(readFileSync('./keypair.json', 'utf-8'));
const wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('🔍 Checking devnet balance...');
console.log('Address:', wallet.publicKey.toString());

const balance = await connection.getBalance(wallet.publicKey);
console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

if (balance === 0) {
  console.log('\n⚠️  Wallet needs airdrop!');
  console.log('Run: solana airdrop 2 ' + wallet.publicKey.toString() + ' --url devnet');
} else {
  console.log('\n✅ Ready for testing!');
}
