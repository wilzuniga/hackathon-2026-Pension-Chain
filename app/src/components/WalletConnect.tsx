'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';

export function WalletConnect() {
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (publicKey) router.push('/onboarding');
  }, [publicKey, router]);

  return (
    <div className="flex justify-center">
      <WalletMultiButton />
    </div>
  );
}
