# 👨‍💻 Developer Guide

**Want to understand how TreasuryAgent works? Contribute? Extend it?**

This guide is for you.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     User Input                          │
│              "swap 0.1 SOL to USDC"                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Parser (NLP)                          │
│  • Intent detection: swap, lend, balance, etc.          │
│  • Entity extraction: amounts, tokens, protocols        │
│  • Output: {type: 'swap', amount: 0.1, ...}            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 Risk Manager                            │
│  • Spending limits (max 10 SOL/tx)                      │
│  • Balance validation                                   │
│  • Circuit breakers                                     │
│  • Output: Approved / Rejected + reason                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Executor Coordinator                       │
│  • Routes to appropriate protocol                       │
│  • Jupiter (swaps), Kamino (lending), Jito (staking)   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Protocol Adapters                          │
│  • Jupiter: Quote API → Transaction → Sign → Send       │
│  • Kamino: SDK → Deposit/Withdraw/Position              │
│  • Jito: Staking SDK                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Code Structure

```
treasury-agent/
├── src/
│   ├── index.js              # Main entry, CLI, state
│   ├── parser/
│   │   └── index.js          # NLP: command → intent
│   ├── executor/
│   │   ├── index.js          # Coordinator
│   │   ├── jupiter.js        # Jupiter DEX integration
│   │   └── kamino.js         # Kamino lending integration
│   └── risk/
│       └── manager.js        # Risk checks & validation
├── scripts/                  # Utility scripts
├── tests/                    # (coming)
└── docs/                     # Documentation
```

---

## 🔍 Deep Dive: Parser

**File:** `src/parser/index.js`

**What it does:**
Takes natural language → Returns structured intent

**Example:**
```javascript
// Input
"swap 0.1 SOL to USDC"

// Output
{
  intent: 'swap',
  amount: 0.1,
  unit: 'sol',
  tokens: {
    from: 'SOL',
    to: 'USDC'
  },
  confidence: 0.8,
  raw: 'swap 0.1 SOL to USDC'
}
```

**How it works:**
1. Normalize text (lowercase, trim)
2. Pattern matching with regex
3. Extract amounts with regex
4. Extract tokens (SOL, USDC, USDT)

**Adding new intents:**
```javascript
// In src/parser/index.js
const patterns = {
  // ... existing patterns
  mynewintent: /pattern|to|match/,
};
```

---

## 🔍 Deep Dive: Jupiter Integration

**File:** `src/executor/jupiter.js`

**Flow:**
```javascript
// 1. Get quote
const quote = await getSwapQuote(
  inputMint,    // SOL
  outputMint,   // USDC
  amount        // 10000000 lamports (0.01 SOL)
);

// 2. Get swap transaction
const swapTx = await getSwapTransaction(
  quote,
  wallet.publicKey
);

// 3. Sign
const transaction = VersionedTransaction.deserialize(
  Buffer.from(swapTx, 'base64')
);
transaction.sign([wallet]);

// 4. Send
const signature = await connection.sendTransaction(transaction);
```

**Key functions:**
- `getSwapQuote()` — Gets best route from Jupiter
- `getSwapTransaction()` — Builds unsigned transaction
- `executeSwap()` — Full flow: quote → tx → sign → send

---

## 🔍 Deep Dive: Risk Manager

**File:** `src/risk/manager.js`

**Checks before every transaction:**
1. **Amount limits:** Max 10 SOL per transaction
2. **Balance check:** User has enough SOL
3. **Minimum balance:** Keep 0.05 SOL for fees
4. **Token-specific limits:** USDC max 10,000

**Adding new checks:**
```javascript
export function checkRisk(intent, balance) {
  // ... existing checks
  
  // Your new check
  if (someCondition) {
    return {
      approved: false,
      reason: 'Your custom reason'
    };
  }
  
  return { approved: true };
}
```

---

## 🧪 Testing

### Unit Tests (coming)
```bash
npm test
```

