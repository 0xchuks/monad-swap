import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { monad } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'Monad Swap',
  projectId: 'demo', // WalletConnect optional
  chains: [monad],
  transports: {
    [monad.id]: http('https://rpc.monad.xyz'),
  },
});
