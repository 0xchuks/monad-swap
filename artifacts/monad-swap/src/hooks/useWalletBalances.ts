import { useState, useEffect, useCallback } from 'react';

const MONAD_TESTNET_RPC = 'https://testnet-rpc.monad.xyz';
const BALANCE_OF_SELECTOR = '0x70a08231';
let _rpcId = 1;

async function rpcCall(method: string, params: unknown[]): Promise<string> {
  const id = _rpcId++;
  const res = await fetch(MONAD_TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  if (!res.ok) throw new Error('RPC HTTP ' + res.status);
  const json = await res.json() as { result?: string; error?: { message: string } };
  if (json.error) throw new Error('RPC error: ' + json.error.message);
  if (!json.result) throw new Error('RPC returned no result');
  return json.result;
}

async function getMonBalance(address: string): Promise<bigint> {
  try {
    const hex = await rpcCall('eth_getBalance', [address, 'latest']);
    console.log('[balances] MON raw:', hex);
    return BigInt(hex);
  } catch (err) {
    console.error('[balances] MON fetch failed:', err);
    return 0n;
  }
}

async function getERC20Balance(token: string, wallet: string): Promise<bigint> {
  try {
    const paddedWallet = wallet.replace('0x', '').padStart(64, '0');
    const data = BALANCE_OF_SELECTOR + paddedWallet;
    const hex = await rpcCall('eth_call', [{ to: token, data }, 'latest']);
    console.log('[balances] USDC raw:', hex);
    if (!hex || hex === '0x') return 0n;
    return BigInt(hex);
  } catch (err) {
    console.error('[balances] USDC fetch failed:', err);
    return 0n;
  }
}

export function useWalletBalances(address: string | undefined, usdcAddress: string) {
  const [monBalance, setMonBalance] = useState<bigint>(0n);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);

  const refetch = useCallback(async () => {
    if (!address) return;
    console.log('[balances] fetching for', address);
    const [mon, usdc] = await Promise.all([
      getMonBalance(address),
      getERC20Balance(usdcAddress, address),
    ]);
    setMonBalance(mon);
    setUsdcBalance(usdc);
  }, [address, usdcAddress]);

  useEffect(() => {
    if (!address) {
      setMonBalance(0n);
      setUsdcBalance(0n);
      return;
    }
    refetch();
    const id = setInterval(refetch, 12000);
    return () => clearInterval(id);
  }, [address, refetch]);

  return { monBalance, usdcBalance, refetch };
}
