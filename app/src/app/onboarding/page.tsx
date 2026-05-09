'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { PensionOracle } from '@/components/onboarding/PensionOracle';
import { LiFiBridge } from '@/components/onboarding/LiFiBridge';
import { useAffiliateProfile } from '@/hooks/useAffiliateProfile';

type Step = 'oracle' | 'bridge';

export default function OnboardingPage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { registered, needsUpgrade, loading } = useAffiliateProfile();
  const [step, setStep] = useState<Step>('oracle');

  useEffect(() => {
    if (!publicKey) router.push('/');
  }, [publicKey, router]);

  // Already registered on-chain with current layout — skip oracle, go to stake
  useEffect(() => {
    if (registered === true && !needsUpgrade) setStep('bridge');
  }, [registered, needsUpgrade]);

  if (!publicKey) return null;
  if (loading) return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </main>
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Join PensionChain</h1>
          <p className="mt-1 font-mono text-sm text-gray-500">{publicKey.toString()}</p>
        </div>

        <div className="flex gap-2 rounded-xl border border-gray-800 bg-gray-900 p-1">
          {(['oracle', 'bridge'] as Step[]).map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                step === s ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s === 'oracle' ? '1 · Risk Profile' : '2 · Fund Pension'}
            </button>
          ))}
        </div>

        {needsUpgrade && step === 'oracle' && (
          <div className="rounded-lg border border-yellow-700 bg-yellow-950 px-4 py-3 text-sm text-yellow-300">
            Profile on-chain is outdated (old version). Complete the advisor and click
            <strong> Confirm On-Chain</strong> — it will auto-upgrade your account.
          </div>
        )}

        {step === 'oracle' ? <PensionOracle /> : <LiFiBridge />}
      </div>
    </main>
  );
}
