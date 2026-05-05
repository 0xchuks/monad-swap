import type { Address } from 'viem';

export const TOKENS = {
  MON: {
    symbol: 'MON',
    name: 'Monad',
    address: '0x0000000000000000000000000000000000000000' as Address,
    decimals: 18,
    isNative: true,
  },
  WMON: {
    symbol: 'WMON',
    name: 'Wrapped Monad',
    address: '0x0cf66fbda2f6be4416aedbc76ebb69de8fd0259f' as Address,
    decimals: 18,
    isNative: false,
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
  UniswapV2Router02: '0x118519b46d86a04cec10ff8e7ac90a7c69b712bb' as Address,
};
