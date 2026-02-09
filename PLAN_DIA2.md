# Plan Detallado — Día 2 (10 de Febrero)

**Objetivo:** Testear transacciones reales + Integrar Kamino SDK + Preparar demo

---

## 🌅 Mañana (10:00 - 14:00 UTC) — 4 horas

### 10:00-11:00: Setup & Jupiter Testing
**Tareas:**
- [ ] Configurar entorno local (no OpenClaw, tiene restricciones de red)
- [ ] Clonar repo: `git clone https://github.com/fran011245/treasury-agent.git`
- [ ] `npm install`
- [ ] Pedir airdrop en devnet: `solana airdrop 2 <wallet> --url devnet`
- [ ] Verificar balance: `node scripts/check_devnet_balance.js`

**Success criteria:**
- Wallet con > 1 SOL en devnet
- Script de balance funcionando

### 11:00-13:00: Jupiter Real Testing
**Tareas:**
- [ ] Testear quote: "swap 0.01 SOL to USDC"
- [ ] Verificar que la API responde con quote real
- [ ] Construir transacción (sin enviar todavía)
- [ ] Simular transacción
- [ ] Enviar transacción real
- [ ] Verificar en explorer: `https://explorer.solana.com/tx/<signature>?cluster=devnet`

**Código a testear:**
```javascript
node src/index.js
> swap 0.01 SOL to USDC
```

**Success criteria:**
- ✅ Quote recibido de Jupiter
- ✅ Transacción firmada y enviada
- ✅ Confirmada en devnet
- ✅ Balance actualizado correctamente

### 13:00-14:00: Fix bugs & Documentar
- [ ] Arreglar cualquier bug que aparezca
- [ ] Documentar el flujo en README
- [ ] Commit: "Day 2: Jupiter swaps tested on devnet"

---

## 🌞 Tarde (14:00 - 18:00 UTC) — 4 horas

### 14:00-16:00: Kamino SDK Integration
**Tareas:**
- [ ] Instalar Kamino SDK: `npm install @kamino-finance/kliquidity-sdk`
- [ ] Leer docs de Kamino SDK
- [ ] Reemplazar mocks por llamadas reales:
  - `depositToKamino()` → Real deposit instruction
  - `withdrawFromKamino()` → Real withdraw instruction
  - `getKaminoPosition()` → Real position query
- [ ] Testear deposit de USDC (necesitamos USDC en devnet)

**Prerequisito:**
- Tener USDC en devnet (swap de SOL → USDC primero)

**Success criteria:**
- ✅ Depósito real en Kamino vault
- ✅ Posición actualizada correctamente
- ✅ Withdraw funciona

### 16:00-17:00: Jito Staking (si da tiempo)
**Tareas:**
- [ ] Investigar Jito SDK/API
- [ ] Implementar `stakeWithJito()`
- [ ] Testear staking de SOL

**Nota:** Si no da tiempo, lo dejamos para Día 3.

### 17:00-18:00: Integration Flow
**Tareas:**
- [ ] Crear comando compuesto: "Earn yield on my SOL"
- [ ] Flujo: 
  1. Swap 50% SOL → USDC
  2. Deposit USDC a Kamino
  3. Stake 50% SOL con Jito
  4. Reporte final

**Success criteria:**
- Un solo comando ejecuta múltiples protocolos
- Usuario ve el flujo completo

---

## 🌙 Noche (18:00 - 22:00 UTC) — 4 horas

### 18:00-19:00: Polish & Error Handling
**Tareas:**
- [ ] Mejorar mensajes de error
- [ ] Agregar retries para fallos de red
- [ ] Validar todos los inputs
- [ ] Logging más detallado

### 19:00-20:00: Forum Update
**Tareas:**
- [ ] Postear update en Colosseum forum
- [ ] Compartir resultados de testing
- [ ] Pedir feedback
- [ ] Responder a comentarios

### 20:00-21:00: Plan Demo Video
**Tareas:**
- [ ] Escribir script del video (3 min max)
- [ ] Definir escenas:
  - Intro: Qué es TreasuryAgent (30s)
  - Demo: Comandos naturales (90s)
  - Código: Arquitectura (30s)
  - Outro: Visión (30s)

### 21:00-22:00: Git & Docs
**Tareas:**
- [ ] Commit todo: "Day 2: Real transactions + Kamino SDK"
- [ ] Push a GitHub
- [ ] Actualizar README con instrucciones claras
- [ ] Crear CHANGELOG.md

---

## 🎯 Success Criteria del Día

| Métrica | Target |
|---------|--------|
| Jupiter swaps | ✅ Funcionando en devnet |
| Kamino deposits | ✅ Reales (no mocks) |
| Jito staking | 🟡 Opcional |
| Integration flow | ✅ 1 comando → múltiples protocolos |
| Forum engagement | ✅ Post + 5+ respuestas |
| GitHub stars | 🟡 5+ (ideal) |

---

## 🚨 Blockers Potenciales

| Riesgo | Mitigación |
|--------|------------|
| Jupiter API no responde | Usar mock + documentar |
| Kamino SDK tiene bugs | Fallback a API REST |
| No tenemos SOL en devnet | Airdrop manual o pedir en Discord |
| Bugs inesperados | Timebox de 2h, luego workaround |

---

## 📝 Checklist Final del Día

- [ ] Jupiter swap real funcionando
- [ ] Kamino deposit real funcionando
- [ ] Jito staking (opcional)
- [ ] Integration flow: 1 comando → múltiples txs
- [ ] Forum post actualizado
- [ ] README actualizado
- [ ] Todo commiteado y pusheado
- [ ] Plan para Día 3 claro

---

**Hora de inicio:** 10:00 UTC  
**Hora de fin:** 22:00 UTC (ideal) o más si es necesario  
**Deadline hackathon:** 48 horas restantes

*Let's make it count.* 🚀
