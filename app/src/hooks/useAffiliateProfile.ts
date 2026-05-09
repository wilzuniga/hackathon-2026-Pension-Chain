import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAffiliateProfilePDA } from '@/lib/solana';

const NEW_PDA_SIZE = 153;

export function useAffiliateProfile() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setRegistered(null);
      setNeedsUpgrade(false);
      return;
    }
    setLoading(true);
    const pda = getAffiliateProfilePDA(publicKey);
    connection.getAccountInfo(pda)
      .then((info) => {
        if (!info) {
          setRegistered(false);
          setNeedsUpgrade(false);
        } else {
          setRegistered(true);
          setNeedsUpgrade(info.data.length < NEW_PDA_SIZE);
        }
      })
      .catch(() => { setRegistered(false); setNeedsUpgrade(false); })
      .finally(() => setLoading(false));
  }, [publicKey, connection]);

  return { registered, needsUpgrade, loading };
}
