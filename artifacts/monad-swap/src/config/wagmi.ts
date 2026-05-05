import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { monadTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'Monad Swap',
  projectId: 'demo',
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
  },
});
