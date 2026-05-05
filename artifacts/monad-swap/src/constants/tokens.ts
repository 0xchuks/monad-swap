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
    address: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A' as Address,
    decimals: 18,
    isNative: false,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603' as Address,
    decimals: 6,
    isNative: false,
  }
};

export const CONTRACTS = {
  UniswapV2Router02: '0x4b2ab38dbf28d31d467aa8993f6c2585981d6804' as Address,
};
