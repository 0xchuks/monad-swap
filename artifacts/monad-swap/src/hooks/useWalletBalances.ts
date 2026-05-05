import { useState, useEffect, useCallback } from 'react';

const BALANCE_OF_SELECTOR = '0x70a08231';

async function getMonBalance(address: string): Promise<bigint> {
  if (!window.ethereum) return 0n;
  try {
    const hex: string = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    return BigInt(hex);
  } catch {
    return 0n;
  }
}

async function getERC20Balance(token: string, wallet: string): Promise<bigint> {
  if (!window.ethereum) return 0n;
  try {
    const paddedWallet = wallet.replace('0x', '').padStart(64, '0');
    const data = BALANCE_OF_SELECTOR + paddedWallet;
    const hex: string = await window.ethereum.request({
      method: 'eth_call',
      params: [{ to: token, data }, 'latest'],
    });
    if (!hex || hex === '0x') return 0n;
    return BigInt(hex);
  } catch {
    return 0n;
  }
}

export function useWalletBalances(address: string | undefined, usdcAddress: string) {
  const [monBalance, setMonBalance] = useState<bigint>(0n);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n);

  const refetch = useCallback(async () => {
    if (!address) return;
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
