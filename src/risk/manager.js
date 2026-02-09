/**
 * Risk Management Module
 * Validates and safeguards all transactions
 */

import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Default risk parameters
const DEFAULT_LIMITS = {
  maxTransactionSOL: 10,
  requireConfirmation: true,
  allowedProtocols: ['jupiter', 'kamino', 'jito'],
  minBalanceSOL: 0.1 // Always keep some SOL for fees
};

export class RiskManager {
  constructor(config = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...config };
  }
  
  /**
   * Check if transaction passes risk checks
   * @param {Object} transaction - Transaction details
   * @param {Object} walletState - Current wallet state
   * @returns {Object} Risk assessment
   */
  async assessTransaction(transaction, walletState) {
    const risks = [];
    const warnings = [];
    
    // Check transaction size
    if (transaction.amountSOL > this.limits.maxTransactionSOL) {
      risks.push(`Transaction amount (${transaction.amountSOL} SOL) exceeds limit (${this.limits.maxTransactionSOL} SOL)`);
    }
    
    // Check protocol whitelist
    if (transaction.protocol && !this.limits.allowedProtocols.includes(transaction.protocol)) {
      risks.push(`Protocol '${transaction.protocol}' not in allowlist`);
    }
    
    // Check post-transaction balance
    const estimatedBalance = walletState.balance - (transaction.amountSOL * LAMPORTS_PER_SOL);
    const minBalance = this.limits.minBalanceSOL * LAMPORTS_PER_SOL;
    
    if (estimatedBalance < minBalance) {
      risks.push(`Transaction would leave balance below minimum (${this.limits.minBalanceSOL} SOL)`);
    }
    
    // Warnings (not blocking)
    if (transaction.amountSOL > walletState.balance * 0.8) {
      warnings.push('Transaction uses >80% of available balance');
    }
    
    return {
      approved: risks.length === 0,
      risks,
      warnings,
      requiresConfirmation: this.limits.requireConfirmation || risks.length > 0
    };
  }
  
  /**
   * Simulate transaction before execution
   * @param {Object} transaction - Transaction to simulate
   * @returns {Promise<Object>} Simulation result
   */
  async simulate(transaction) {
    // TODO: Implement actual simulation using Solana transaction simulation
    return {
      success: true,
      estimatedFee: 0.00001, // SOL
      slippage: 0.01, // 1%
      estimatedOutput: transaction.amountOut || 0
    };
  }
  
  /**
   * Circuit breaker - halt all transactions if triggered
   */
  circuitBreaker = {
    tripped: false,
    reason: null,
    
    trip(reason) {
      this.tripped = true;
      this.reason = reason;
      console.error('⚠️  CIRCUIT BREAKER TRIPPED:', reason);
    },
    
    reset() {
      this.tripped = false;
      this.reason = null;
      console.log('✅ Circuit breaker reset');
    }
  };
}

// Simple risk check function for use in main flow
export function checkRisk(intent, balance) {
  const maxTransactionSOL = 10;
  const minBalanceSOL = 0.05; // Keep some for fees
  
  // Check circuit breaker
  // (would need to import instance from main, simplified here)
  
  // Check amount
  if (intent.amount && intent.amount > maxTransactionSOL) {
    return {
      approved: false,
      reason: `Amount ${intent.amount} SOL exceeds limit of ${maxTransactionSOL} SOL`
    };
  }
  
  // Check balance for transactions
  if (intent.type !== 'balance' && intent.amount) {
    const balanceSOL = balance / 1000000000; // LAMPORTS_PER_SOL
    if (intent.amount > balanceSOL - minBalanceSOL) {
      return {
        approved: false,
        reason: `Insufficient balance. Have: ${balanceSOL.toFixed(4)} SOL, Need: ${intent.amount} SOL + fees`
      };
    }
  }
  
  return { approved: true };
}
