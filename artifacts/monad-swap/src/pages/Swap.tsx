import { SwapCard } from '@/components/SwapCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Swap() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary blur-[100px]" />
      </div>

      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            M
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Monad Swap
          </h1>
        </div>
        <ConnectButton />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">High-performance trading.</h2>
            <p className="text-muted-foreground text-sm">Experience Monad's 10,000 TPS precision.</p>
          </div>
          <SwapCard />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/20 z-10 bg-background/30 backdrop-blur-sm">
        Monad Swap Terminal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
