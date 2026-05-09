'use client';

import { useEffect, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { ChatMessage } from '@/components/ui/ChatMessage';
import { startOracleSession, sendMessage, endSession } from '@/lib/oracle-client';
import { registerAffiliate, closeProfile, isAffiliate } from '@/lib/solana';
import { RISK_PROFILES } from '@/lib/constants';
import type { Recommendation } from '@/lib/oracle-client';

type Phase = 'idle' | 'analyzing' | 'chatting' | 'recommending' | 'confirming' | 'done' | 'error';
type Lang = 'en' | 'es';

interface Message {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

export function PensionOracle() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [phase, setPhase] = useState<Phase>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function addMessage(role: Message['role'], content: string) {
    setMessages((prev) => [...prev, { role, content }]);
  }

  async function handleStart() {
    if (!publicKey) return;
    setPhase('analyzing');
    setError(null);

    try {
      const session = await startOracleSession(publicKey.toString(), lang);
      setSessionId(session.sessionId);
      addMessage('system', `Wallet analyzed: ${session.walletAnalysis.summary}`);
      addMessage('assistant', session.message);
      setPhase('chatting');
    } catch {
      setError('Could not start session. Is the Oracle server running?');
      setPhase('error');
    }
  }

  async function handleSend() {
    if (!input.trim() || !sessionId || isLoading) return;
    const text = input.trim();
    setInput('');
    setIsLoading(true);
    addMessage('user', text);

    try {
      const response = await sendMessage(sessionId, text);
      addMessage('assistant', response.message);

      if (response.finalized && response.recommendation) {
        setRecommendation(response.recommendation);
        setPhase('recommending');
      }
    } catch {
      addMessage('system', 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    if (!recommendation || !publicKey || !signTransaction) return;
    setPhase('confirming');
    setError(null);

    try {
      // If profile already exists (old 125-byte PDA), close it first
      const exists = await isAffiliate(connection, publicKey);
      if (exists) {
        await closeProfile(connection, publicKey, signTransaction);
      }

      const cidBytes = new Uint8Array(64);
      const encoded = new TextEncoder().encode(
        `${recommendation.profile}:${recommendation.score}:${Date.now()}`,
      );
      cidBytes.set(encoded.slice(0, 64));

      const sig = await registerAffiliate(
        connection,
        publicKey,
        signTransaction,
        recommendation.profileCode,
        recommendation.walletScore,
        recommendation.score,
        cidBytes,
      );

      if (sessionId) endSession(sessionId);
      setTxSignature(sig);
      setPhase('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setPhase('recommending');
    }
  }

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Pension Oracle AI</h2>
          <p className="mt-2 max-w-sm text-gray-400">
            {lang === 'es'
              ? 'Analiza tu historial on-chain y hace preguntas para recomendarte el perfil de inversión adecuado.'
              : 'Analyzes your wallet history and asks a few questions to recommend the right investment profile.'}
          </p>
        </div>
        <div className="flex gap-2 rounded-lg border border-gray-700 bg-gray-900 p-1">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
                lang === l ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {l === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
            </button>
          ))}
        </div>
        <Button size="lg" onClick={handleStart}>
          {lang === 'es' ? 'Iniciar Sesión de Asesoría' : 'Start Advisory Session'}
        </Button>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-gray-300">Analyzing your on-chain history…</p>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-black">
          ✓
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Profile Registered</h2>
          <p className="mt-1 text-gray-400">
            Your <span className="font-medium text-white">{recommendation?.profile}</span> profile is now on-chain.
          </p>
        </div>
        {txSignature && (
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-400 underline hover:text-emerald-300"
          >
            View transaction →
          </a>
        )}
      </div>
    );
  }

  const profileInfo = recommendation
    ? RISK_PROFILES[recommendation.profileCode as keyof typeof RISK_PROFILES]
    : null;

  return (
    <div className="flex h-[580px] flex-col rounded-xl border border-gray-700 bg-gray-900">
      <div className="flex items-center gap-2 border-b border-gray-700 p-4">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="font-semibold text-white">Pension Oracle</span>
        {phase === 'error' && (
          <span className="ml-auto text-xs text-red-400">{error}</span>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex gap-1 pl-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {phase === 'recommending' && profileInfo && (
        <div className="mx-4 mb-3 rounded-xl border border-emerald-700 bg-gray-800 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Recommended profile</p>
              <p className="text-lg font-bold text-emerald-400">{profileInfo.name}</p>
              <p className="mt-0.5 text-xs text-gray-400">{profileInfo.allocation}</p>
              <p className="mt-1 text-xs font-medium text-emerald-400">Est. {profileInfo.apy} APY</p>
              {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            </div>
            <Button size="sm" onClick={handleConfirm} className="shrink-0">
              Confirm On-Chain
            </Button>
          </div>
        </div>
      )}

      {phase === 'chatting' && (
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your answer…"
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            />
            <Button size="sm" onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
