const HELIUS_BASE = 'https://api.helius.xyz/v0';

const PROTOCOL_RISK_MAP = {
  'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH': { name: 'Drift Protocol', risk: 85 },
  'mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68': { name: 'Mango Markets', risk: 80 },
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': { name: 'Raydium', risk: 65 },
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': { name: 'Orca', risk: 60 },
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': { name: 'Jupiter', risk: 55 },
  'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo': { name: 'Solend', risk: 45 },
  'KLend2g3cP87fffoy8q1mQqGKjrL9SNRqFBBKCb1kYp3r': { name: 'Kamino', risk: 40 },
  'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD': { name: 'Marinade', risk: 20 },
  'CrX7kMhLC3cSsXJdT7JDgqrRVMGDMB8o7RkCHt4PkUj': { name: 'Lido (stSOL)', risk: 20 },
  'Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Poqk': { name: 'Jito', risk: 20 },
};

export async function analyzeWallet(address, apiKey) {
  if (!apiKey) return getDefaultProfile();

  try {
    const txs = await fetchTransactions(address, apiKey);
    return buildRiskProfile(txs);
  } catch {
    return getDefaultProfile();
  }
}

async function fetchTransactions(address, apiKey) {
  const url = `${HELIUS_BASE}/addresses/${address}/transactions?api-key=${apiKey}&limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Helius ${res.status}`);
  return res.json();
}

function buildRiskProfile(txs) {
  const protocolsUsed = {};
  let totalRisk = 0;
  let count = 0;
  let hasDerivatives = false;
  let hasStaking = false;

  for (const tx of txs) {
    const programs = (tx.accountData ?? [])
      .map((a) => a.account)
      .filter((a) => PROTOCOL_RISK_MAP[a]);

    for (const programId of programs) {
      const proto = PROTOCOL_RISK_MAP[programId];
      if (!protocolsUsed[programId]) protocolsUsed[programId] = { ...proto, count: 0 };
      protocolsUsed[programId].count++;
      totalRisk += proto.risk;
      count++;
      if (proto.risk >= 80) hasDerivatives = true;
      if (proto.risk <= 25) hasStaking = true;
    }
  }

  let score = count > 0 ? Math.round(totalRisk / count) : 35;
  if (hasDerivatives) score = Math.min(100, score + 15);
  if (hasStaking && !hasDerivatives) score = Math.max(0, score - 10);

  const protocols = Object.values(protocolsUsed);

  return {
    riskScore: score,
    totalTransactions: txs.length,
    protocolsUsed: protocols,
    hasDerivatives,
    hasStaking,
    summary: buildSummary(protocols, score),
  };
}

function buildSummary(protocols, score) {
  if (protocols.length === 0) return 'No significant DeFi activity detected.';
  const names = protocols.slice(0, 3).map((p) => p.name).join(', ');
  const level = score >= 65 ? 'aggressive' : score >= 40 ? 'moderate' : 'conservative';
  return `Active on ${names}. On-chain behavior suggests ${level} risk appetite.`;
}

function getDefaultProfile() {
  return {
    riskScore: 35,
    totalTransactions: 0,
    protocolsUsed: [],
    hasDerivatives: false,
    hasStaking: false,
    summary: 'Wallet analysis unavailable. Starting with neutral baseline.',
  };
}
