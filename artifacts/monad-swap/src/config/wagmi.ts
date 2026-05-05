import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  rabbyWallet,
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { monadTestnet } from 'wagmi/chains';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rabbyWallet, metaMaskWallet, walletConnectWallet, coinbaseWallet],
    },
    {
      groupName: 'More',
      wallets: [rainbowWallet, injectedWallet],
    },
  ],
  {
    appName: 'Monad Swap',
    projectId: 'demo',
  },
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
  },
});
