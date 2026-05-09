export const PROGRAM_ID = '4ssu3jphFPGkmBqLkfADP48pSSvYq8rVoCSZVZtzfCHp';

export const ORACLE_API_URL =
  process.env.NEXT_PUBLIC_ORACLE_API_URL ?? 'http://localhost:3001';

export const RISK_PROFILES = {
  0: {
    name: 'Conservative',
    apy: '4–6%',
    allocation: '60% tokenized bonds · 30% Aave stablecoins · 10% liquid staking',
  },
  1: {
    name: 'Balanced',
    apy: '8–12%',
    allocation: '40% tokenized equities · 30% bonds · 20% Aave · 10% staking',
  },
  2: {
    name: 'Aggressive',
    apy: '15%+',
    allocation: '40% DeFi yields · 30% tokenized equities · 20% ETH/BTC · 10% RWA',
  },
} as const;