### Manual Testing
```bash
# Test parser
node -e "
  import('./src/parser/index.js').then(m => {
    console.log(m.parseCommand('swap 0.1 SOL to USDC'));
  });
"

# Test risk manager
node -e "
  import('./src/risk/manager.js').then(m => {
    console.log(m.checkRisk({type: 'swap', amount: 5}, 10000000000));
  });
"
```

### Integration Testing
```bash
# Full flow test
npm run demo

# Interactive testing
npm start
> check balance
> swap 0.01 SOL to USDC
```

---

## 🔌 Adding a New Protocol

**Example: Adding Solend lending**

### 1. Create adapter
```javascript
// src/executor/solend.js
export async function depositToSolend(connection, wallet, token, amount) {
  // Implementation here
}

export async function withdrawFromSolend(connection, wallet, token, amount) {
  // Implementation here
}
```

### 2. Update executor
```javascript
// src/executor/index.js
import { depositToSolend, withdrawFromSolend } from './solend.js';

// In executeIntent switch:
case 'lend-solend':
  return await depositToSolend(connection, wallet, token, amount);
```

### 3. Update parser
```javascript
// src/parser/index.js
const patterns = {
  // ... existing
  'lend-solend': /lend.*solend|deposit.*solend/,
};
```

### 4. Test
```bash
npm start
> lend 100 USDC on solend
```

---

## 🌐 Creating an API

Want to expose TreasuryAgent as an HTTP API?

```javascript
// api.js
import express from 'express';
import { parseCommand } from './src/parser/index.js';
import { executeIntent } from './src/executor/index.js';
import { checkRisk } from './src/risk/manager.js';

const app = express();
app.use(express.json());

app.post('/execute', async (req, res) => {
  const { command, walletKey } = req.body;
  
  // Parse
  const intent = parseCommand(command);
  
  // Risk check
  const risk = checkRisk(intent, balance);
  if (!risk.approved) {
    return res.status(400).json({ error: risk.reason });
  }
  
  // Execute
  const result = await executeIntent(connection, wallet, intent);
  
  res.json({ success: true, result });
});

app.listen(3000);
```

**Usage:**
```bash
curl -X POST http://localhost:3000/execute \
  -d '{"command": "swap 0.1 SOL to USDC"}'
```

---

## 📊 Performance Tips

**Current bottlenecks:**
1. **Jupiter API calls** — Cache quotes for 30s
2. **RPC requests** — Use connection pooling
3. **Transaction confirmation** — Use `processed` instead of `confirmed` for speed

**Optimizations to add:**
```javascript
// Cache quotes
const quoteCache = new Map();

function getCachedQuote(key) {
  const cached = quoteCache.get(key);
  if (cached && Date.now() - cached.time < 30000) {
    return cached.data;
  }
  return null;
}
```

---

## 🤝 Contributing

### Want to contribute?

**Good first issues:**
- Add more test coverage
- Improve error messages
- Add support for more tokens
- Create a web UI

**Process:**
1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make changes
4. Test: `npm run demo`
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature/my-feature`
7. Open PR

---

## 📚 Resources

**Solana:**
- https://solana.com/docs
- https://solana-labs.github.io/solana-web3.js/

**Jupiter:**
- https://station.jup.ag/docs/apis/swap-api

**Kamino:**
- https://docs.kamino.finance/

**Colosseum Hackathon:**
- https://colosseum.com/skill.md

---

## ❓ FAQ

**Q: Can I use this on mainnet?**  
A: Yes, but be careful! Change `SOLANA_RPC_URL` to mainnet and use a funded wallet.

**Q: How do I add a new command?**  
A: 3 steps: (1) Add pattern to parser, (2) Add executor function, (3) Wire in coordinator.

**Q: Is the code production-ready?**  
A: It's hackathon-ready. For production, add more tests, error handling, and monitoring.

**Q: Can other agents use this?**  
A: Yes! Create an API wrapper (see "Creating an API" section).

---

*Built with ❤️ by Walt & Chico*
