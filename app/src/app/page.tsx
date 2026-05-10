import Image from 'next/image';

const FEATURES = [
  { 
    title: 'No intermediaries', 
    desc: 'Smart contract enforces every rule securely on-chain. Absolutely zero banks involved in the process.', 
    color: 'bg-ultraviolet', 
    textColor: 'text-hazard', 
    hoverText: 'hover:text-jelly',
    colSpan: 'md:col-span-2 lg:col-span-2',
    border: ''
  },
  { 
    title: 'AI risk profiling', 
    desc: 'Continuous risk assessment via on-chain history and conversational AI.', 
    color: 'bg-jelly', 
    textColor: 'text-black', 
    hoverText: 'hover:text-deepblue',
    colSpan: 'md:col-span-1 lg:col-span-1',
    border: ''
  },
  { 
    title: 'Cross-chain funding', 
    desc: 'Seamlessly bridge your assets from any EVM chain via LI.FI with maximum security.', 
    color: 'bg-canvas', 
    textColor: 'text-hazard', 
    hoverText: 'hover:text-deepblue', 
    border: 'border border-hazard',
    colSpan: 'md:col-span-2 lg:col-span-3'
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas p-6 md:p-12 font-polysans">
      {/* Split Hero Section */}
      <section className="mb-24 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-6">
        {/* Left Column: Typography */}
        <div className="flex flex-col justify-center gap-6 pb-12 lg:pb-0">
          <p className="font-polysans text-[19px] font-light uppercase tracking-verge-mono-19 text-hazard border-l-[4px] border-jelly pl-4">
            Self-Custodied Future
          </p>
          <h1 className="font-manuka text-[80px] md:text-[130px] lg:text-[140px] font-black leading-[0.8] tracking-verge-wide text-hazard uppercase break-words">
            Rebuild<br />The<br />Pension<br />Fund
          </h1>
          <p className="max-w-md text-[20px] md:text-[24px] font-bold leading-tight text-secondary mt-2">
            No banks. No intermediaries. Just code enforcing every rule on Solana.
          </p>
        </div>

        {/* Right Column: Accent Block */}
        <div className="rounded-[40px] border border-ultraviolet bg-canvas p-8 md:p-12 flex flex-col justify-between min-h-[500px] relative overflow-hidden group">
          {/* Subtle background glow/logo hint */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-ultraviolet opacity-[0.03] blur-[100px] rounded-full group-hover:opacity-[0.08] transition-opacity duration-700"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="font-mono text-[12px] font-bold uppercase tracking-verge-mono-18 text-ultraviolet bg-ultraviolet/10 px-4 py-1.5 rounded-[20px] border border-ultraviolet/30">
              Network Status: Live
            </div>
            <div className="h-3 w-3 rounded-full bg-jelly animate-pulse shadow-[0_0_10px_#3cffd0]"></div>
          </div>
          
          <div className="flex flex-col items-center justify-center relative z-10 flex-1 my-10">
            <div className="border border-ultraviolet rounded-[40px] p-2 hover:bg-ultraviolet/5 transition-colors cursor-pointer group/btn">
              <div className="bg-canvas border border-ultraviolet rounded-[32px] px-8 py-6 flex items-center gap-4 group-hover/btn:bg-ultraviolet transition-colors duration-300">
                 <span className="font-mono text-[16px] md:text-[20px] font-bold uppercase tracking-verge-mono-15 text-ultraviolet group-hover/btn:text-white transition-colors">
                   Initialize Wallet
                 </span>
                 <span className="text-ultraviolet group-hover/btn:text-white transition-colors font-mono font-bold text-xl">→</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center mt-auto">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-ultraviolet to-transparent mb-6 opacity-50"></div>
            <p className="font-manuka text-[70px] md:text-[100px] leading-[0.8] uppercase tracking-verge-wide text-hazard m-0 hover:text-jelly transition-colors duration-300 cursor-pointer">
              JOIN PENSIONCHAIN
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Bento Grid Features */}
      <section className="max-w-[1400px] mx-auto pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`${f.colSpan} rounded-[24px] p-8 md:p-12 ${f.color} ${f.border || ''} flex flex-col justify-between min-h-[320px] transition-transform duration-300 hover:-translate-y-1`}>
              <div className="flex justify-between items-start mb-12">
                <div className={`font-mono text-[12px] font-bold uppercase tracking-verge-mono-18 ${f.textColor} opacity-80 border-b border-current pb-2`}>
                  FEAT_0{i + 1}
                </div>
              </div>
              
              <div className="mt-auto">
                <h3 className={`font-polysans text-[40px] md:text-[50px] font-bold leading-[0.9] mb-6 ${f.textColor} ${f.hoverText} transition-colors cursor-pointer`}>
                  {f.title}
                </h3>
                <p className={`font-polysans text-[18px] md:text-[20px] font-normal leading-[1.5] ${f.textColor} opacity-90 max-w-xl`}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
