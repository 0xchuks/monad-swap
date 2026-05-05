import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits, encodeFunctionData, decodeFunctionResult } from 'viem';
import type { Address } from 'viem';
import { V2_ROUTER_ABI } from '../constants/abis';
import { TOKENS, CONTRACTS } from '../constants/tokens';

const MONAD_TESTNET_RPC = 'https://testnet-rpc.monad.xyz';
let _rpcId = 200;

async function rpcEthCall(to: string, data: string): Promise<string> {
  const id = _rpcId++;
  const res = await fetch(MONAD_TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method: 'eth_call', params: [{ to, data }, 'latest'] }),
  });
  if (!res.ok) throw new Error('RPC HTTP ' + res.status);
  const json = await res.json() as { result?: string; error?: { message: string; data?: string } };
  if (json.error) {
    const msg = json.error.message ?? 'Unknown RPC error';
    if (msg.includes('INSUFFICIENT_LIQUIDITY') || msg.includes('INVALID_PATH')) {
      throw new Error('No liquidity for this pair');
    }
    throw new Error(msg);
  }
  if (!json.result || json.result === '0x') {
    throw new Error('No liquidity for this pair');
  }
  return json.result;
}

type SwapDirection = 'MON_TO_USDC' | 'USDC_TO_MON';

export function useSwapQuote(amountInStr: string, direction: SwapDirection) {
  const { isConnected } = useAccount();
  const [amountOutStr, setAmountOutStr] = useState('');
  const [amountOutRaw, setAmountOutRaw] = useState<bigint>(0n);
  const [isPending, setIsPending] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const inputDecimals = direction === 'MON_TO_USDC' ? TOKENS.MON.decimals : TOKENS.USDC.decimals;
  const outputDecimals = direction === 'MON_TO_USDC' ? TOKENS.USDC.decimals : TOKENS.MON.decimals;

  const path: Address[] = direction === 'MON_TO_USDC'
    ? [TOKENS.WMON.address, TOKENS.USDC.address]
    : [TOKENS.USDC.address, TOKENS.WMON.address];

  const fetchQuote = useCallback(async () => {
    if (!amountInStr || amountInStr === '0' || !isConnected) {
      setAmountOutStr('');
      setAmountOutRaw(0n);
      setQuoteError(null);
      setIsPending(false);
      return;
    }

    let amountIn: bigint;
    try {
      amountIn = parseUnits(amountInStr, inputDecimals);
      if (amountIn === 0n) return;
    } catch {
      return;
    }

    setIsPending(true);
    setQuoteError(null);

    try {
      const data = encodeFunctionData({
        abi: V2_ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path],
      });

      const result = await rpcEthCall(CONTRACTS.UniswapV2Router02, data);

      const decoded = decodeFunctionResult({
        abi: V2_ROUTER_ABI,
        functionName: 'getAmountsOut',
        data: result as `0x${string}`,
      });

      const out = decoded[1];
      setAmountOutRaw(out);
      setAmountOutStr(formatUnits(out, outputDecimals));
      setQuoteError(null);
      console.log('[quote] amountOut:', out.toString());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Quote failed';
      console.error('[quote] error:', msg);
      setQuoteError(msg);
      setAmountOutStr('');
      setAmountOutRaw(0n);
    } finally {
      setIsPending(false);
    }
  }, [amountInStr, direction, isConnected, inputDecimals, outputDecimals]);

  useEffect(() => {
    fetchQuote();
    if (!amountInStr || amountInStr === '0' || !isConnected) return;
    const id = setInterval(fetchQuote, 10000);
    return () => clearInterval(id);
  }, [fetchQuote, amountInStr, isConnected]);

  return { amountOutStr, amountOutRaw, isPending, quoteError, refetch: fetchQuote };
}
