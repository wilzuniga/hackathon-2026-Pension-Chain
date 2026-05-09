'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useMarinadeStaking } from '@/hooks/useMarinadeStaking';
import { readDepositState, type DepositState } from '@/lib/solana';
import { Button } from '@/components/ui/Button';

const SOL_PRESETS = [0.1, 0.5, 1, 5];

export function LiFiBridge() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { stake, status, result, error, grossApy, netApy, protocolFeePct, reset } =
    useMarinadeStaking();
  const [solInput, setSolInput] = useState('');
  const [depositState, setDepositState] = useState<DepositState | null>(null);
  const [txHistory, setTxHistory] = useState<{ sig: string; date: string; sol: number }[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    readDepositState(connection, publicKey).then(setDepositState).catch(() => {});

    // Fetch confirm_deposit txs for this PDA from Solana
    const { getAffiliateProfilePDA } = require('@/lib/solana');
    const pda = getAffiliateProfilePDA(publicKey);
    connection.getSignaturesForAddress(pda, { limit: 20 })
      .then(async (sigs) => {
        const history: { sig: string; date: string; sol: number }[] = [];
        for (const s of sigs) {
          if (s.err) continue;
          const tx = await connection.getParsedTransaction(s.signature, {
            maxSupportedTransactionVersion: 0,
          });
          const log = tx?.meta?.logMessages?.find((l) => l.includes('Deposit #'));
          if (!log) continue;
          const match = log.match(/(\d+) lamports deposited/);
          const lamports = match ? parseInt(match[1]) : 0;
          history.push({
            sig: s.signature,
            date: s.blockTime ? new Date(s.blockTime * 1000).toLocaleDateString() : '—',
            sol: lamports / LAMPORTS_PER_SOL,
          });
        }
        setTxHistory(history);
      })
      .catch(() => {});
  }, [publicKey, connection, status]);

  const isLoading = status === 'staking' || status === 'recording';
  const parsedSol = parseFloat(solInput);
  const validInput = !isNaN(parsedSol) && parsedSol > 0;

  if (status === 'success' && result) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-emerald-700 bg-gray-900 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-black font-bold">
            ✓
          </div>
          <h3 className="text-xl font-bold text-white">Stake Recorded</h3>
          <p className="mt-1 text-sm text-gray-400">
            {result.solDeposited.toFixed(4)} SOL staked via Marinade Native
          </p>

          <div className="mt-4 space-y-2 text-left rounded-lg bg-gray-800 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">SOL staked</span>
              <span className="font-medium text-white">
                {result.solStaked.toFixed(4)} SOL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gross APY (Marinade Native)</span>
              <span className="font-medium text-emerald-400">
                {(grossApy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Protocol fee</span>
              <span className="text-gray-300">{protocolFeePct.toFixed(0)}% of yield</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2">
              <span className="font-medium text-gray-300">Net APY (you earn)</span>
              <span className="font-bold text-emerald-400">
                {(netApy * 100).toFixed(2)}%
              </span>
            </div>
            {result.rewards?.apy != null && (
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Actual APY (on-chain)</span>
                <span className="font-medium text-emerald-300">
                  {(result.rewards.apy * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-1 text-xs">
            <a
              href={`https://explorer.solana.com/tx/${result.stakeSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-emerald-400 underline hover:text-emerald-300"
            >
              Marinade Native stake tx →
            </a>
            <a
              href={`https://explorer.solana.com/tx/${result.anchorSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-emerald-400 underline hover:text-emerald-300"
            >
              PensionChain record tx →
            </a>
          </div>

          <Button className="mt-6 w-full" onClick={reset}>
            Stake More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dashboard — shows when user has prior deposits */}
      {depositState && depositState.depositCount > 0 && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Your Pension</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Total staked</p>
              <p className="mt-0.5 text-lg font-bold text-white">
                {(Number(depositState.totalSolStaked) / LAMPORTS_PER_SOL).toFixed(4)} SOL
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Est. annual yield</p>
              <p className="mt-0.5 text-lg font-bold text-emerald-400">
                +{(Number(depositState.totalSolStaked) / LAMPORTS_PER_SOL * NET_APY).toFixed(4)} SOL
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Deposits</p>
              <p className="mt-0.5 font-semibold text-white">{depositState.depositCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Last stake</p>
              <p className="mt-0.5 font-semibold text-white">
                {depositState.lastDepositAt > 0
                  ? new Date(depositState.lastDepositAt * 1000).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
          {txHistory.length > 0 && (
            <div className="mt-3 border-t border-gray-700 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Transaction History</p>
              <div className="space-y-1">
                {txHistory.map((tx) => (
                  <div key={tx.sig} className="flex items-center justify-between text-xs">
                    <a
                      href={`https://explorer.solana.com/tx/${tx.sig}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-400 underline hover:text-emerald-300"
                    >
                      {tx.sig.slice(0, 8)}…{tx.sig.slice(-6)}
                    </a>
                    <span className="text-gray-400">{tx.date}</span>
                    <span className="text-white">+{tx.sol.toFixed(4)} SOL</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-semibold text-white">Stake SOL with Marinade Native</h3>
        <p className="mt-1 text-sm text-gray-400">
          Your SOL is staked across 100+ validators. You keep full custody —
          Marinade only manages delegation. Position recorded on PensionChain.
        </p>
      </div>

      {/* APY cards */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Gross APY', value: `${(grossApy * 100).toFixed(1)}%`, color: 'text-emerald-400' },
          { label: 'Protocol fee', value: `${protocolFeePct.toFixed(0)}% of yield`, color: 'text-gray-300' },
          { label: 'Net APY', value: `${(netApy * 100).toFixed(2)}%`, color: 'text-emerald-300 font-bold' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`mt-1 text-sm ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Amount input */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-300">Amount (SOL)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={solInput}
          onChange={(e) => setSolInput(e.target.value)}
          placeholder="0.00"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
        />

        <div className="flex gap-2">
          {SOL_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setSolInput(preset.toString())}
              disabled={isLoading}
              className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
            >
              {preset} SOL
            </button>
          ))}
        </div>

        {validInput && (
          <p className="text-xs text-gray-400">
            Stake <span className="text-white">{parsedSol.toFixed(4)} SOL</span> →
            earn ~<span className="text-emerald-400">{(parsedSol * NET_APY).toFixed(4)} SOL/year</span>
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={() => stake(parsedSol)}
        disabled={isLoading || !validInput}
      >
        {status === 'staking'
          ? 'Creating stake account…'
          : status === 'recording'
          ? 'Recording on-chain…'
          : 'Stake with Marinade Native'}
      </Button>

      <p className="text-center text-xs text-gray-600">
        Marinade Native simulated on devnet — real staking on mainnet
      </p>
    </div>
  );
}

const NET_APY = 0.063;
