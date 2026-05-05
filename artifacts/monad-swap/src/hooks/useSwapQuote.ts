import { useReadContract, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { V2_ROUTER_ABI } from '../constants/abis';
import { TOKENS, CONTRACTS } from '../constants/tokens';

type SwapDirection = 'MON_TO_USDC' | 'USDC_TO_MON';

export function useSwapQuote(amountInStr: string, direction: SwapDirection) {
  const { isConnected } = useAccount();
  const inputDecimals = direction === 'MON_TO_USDC' ? TOKENS.MON.decimals : TOKENS.USDC.decimals;
  const outputDecimals = direction === 'MON_TO_USDC' ? TOKENS.USDC.decimals : TOKENS.MON.decimals;
  
  const path = direction === 'MON_TO_USDC' 
    ? [TOKENS.WMON.address, TOKENS.USDC.address]
    : [TOKENS.USDC.address, TOKENS.WMON.address];

  let amountIn: bigint = 0n;
  try {
    if (amountInStr && !isNaN(Number(amountInStr))) {
      amountIn = parseUnits(amountInStr, inputDecimals);
    }
  } catch (e) {
    // ignore
  }

  const { data, isPending, refetch } = useReadContract({
    address: CONTRACTS.UniswapV2Router02,
    abi: V2_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [amountIn, path],
    query: {
      enabled: amountIn > 0n && isConnected,
      refetchInterval: 10000,
    }
  });

  let amountOutStr = '';
  if (data && data[1]) {
    amountOutStr = formatUnits(data[1], outputDecimals);
  }

  return {
    amountOutStr,
    amountOutRaw: data ? data[1] : 0n,
    isPending: isPending && amountIn > 0n && isConnected,
    refetch,
  };
}
