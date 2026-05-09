# PensionChain

Decentralized pension fund on Solana. Smart contracts enforce every rule — no banks, no intermediaries.

## What it does

1. Connect wallet → AI advisor analyzes on-chain history + asks 3-5 questions → recommends risk profile
2. User confirms profile → stored on-chain as a PDA via Anchor program
3. Fund your pension from any EVM chain using LI.FI bridge

## Contract

| Network | Program ID |
|---------|-----------|
| Devnet  | `4ssu3jphFPGkmBqLkfADP48pSSvYq8rVoCSZVZtzfCHp` |

## LI.FI Integration

The onboarding flow includes a LI.FI widget that lets users bridge assets from any EVM chain (Ethereum, Arbitrum, Base, etc.) to Solana USDC in one transaction. This solves the cold-start problem: users don't need to already have SOL or USDC on Solana to join.

Integration: `@lifi/widget` with `toChain: Solana` and `toToken: USDC`.

## Project Structure

```
programs/pension-chain/   Anchor/Rust smart contract
oracle/                   AI backend (Node.js + Claude)
app/                      Frontend (Next.js + Tailwind)
```

## Setup

### 1. Build and deploy the Solana program

```bash
anchor build
anchor deploy --provider.cluster devnet
```

### 2. Start the AI Oracle

```bash
cd oracle
cp .env.example .env
# Add ANTHROPIC_API_KEY (required) and HELIUS_API_KEY (optional)
npm install
npm run dev
```

### 3. Start the frontend

```bash
cd app
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Smart contract**: Anchor / Rust (Solana devnet)
- **AI advisor**: Claude claude-sonnet-4-6 via Anthropic SDK
- **Wallet analysis**: Helius RPC (optional)
- **Cross-chain bridge**: LI.FI Widget
- **Frontend**: Next.js 15, Tailwind CSS, @solana/wallet-adapter
- **Backend**: Node.js, Express
