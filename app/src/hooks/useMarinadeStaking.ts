'use client';

import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js';
import BN from 'bn.js';
import { confirmDeposit } from '@/lib/solana';

const GROSS_APY = 0.07;
const FEE_RATE = 0.1;
const NET_APY = GROSS_APY * (1 - FEE_RATE); // 6.3%

export type StakingStatus =
  | 'idle'
  | 'staking'
  | 'recording'
  | 'success'
  | 'error';

export interface StakingResult {
  solDeposited: number;
  solStaked: number;
  stakeSignature: string;
  anchorSignature: string;
  rewards?: { apy: number | null; totalRewards: number };
}

export interface UseMarinadeStaking {
  stake: (solAmount: number) => Promise<void>;
  status: StakingStatus;
  result: StakingResult | null;
  error: string | null;
  grossApy: number;
  netApy: number;
  protocolFeePct: number;
  reset: () => void;
}

function isDevnet(endpoint: string): boolean {
  return endpoint.includes('devnet') || endpoint.includes('localhost');
}

async function marinadeNativeStake(
  lamports: number,
  walletPublicKey: PublicKey,
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>,
  connection: import('@solana/web3.js').Connection,
): Promise<{ solStaked: bigint; signature: string }> {
  const { NativeStakingConfig, NativeStakingSDK } = await import(
    '@marinade.finance/native-staking-sdk'
  );

  const config = new NativeStakingConfig({ connection });
  const sdk = new NativeStakingSDK(config);

  const amount = new BN(lamports);
  const { createAuthorizedStake, stakeKeypair } =
    sdk.buildCreateAuthorizedStakeInstructions(walletPublicKey, amount);

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: walletPublicKey,
      recentBlockhash: blockhash,
      instructions: createAuthorizedStake,
    }).compileToV0Message(),
  );

  // stakeKeypair signs first (new stake account keypair), then user wallet
  tx.sign([stakeKeypair]);
  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(sig, 'confirmed');

  return { solStaked: BigInt(lamports), signature: sig };
}

async function marinadeNativeStakeMock(
  lamports: number,
  walletPublicKey: PublicKey,
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>,
  connection: import('@solana/web3.js').Connection,
): Promise<{ solStaked: bigint; signature: string }> {
  // Real 0-lamport self-transfer — produces a real devnet signature for Explorer
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: walletPublicKey }).add(
    SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: walletPublicKey,
      lamports: 0,
    }),
  );

  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction((signed as Transaction).serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return { solStaked: BigInt(lamports), signature: sig };
}

export function useMarinadeStaking(): UseMarinadeStaking {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [status, setStatus] = useState<StakingStatus>('idle');
  const [result, setResult] = useState<StakingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stake = useCallback(
    async (solAmount: number) => {
      if (!publicKey || !signTransaction) {
        setError('Wallet not connected');
        return;
      }
      if (solAmount <= 0) {
        setError('Amount must be greater than 0 SOL');
        return;
      }

      setStatus('staking');
      setError(null);
      setResult(null);

      try {
        const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);
        const useMock = isDevnet(connection.rpcEndpoint);
        const stakeFn = useMock ? marinadeNativeStakeMock : marinadeNativeStake;

        // Step 1: Create stake account + give Marinade stake authority
        const { solStaked, signature: stakeSignature } = await stakeFn(
          lamports,
          publicKey,
          signTransaction,
          connection,
        );

        // Step 2: Record on our Anchor program
        setStatus('recording');
        const anchorSignature = await confirmDeposit(
          connection,
          publicKey,
          signTransaction as (tx: Transaction) => Promise<Transaction>,
          BigInt(lamports),
          solStaked,
        );

        // Step 3: Fetch rewards if on mainnet (best-effort)
        let rewards: StakingResult['rewards'];
        if (!useMock) {
          try {
            const { NativeStakingConfig, NativeStakingSDK } = await import(
              '@marinade.finance/native-staking-sdk'
            );
            const sdk = new NativeStakingSDK(new NativeStakingConfig({ connection }));
            const rewardData = await sdk.fetchRewards(publicKey);
            const totalRewards = rewardData.data_points.reduce(
              (sum, dp) => sum + parseFloat(dp.inflation_rewards),
              0,
            );
            rewards = {
              apy: rewardData.apy_5_epochs ?? null,
              totalRewards,
            };
          } catch {
            // rewards fetch is best-effort
          }
        }

        setResult({
          solDeposited: solAmount,
          solStaked: Number(solStaked) / LAMPORTS_PER_SOL,
          stakeSignature,
          anchorSignature,
          rewards,
        });
        setStatus('success');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Staking failed');
        setStatus('error');
      }
    },
    [publicKey, signTransaction, connection],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    stake,
    status,
    result,
    error,
    grossApy: GROSS_APY,
    netApy: NET_APY,
    protocolFeePct: FEE_RATE * 100,
    reset,
  };
}
