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
    address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701' as Address,
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
  UniswapV2Router02: '0x4b2ab38dbf28d31d467aa8993f6c2585981d6804' as Address,
};
