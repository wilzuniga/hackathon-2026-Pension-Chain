import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import { PROGRAM_ID } from './constants';

const PROGRAM_PUBLIC_KEY = new PublicKey(PROGRAM_ID);
const AFFILIATE_SEED = Buffer.from('affiliate');

async function anchorDiscriminator(name: string): Promise<Buffer> {
  const data = new TextEncoder().encode(`global:${name}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).slice(0, 8);
}

export function getAffiliateProfilePDA(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [AFFILIATE_SEED, authority.toBuffer()],
    PROGRAM_PUBLIC_KEY,
  );
  return pda;
}

export async function registerAffiliate(
  connection: Connection,
  authority: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  riskProfile: number,
  walletRiskScore: number,
  conversationRiskScore: number,
  ipfsSessionCid: Uint8Array,
): Promise<string> {
  const affiliateProfile = getAffiliateProfilePDA(authority);
  const disc = await anchorDiscriminator('register_affiliate');

  const data = Buffer.concat([
    disc,
    Buffer.from([riskProfile, walletRiskScore, conversationRiskScore]),
    Buffer.from(ipfsSessionCid.slice(0, 64)),
  ]);

  const ix = new TransactionInstruction({
    programId: PROGRAM_PUBLIC_KEY,
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: affiliateProfile, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: authority }).add(ix);

  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
}

export async function closeProfile(
  connection: Connection,
  authority: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  const affiliateProfile = getAffiliateProfilePDA(authority);
  const disc = await anchorDiscriminator('close_profile');

  const ix = new TransactionInstruction({
    programId: PROGRAM_PUBLIC_KEY,
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: affiliateProfile, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: disc,
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: authority }).add(ix);

  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
}

export async function isAffiliate(
  connection: Connection,
  authority: PublicKey,
): Promise<boolean> {
  const pda = getAffiliateProfilePDA(authority);
  const info = await connection.getAccountInfo(pda);
  return info !== null;
}

export async function confirmDeposit(
  connection: Connection,
  authority: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  solDeposited: bigint,
  solStaked: bigint,
): Promise<string> {
  const affiliateProfile = getAffiliateProfilePDA(authority);
  const disc = await anchorDiscriminator('confirm_deposit');

  // Layout: discriminator(8) + sol_deposited u64 LE(8) + sol_staked u64 LE(8) = 24 bytes
  const data = Buffer.allocUnsafe(24);
  disc.copy(data, 0);
  data.writeBigUInt64LE(solDeposited, 8);
  data.writeBigUInt64LE(solStaked, 16);

  const ix = new TransactionInstruction({
    programId: PROGRAM_PUBLIC_KEY,
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: affiliateProfile, isSigner: false, isWritable: true },
    ],
    data,
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: authority }).add(ix);

  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

  return sig;
}

export interface DepositState {
  totalSolDeposited: bigint;
  totalSolStaked: bigint;
  depositCount: number;
  lastDepositAt: number;
}

// Byte layout after existing 125 bytes:
// [125] total_sol_deposited u64 (8)
// [133] total_sol_staked    u64 (8)
// [141] deposit_count       u32 (4)
// [145] last_deposit_at     i64 (8)
const DEPOSIT_OFFSET = 125;

export async function readDepositState(
  connection: Connection,
  authority: PublicKey,
): Promise<DepositState | null> {
  const pda = getAffiliateProfilePDA(authority);
  const info = await connection.getAccountInfo(pda);
  if (!info || info.data.length < 153) return null;

  const buf = Buffer.from(info.data);
  return {
    totalSolDeposited: buf.readBigUInt64LE(DEPOSIT_OFFSET),
    totalSolStaked: buf.readBigUInt64LE(DEPOSIT_OFFSET + 8),
    depositCount: buf.readUInt32LE(DEPOSIT_OFFSET + 16),
    lastDepositAt: Number(buf.readBigInt64LE(DEPOSIT_OFFSET + 20)),
  };
}
