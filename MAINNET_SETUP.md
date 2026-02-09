# Mainnet Setup - TreasuryAgent

## ✅ Configuración Actualizada

**Network:** Solana Mainnet-Beta  
**Status:** Listo para operar con dinero real

## Wallet

**Address:**
```
38k7ibjMsowMjDpiCZhULEeW8BcUhYwapYRUrweheRuA
```

**Explorer:**
https://explorer.solana.com/address/38k7ibjMsowMjDpiCZhULEeW8BcUhYwapYRUrweheRuA

**Keypair:** `../crypto/wallets/walt_solana_hackathon-keypair.json`

## Fondeo Inicial

### Cantidad Recomendada
- **Mínimo:** 0.05 SOL (~$10 USD)
- **Recomendado:** 0.1-0.2 SOL (~$20-40 USD)
- **Testing completo:** 0.5 SOL (~$100 USD)

### Por Qué

**Gas fees:** ~0.00001 SOL por transacción
- 0.05 SOL = ~5,000 transacciones
- 0.1 SOL = ~10,000 transacciones
- 0.2 SOL = ~20,000 transacciones

**Swaps:** Jupiter cobra ~0.1-0.5% en fees
- Con 0.1 SOL podés hacer varios swaps de prueba
- Con 0.2 SOL tenés margen cómodo para iterar

### Cómo Fondear

**Opción 1: Phantom Wallet**
1. Abrí Phantom
2. Send → Pegar address
3. Monto: 0.1-0.2 SOL
4. Confirmar

**Opción 2: Exchange (Binance, Coinbase, etc.)**
1. Withdraw SOL
2. Network: Solana (NO Solana BEP-20 ni otra)
3. Address: `38k7ibjMsowMjDpiCZhULEeW8BcUhYwapYRUrweheRuA`
4. Cantidad: 0.1-0.2 SOL

**Opción 3: Otra Wallet Solana**
```bash
solana transfer 38k7ibjMsowMjDpiCZhULEeW8BcUhYwapYRUrweheRuA 0.1 --allow-unfunded-recipient
```

### Verificar Fondeo

```bash
cd /home/walt/.openclaw/workspace/treasury-agent
node scripts/check_balance.js
```

## Risk Management

### Límites Configurados

En `.env`:
```bash
MAX_TRANSACTION_SOL=10        # Máximo por swap
REQUIRE_CONFIRMATION=true     # Siempre pedir confirmación
```

### Circuit Breakers (en código)

- ✅ Balance mínimo: 0.01 SOL siempre reservado para gas
- ✅ Max por transacción: 10 SOL
- ✅ Validación de slippage: 1% default, configurable
- ✅ Price impact check antes de ejecutar

### Protecciones Adicionales

- **No auto-approve:** Todas las transacciones requieren confirmación explícita
- **Dry-run mode:** Simular antes de ejecutar
- **Transaction logging:** Todas las operaciones se registran

## Primer Test en Mainnet

Una vez fondeado:

```bash
# 1. Check balance
node scripts/check_balance.js

# 2. Test Jupiter quote (sin ejecutar)
node src/index.js "get quote SOL to USDC 0.01 SOL"

# 3. Primer swap real (pequeño)
node src/index.js "swap 0.01 SOL to USDC"
```

## Estrategia de Testing

### Fase 1: Validación (Día 2)
- Fondear wallet: 0.1 SOL
- Test quote básico
- Primer swap: 0.01 SOL → USDC
- Verificar balances

### Fase 2: Iteración (Días 3-4)
- Swaps bi-direccionales
- Probar diferentes tokens
- Validar risk management
- Refinar natural language parser

### Fase 3: Autonomía (Días 5-7)
- Multi-step strategies
- Portfolio rebalancing
- API pública para otros agentes
- Dashboard en vivo

### Fase 4: Demo (Días 8-9)
- Video demo grabado
- Live portfolio management
- Forum update final
- Submit para hackathon

## Presupuesto Estimado

**Total:** ~0.2-0.3 SOL (~$40-60 USD)

Desglose:
- Testing inicial: 0.05 SOL
- Desarrollo iterativo: 0.1 SOL
- Demo final: 0.05 SOL
- Buffer/gas: 0.05 SOL

**ROI potencial:**
- Prize "Most Agentic": $5,000 USD
- Costo: ~$50 USD
- Ratio: 100x 🚀

## Next Steps

1. ✅ Config actualizado a mainnet
2. ⏳ Fondear wallet (0.1-0.2 SOL)
3. ⏳ Test balance
4. ⏳ Primer swap
5. ⏳ Iterar y construir

---

**Status:** Esperando fondeo inicial  
**Ready to go:** 100%  
**Risk:** Controlado con límites y confirmaciones

Vamos con todo. 🧠
