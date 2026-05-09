import { ORACLE_API_URL } from './constants';

export interface WalletAnalysis {
  riskScore: number;
  totalTransactions: number;
  protocolsUsed: Array<{ name: string; risk: number; count: number }>;
  hasDerivatives: boolean;
  hasStaking: boolean;
  summary: string;
}

export interface Recommendation {
  profile: 'Conservative' | 'Balanced' | 'Aggressive';
  score: number;
  reasoning: string;
  walletScore: number;
  profileCode: number;
}

export interface SessionStart {
  sessionId: string;
  message: string;
  walletAnalysis: WalletAnalysis;
}

export interface ChatResponse {
  message: string;
  finalized: boolean;
  recommendation?: Recommendation;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ORACLE_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function startOracleSession(address: string, lang: 'en' | 'es' = 'en'): Promise<SessionStart> {
  return post('/api/session/start', { address, lang });
}

export function sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
  return post(`/api/session/${sessionId}/message`, { message });
}

export async function endSession(sessionId: string): Promise<void> {
  await fetch(`${ORACLE_API_URL}/api/session/${sessionId}`, { method: 'DELETE' });
}
