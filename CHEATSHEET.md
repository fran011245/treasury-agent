# 📋 TreasuryAgent Cheat Sheet

**Copy-paste these commands to try TreasuryAgent**

---

## 🚀 3-Command Test Drive

```bash
# 1. Check your balance
check balance

# 2. Try a small swap  
swap 0.01 SOL to USDC

# 3. Check balance again to see the change
check balance
```

✅ **If these work, TreasuryAgent is running!**

---

## 💰 All Available Commands

### Basic
```
check balance
```

### Swapping (Jupiter)
```
swap 0.1 SOL to USDC
swap 100 USDC to SOL
swap 50 USDC to USDT
```

### Lending (Kamino)
```
deposit 100 USDC
withdraw 50 USDC
check my USDC position
```

### Getting Help
```
help
exit
```

---

## 🎮 Example Sessions

### Session 1: First Time User
```
> check balance
💰 Balance: 2.5 SOL

> swap 0.1 SOL to USDC
🔄 Quote: 0.1 SOL → 24.12 USDC
✅ Swapped! Tx: 5xK3...p9m

> check balance
💰 Balance: 2.4 SOL + 24.12 USDC

> exit
👋 Goodbye!
```

### Session 2: Yield Farmer
```
> check balance
💰 Balance: 5.0 SOL

> swap 2 SOL to USDC
🔄 Quote: 2 SOL → 482.4 USDC
✅ Swapped!

> deposit 400 USDC
📈 APY: 8.5%
✅ Deposited!

> check my USDC position
📊 Deposited: 400 USDC
📊 Earned: 0.00 USDC (just started)
📊 APY: 8.5%

> exit
```

### Session 3: Checking Progress
```
> check my USDC position
📊 Deposited: 400 USDC
📊 Earned: 2.34 USDC (earning yield!)
📊 APY: 8.5%

> withdraw 100 USDC
✅ Withdrawn!

> check my USDC position
📊 Deposited: 300 USDC
📊 Earned: 0.00 USDC (new deposit)
```

---

## ⚠️ Common Mistakes

### ❌ Wrong
```
> swap SOL to USDC          # Missing amount!
> deposit USDC              # Missing amount!
> check usdc                # Wrong command!
```

### ✅ Right
```
> swap 0.1 SOL to USDC      # Amount + tokens
> deposit 100 USDC          # Amount + token
> check my USDC position    # Full command
```

---

## 🔧 Quick Fixes

| Problem | Solution |
|---------|----------|
| "Balance is 0" | Run: `solana airdrop 2 YOUR_WALLET --url devnet` |
| "Command not found" | Make sure you ran `npm start` first |
| "Transaction failed" | Try smaller amount (0.01 instead of 1) |
| "Error: fetch failed" | Check internet connection |

---

## 🎯 30-Second Pitch

**What:** TreasuryAgent lets you manage your Solana portfolio by talking to it.

**How:** Type commands in plain English → Agent executes on-chain.

**Example:** 
- You: "Earn yield on my SOL"
- Agent: Swaps half to USDC → Deposits to Kamino → Stakes half with Jito
- Result: You're earning yield on autopilot

**Who:** Anyone who wants DeFi without the complexity.

---

## 📊 What Each Component Does

| Component | What It Does | Example |
|-----------|--------------|---------|
| **Parser** | Understands your words | "swap 0.1 SOL to USDC" → Intent object |
| **Risk Manager** | Keeps you safe | Blocks transactions > 10 SOL |
| **Jupiter** | Finds best swap rates | Compares 20+ DEXes |
| **Kamino** | Lending protocol | Earns yield on your USDC |
| **Executor** | Makes it happen | Signs & sends transactions |

---

## 🏆 Hackathon Status

**Current:** Day 1 Complete ✅
**Working:** Balance, Swaps (code), Lending (mock)
**Tomorrow:** Real testing on devnet

**Repo:** github.com/fran011245/treasury-agent

---

*Print this page or keep it open while testing!*
