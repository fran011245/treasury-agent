/**
 * Natural Language Parser
 * Converts user commands into structured intents
 */

/**
 * Parse natural language command into intent
 * @param {string} command - User command
 * @returns {Object} Intent object
 */
export function parseCommand(command) {
  const normalized = command.toLowerCase().trim();
  
  // Intent detection patterns
  const patterns = {
    swap: /swap|exchange|convert|trade/,
    stake: /stake|staking/,
    lend: /lend|deposit|supply/,
    withdraw: /withdraw|unstake|remove|pull\s+out|take\s+out/,
    balance: /balance|portfolio|holdings/,
    position: /position|status|check\s+deposit|how\s+much/,
  };
  
  // Detect intent
  let intent = 'unknown';
  for (const [key, pattern] of Object.entries(patterns)) {
    if (pattern.test(normalized)) {
      intent = key;
      break;
    }
  }
  
  // Extract amounts (e.g., "10 SOL", "50%")
  const amountMatch = normalized.match(/(\d+\.?\d*)\s*(sol|usdc|%)?/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
  const unit = amountMatch?.[2] || 'SOL';
  
  // Extract tokens
  const tokens = {
    from: null,
    to: null
  };
  
  if (intent === 'swap') {
    const swapMatch = normalized.match(/(sol|usdc|usdt)\s+to\s+(sol|usdc|usdt)/);
    if (swapMatch) {
      tokens.from = swapMatch[1].toUpperCase();
      tokens.to = swapMatch[2].toUpperCase();
    }
  }
  
  // Extract protocol
  let protocol = null;
  if (/jupiter/i.test(normalized)) protocol = 'jupiter';
  if (/kamino/i.test(normalized)) protocol = 'kamino';
  if (/jito/i.test(normalized)) protocol = 'jito';
  
  return {
    intent,
    amount,
    unit,
    tokens,
    protocol,
    raw: command,
    confidence: intent !== 'unknown' ? 0.8 : 0.3
  };
}

/**
 * Validate parsed intent
 * @param {Object} intent - Parsed intent
 * @returns {Object} Validation result
 */
export function validateIntent(intent) {
  const errors = [];
  
  if (intent.confidence < 0.5) {
    errors.push('Could not understand command');
  }
  
  if (intent.intent === 'swap' && !intent.tokens.from) {
    errors.push('Missing source token');
  }
  
  if (intent.intent === 'swap' && !intent.tokens.to) {
    errors.push('Missing destination token');
  }
  
  if (intent.amount !== null && intent.amount <= 0) {
    errors.push('Amount must be positive');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
