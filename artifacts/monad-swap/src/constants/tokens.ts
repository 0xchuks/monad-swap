import type { Address } from 'viem';

export const TOKENS = {
  MON: {
    symbol: 'MON',
    name: 'Monad',
    address: '0x0000000000000000000000000000000000000000' as Address,
    decimals: 18,
    isNative: true,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x534b2f3A21130d7a60830c2Df862319e593943A3' as Address,
    decimals: 6,
    isNative: false,
  }
};

export const CONTRACTS = {
  SimpleSwap: '0x0dc26a8dbbc4e5708c610870b49aad7fc005043d' as Address,
};
