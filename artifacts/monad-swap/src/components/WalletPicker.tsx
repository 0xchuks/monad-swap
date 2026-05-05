import { useConnect, useConnectors } from 'wagmi';
import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { WALLET_META } from '@/config/wagmi';

function useWalletIcons(): (string | null)[] {
  const [icons, setIcons] = useState<(string | null)[]>(WALLET_META.map(() => null));

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      WALLET_META.map(w =>
        typeof w.iconUrl === 'function' ? w.iconUrl() : Promise.resolve(w.iconUrl as string),
      ),
    ).then(resolved => {
      if (!cancelled) setIcons(resolved);
    });
    return () => { cancelled = true; };
  }, []);

  return icons;
}

export function WalletPicker() {
  const allConnectors          = useConnectors();
  const icons                  = useWalletIcons();
  const { connect, isPending } = useConnect();
  const [connectingUid, setConnectingUid] = useState<string | null>(null);

  // connectorsForWallets registers wallets in order after the injected connector.
  // Filter out the raw injected/browser-wallet and pair the rest with WALLET_META by position.
  const wallets = useMemo(() => {
    const named = allConnectors.filter(c => c.id !== 'injected');
    return named.slice(0, WALLET_META.length).map((connector, i) => ({
      connector,
      name: WALLET_META[i].name,
      icon: icons[i],
    }));
  }, [allConnectors, icons]);

  const handleConnect = async (connector: typeof allConnectors[number]) => {
    setConnectingUid(connector.uid);
    try {
      await connect({ connector });
    } finally {
      setConnectingUid(null);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <p className="text-center text-sm text-muted-foreground">
        Choose a wallet to connect
      </p>
      <div className="grid grid-cols-2 gap-2">
        {wallets.map(({ connector, name, icon }) => {
          const isLoading = connectingUid === connector.uid && isPending;
          return (
            <button
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              disabled={isPending}
              className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 active:scale-95 transition-all duration-100 text-sm font-medium text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 shrink-0 animate-spin text-primary" />
              ) : icon ? (
                <img src={icon} alt={name} className="w-7 h-7 shrink-0 rounded-lg" />
              ) : (
                <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {name[0]}
                </div>
              )}
              <span className="truncate">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
