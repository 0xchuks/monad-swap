import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import { SIMPLE_SWAP_ABI, ERC20_ABI } from '../constants/abis';
import { TOKENS, CONTRACTS } from '../constants/tokens';
import { useState } from 'react';

type SwapDirection = 'MON_TO_USDC' | 'USDC_TO_MON';

// Gas limits — Monad testnet requires much higher gas than standard EVM
const GAS_SWAP = 5_000_000n;
const GAS_APPROVE = 2_000_000n;

export function useSwap(amountInStr: string, amountOutRaw: bigint, direction: SwapDirection, slippagePercent: number) {
  const { address } = useAccount();
  const inputDecimals = direction === 'MON_TO_USDC' ? TOKENS.MON.decimals : TOKENS.USDC.decimals;

  let amountIn: bigint = 0n;
  try {
    if (amountInStr && !isNaN(Number(amountInStr))) {
      amountIn = parseUnits(amountInStr, inputDecimals);
    }
  } catch (_e) {}

  const slippageMultiplier = 10000 - Math.floor(slippagePercent * 100);
  const amountOutMin = amountOutRaw > 0n
    ? (amountOutRaw * BigInt(slippageMultiplier)) / 10000n
    : 0n;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.SimpleSwap] : undefined,
    query: {
      enabled: !!address && direction === 'USDC_TO_MON',
    }
  });

  const needsApproval = direction === 'USDC_TO_MON' && (allowance ?? 0n) < amountIn;

  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writeSwap }   = useWriteContract();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeApprove = async () => {
    if (!address) return;
    setIsProcessing(true);
    try {
      return await writeApprove({
        address: TOKENS.USDC.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.SimpleSwap, maxUint256],
        gas: GAS_APPROVE,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeSwap = async () => {
    if (!address) return;
    setIsProcessing(true);
    try {
      if (direction === 'MON_TO_USDC') {
        return await writeSwap({
          address: CONTRACTS.SimpleSwap,
          abi: SIMPLE_SWAP_ABI,
          functionName: 'swapMonForUsdc',
          args: [amountOutMin],
          value: amountIn,
          gas: GAS_SWAP,
        });
      } else {
        return await writeSwap({
          address: CONTRACTS.SimpleSwap,
          abi: SIMPLE_SWAP_ABI,
          functionName: 'swapUsdcForMon',
          args: [amountIn, amountOutMin],
          gas: GAS_SWAP,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    needsApproval,
    executeApprove,
    executeSwap,
    isProcessing,
    refetchAllowance,
  };
}
