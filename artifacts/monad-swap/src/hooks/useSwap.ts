import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import { V2_ROUTER_ABI, ERC20_ABI } from '../constants/abis';
import { TOKENS, CONTRACTS } from '../constants/tokens';
import { useState } from 'react';

type SwapDirection = 'MON_TO_USDC' | 'USDC_TO_MON';

export function useSwap(amountInStr: string, amountOutRaw: bigint, direction: SwapDirection, slippagePercent: number) {
  const { address } = useAccount();
  const inputDecimals = direction === 'MON_TO_USDC' ? TOKENS.MON.decimals : TOKENS.USDC.decimals;

  let amountIn: bigint = 0n;
  try {
    if (amountInStr && !isNaN(Number(amountInStr))) {
      amountIn = parseUnits(amountInStr, inputDecimals);
    }
  } catch (e) {}

  // Calculate amountOutMin with slippage
  const slippageMultiplier = 10000 - Math.floor(slippagePercent * 100);
  const amountOutMin = (amountOutRaw * BigInt(slippageMultiplier)) / 10000n;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  // For USDC -> MON we need approval
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as Address, CONTRACTS.UniswapV2Router02],
    query: {
      enabled: !!address && direction === 'USDC_TO_MON',
    }
  });

  const needsApproval = direction === 'USDC_TO_MON' && (allowance ?? 0n) < amountIn;

  const { writeContractAsync: writeApprove, isPending: isApprovePending } = useWriteContract();
  const { writeContractAsync: writeSwap, isPending: isSwapPending } = useWriteContract();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeApprove = async () => {
    if (!address) return;
    setIsProcessing(true);
    try {
      const tx = await writeApprove({
        address: TOKENS.USDC.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.UniswapV2Router02, amountIn],
        gas: 60000n,
      });
      // Need to wait for tx in the component or assume it's pending via hook
      return tx;
    } finally {
      setIsProcessing(false);
    }
  };

  const executeSwap = async () => {
    if (!address) return;
    setIsProcessing(true);
    try {
      let tx;
      if (direction === 'MON_TO_USDC') {
        tx = await writeSwap({
          address: CONTRACTS.UniswapV2Router02,
          abi: V2_ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [amountOutMin, [TOKENS.WMON.address, TOKENS.USDC.address], address, deadline],
          value: amountIn,
          gas: 200000n,
        });
      } else {
        tx = await writeSwap({
          address: CONTRACTS.UniswapV2Router02,
          abi: V2_ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, amountOutMin, [TOKENS.USDC.address, TOKENS.WMON.address], address, deadline],
          gas: 200000n,
        });
      }
      return tx;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    needsApproval,
    executeApprove,
    executeSwap,
    isApprovePending,
    isSwapPending,
    isProcessing,
    refetchAllowance
  };
}
