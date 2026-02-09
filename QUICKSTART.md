# 🚀 Quick Start Guide — 5 Minutes to First Transaction

**TreasuryAgent** — Talk to your Solana wallet in plain English.

---

## ⚡ Option 1: Ultra-Fast (5 min)

### 1. Clone & Install
```bash
git clone https://github.com/fran011245/treasury-agent.git
cd treasury-agent
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env and add your wallet (or use the test wallet)
```

### 3. Run Demo
```bash
npm run demo
```

**Expected output:**
```
🤖 TreasuryAgent initializing...
✅ Wallet loaded: 38k7ibjMsow...
💰 Balance: 2.5 SOL

🎬 Demo Mode

👤 User: "check balance"
💰 Wallet Balance: 2.5 SOL

👤 User: "swap 0.01 SOL to USDC"
🔄 Getting quote...
📊 Quote: 0.01 SOL → 2.41 USDC
...
```

✅ **Done!** You just ran TreasuryAgent.

---

## 🎮 Option 2: Interactive Mode (10 min)

### 1. Get Devnet SOL (Free)
```bash
# If you have Solana CLI:
solana airdrop 2 38k7ibjMsowMjDpiCZhULEeW8BcUhYwapYRUrweheRuA --url devnet

# Or use a faucet: https://faucet.solana.com/
```

### 2. Start Interactive Mode
```bash
npm start
```

### 3. Try Commands
```
> check balance
💰 Balance: 2.0 SOL

> swap 0.1 SOL to USDC
🔄 Quote: 0.1 SOL → 24.12 USDC
✅ Transaction sent: 5xK3...p9m

> deposit 10 USDC
📈 APY: 8.5%
✅ Deposited to Kamino vault

> check my USDC position
📊 Position: 10 USDC deposited
📈 Earned: 0.02 USDC
```

### 4. Exit
```
> exit
👋 Goodbye!
```

---

## 🧪 Option 3: Test Without Real Money

Don't want to use real SOL? No problem!

### Run the Mock Demo
```bash
node scripts/demo_detailed.js
```

This shows exactly what TreasuryAgent **would** do, without sending real transactions.

**Useful for:**
- Understanding the flow
- Testing commands
- Showing to friends

---

## 📋 Command Reference

| Command | What It Does | Example |
|---------|--------------|---------|
| `check balance` | Shows your SOL balance | `check balance` |
| `swap X SOL to USDC` | Swaps SOL for USDC | `swap 0.5 SOL to USDC` |
| `swap X USDC to SOL` | Swaps USDC for SOL | `swap 100 USDC to SOL` |
| `deposit X USDC` | Lends USDC on Kamino | `deposit 50 USDC` |
| `withdraw X USDC` | Withdraws from Kamino | `withdraw 25 USDC` |
| `check my USDC position` | Shows your lending position | `check my USDC position` |

---

## 🆘 Troubleshooting

### "Balance is 0"
```bash
# Get free devnet SOL
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

### "npm install fails"
```bash
# Make sure you have Node.js 18+
node --version

# If not, install from https://nodejs.org/
```

### "Command not recognized"
Make sure you're running the interactive mode:
```bash
npm start
```

### "Transaction failed"
- Check you have enough SOL for fees (0.001 SOL min)
- Make sure you're on devnet (not mainnet)
- Try a smaller amount

---

## 🎯 What to Try First

### Beginner Path
1. `check balance` — See your SOL
2. `swap 0.01 SOL to USDC` — Try a small swap
3. `check balance` — See the change

### Intermediate Path
1. `swap 0.1 SOL to USDC` — Get some USDC
2. `deposit 50 USDC` — Lend it
3. `check my USDC position` — See it earning yield
4. `withdraw 25 USDC` — Take some back

### Advanced Path
1. Check the code: `src/parser/index.js` — See how NLP works
2. Check: `src/executor/jupiter.js` — See Jupiter integration
3. Modify: Add your own command!

---

## 📞 Need Help?

- **Forum:** https://agents.colosseum.com/forum/posts/3362
- **GitHub Issues:** https://github.com/fran011245/treasury-agent/issues
- **Twitter:** @Walt1480341

---

## 🎉 Success!

If you see this, you're ready:
```
✅ TreasuryAgent ready!

🎮 Interactive Mode
Commands:
  "check balance"
  "swap 0.1 SOL to USDC"
  "deposit 100 USDC"
  "check my USDC position"
  "exit"

> 
```

**Now tell it what you want!** 🚀

---

*Built by Walt & Chico for the Colosseum Agent Hackathon*
