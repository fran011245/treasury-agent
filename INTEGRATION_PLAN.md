# TreasuryAgent + moltlaunch Integration Plan

## The Vision

An autonomous AI agent that:
1. **Manages DeFi portfolios** on Solana (Jupiter, Kamino, Jito)
2. **Has its own economy** via $WALT token on Base
3. **Earns from both**: protocol fees + trading fees
4. **Documents everything** on therealwalt blog

---

## Two Chains, One Agent

### Solana (via TreasuryAgent)
- **What:** Portfolio management for users
- **Income:** Service fees (future)
- **Demo:** Manages own devnet wallet during hackathon
- **Tech:** Jupiter swaps, Kamino lending, Jito staking

### Base (via moltlaunch)
- **What:** Agent economic network
- **Income:** Swap fees on $WALT token
- **Demo:** Active trader in agent network
- **Tech:** moltlaunch CLI, ERC-20 trading, on-chain memos

---

## Integration Points

### 1. Shared Wallet Management
Both systems need ETH/SOL. One unified "fund" command:
```bash
npm run fund --chain solana  # shows devnet address
npm run fund --chain base     # shows Base address
```

### 2. Cross-Chain Strategy
Portfolio decisions on Solana can inform trading on Base:
- High confidence strategy → Buy tokens of agents with similar strategies
- Portfolio performance → Signal in memos ("my portfolio up 12% using this approach")

### 3. Unified Reporting
Dashboard shows:
- Solana positions (Jupiter/Kamino/Jito)
- Base holdings ($WALT + other agent tokens)
- Total portfolio value across chains
- Fee income from both sources

### 4. Memo = Content
Every moltlaunch trade memo becomes blog content:
```
Trade: Buy $AGENT-X 0.01 ETH
Memo: "strong fee revenue, active memos, holder growth"
  ↓
Blog post: "Why I invested in Agent X"
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  TreasuryAgent                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐              ┌──────────────┐    │
│  │   Solana     │              │     Base     │    │
│  │   Module     │              │    Module    │    │
│  ├──────────────┤              ├──────────────┤    │
│  │ • Jupiter    │              │ • moltlaunch │    │
│  │ • Kamino     │              │ • $WALT mgmt │    │
│  │ • Jito       │              │ • Agent trade│    │
│  └──────┬───────┘              └──────┬───────┘    │
│         │                             │            │
│         └─────────┬───────────────────┘            │
│                   │                                 │
│          ┌────────▼────────┐                       │
│          │  Risk Manager   │                       │
│          │  (unified)      │                       │
│          └────────┬────────┘                       │
│                   │                                 │
│          ┌────────▼────────┐                       │
│          │   Dashboard     │                       │
│          │ (multi-chain)   │                       │
│          └─────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
treasury-agent/
├── src/
│   ├── index.js              # Main coordinator
│   ├── parser/               # Natural language
│   ├── risk/                 # Risk management (both chains)
│   ├── executor/
│   │   ├── solana/
│   │   │   ├── jupiter.js
│   │   │   ├── kamino.js
│   │   │   └── jito.js
│   │   └── base/
│   │       └── moltlaunch.js
│   └── dashboard/            # Unified reporting
├── config/
│   ├── solana.json
│   └── base.json
└── wallets/
    ├── solana-keypair.json
    └── base-wallet.json      # from moltlaunch
```

---

## Phase Rollout

### Phase 1: Solana Core (Day 1-4)
- [x] Parser + Risk ✅
- [ ] Jupiter swaps working
- [ ] Kamino deposits working
- [ ] Basic dashboard

### Phase 2: Base Integration (Day 3-5)
- [ ] Install moltlaunch CLI
- [ ] Fund Base wallet (~0.005 ETH)
- [ ] Launch $WALT token
- [ ] First agent trade with memo

### Phase 3: Unified Experience (Day 6-7)
- [ ] Single command: "invest 10% in Agent X" → executes on Base
- [ ] Single command: "stake 50% SOL" → executes on Solana
- [ ] Dashboard shows both chains
- [ ] Blog posts auto-generated from actions

### Phase 4: Meta-Demo (Day 8-9)
- [ ] Video: "24 hours with Walt"
- [ ] Shows: portfolio decisions + agent trading + content generation
- [ ] Submission to both communities

---

## Success Metrics

**For Colosseum Hackathon:**
- Working Jupiter integration ✓
- Real swaps executed on devnet ✓
- Natural language interface works ✓
- Multi-protocol (bonus: multi-chain!) ✓

**For moltlaunch Network:**
- $WALT token launched ✓
- Active trader (5+ trades with memos) ✓
- Power score > 20 ✓
- Cross-holdings with 2+ other agents ✓

**For Blog:**
- 5+ posts documenting journey ✓
- Real data (tx hashes, screenshots) ✓
- Behind-the-scenes technical details ✓

---

## Risk Mitigation

**If moltlaunch integration takes too long:**
- Phase 1 alone is a complete hackathon project
- Launch $WALT after hackathon ends
- Still write about "the plan" in blog

**If Base funding is an issue:**
- Testnet (Base Sepolia) works for demo
- Mainnet launch can wait

**If time is tight:**
- Jupiter-only integration is fine
- Kamino/Jito become "future work"
- moltlaunch becomes stretch goal

---

## Current Status

✅ Solana wallet created  
✅ Base wallet will be auto-created by moltlaunch  
✅ Code foundation ready  
⏳ Waiting for GitHub repo  
⏳ Then: start Phase 1 (Jupiter)  

**Day 3 decision point:** If Jupiter works, proceed to Phase 2. If not, polish Phase 1.

---

**This is ambitious. But doable. Let's ship.** 🚀
