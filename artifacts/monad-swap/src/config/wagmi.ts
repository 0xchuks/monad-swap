import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  rabbyWallet,
  zerionWallet,
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { monadTestnet } from 'wagmi/chains';

export const PROJECT_ID = 'demo';
export const APP_NAME   = 'Monad Swap';

/**
 * Display metadata for the inline WalletPicker — must stay in the same order
 * as the `wallets` array passed to connectorsForWallets below.
 * We call the creators here just to extract name + iconUrl; the connectors
 * themselves are created by connectorsForWallets (which calls the fn refs).
 */
export const WALLET_META = [
  rabbyWallet(),
  zerionWallet({ projectId: PROJECT_ID }),
  metaMaskWallet({ projectId: PROJECT_ID }),
  walletConnectWallet({ projectId: PROJECT_ID }),
  coinbaseWallet({ appName: APP_NAME }),
] satisfies { name: string; iconUrl: (() => Promise<string>) | string }[];

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      // Pass function references — connectorsForWallets calls them with projectId/appName
      wallets: [rabbyWallet, zerionWallet, metaMaskWallet, walletConnectWallet, coinbaseWallet],
    },
    {
      groupName: 'More',
      wallets: [injectedWallet],
    },
  ],
  { appName: APP_NAME, projectId: PROJECT_ID },
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
  },
});
