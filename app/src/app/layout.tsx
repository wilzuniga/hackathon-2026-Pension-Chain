import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { WalletConnect } from '@/components/WalletConnect';
import Image from 'next/image';
import Link from 'next/link';
import { Anton, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const fontManukaFallback = Anton({ subsets: ['latin'], weight: '400', variable: '--font-manuka' });
const fontPolySansFallback = Space_Grotesk({ subsets: ['latin'], variable: '--font-polysans' });
const fontMonoFallback = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'PensionChain',
  description: 'Decentralized pension fund on Solana',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontManukaFallback.variable} ${fontPolySansFallback.variable} ${fontMonoFallback.variable}`}>
        <WalletProvider>
          <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-imageframe bg-canvas sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-4">
              <Image src="/logo%20fondo%20negro.png" alt="PensionChain Logo" width={40} height={40} className="rounded-full" />
              <span className="font-manuka text-3xl tracking-verge-wide uppercase hover:text-deepblue transition-colors">PensionChain</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 font-mono text-[12px] uppercase tracking-verge-mono-15 font-semibold">
              <Link href="#" className="hover:text-deepblue transition-colors relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[1px] after:bg-jelly">Features</Link>
            </div>
            <div>
              <WalletConnect />
            </div>
          </nav>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
