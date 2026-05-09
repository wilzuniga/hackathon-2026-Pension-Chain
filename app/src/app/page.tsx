import { WalletConnect } from '@/components/WalletConnect';

const FEATURES = [
  { title: 'No intermediaries', desc: 'Smart contract enforces every rule' },
  { title: 'AI risk profiling', desc: 'On-chain history + conversation' },
  { title: 'Cross-chain funding', desc: 'Bridge from any EVM chain via LI.FI' },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-10 text-center">
        <div>
          <h1 className="text-5xl font-bold text-white">PensionChain</h1>
          <p className="mt-4 text-lg text-gray-400">
            The first self-custodied pension fund on Solana. No banks. No intermediaries. Just code.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <p className="font-semibold text-white">{f.title}</p>
              <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <WalletConnect />
      </div>
    </main>
  );
}
