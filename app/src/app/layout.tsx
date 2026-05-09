import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/components/providers/WalletProvider';

export const metadata: Metadata = {
  title: 'PensionChain',
  description: 'Decentralized pension fund on Solana',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
