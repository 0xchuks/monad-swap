import { useState, useEffect, useCallback } from "react";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const currentChainId = await (window as any).ethereum.request({ method: "eth_chainId" });
          setChainId(currentChainId);
        }
      } catch (err: any) {
        console.error("Failed to check wallet connection", err);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId);
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnection]);

  const connect = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("MetaMask is not installed. Please install it to continue.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const currentChainId = await (window as any).ethereum.request({ method: "eth_chainId" });
        setChainId(currentChainId);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const getNetworkName = (id: string | null) => {
    switch (id) {
      case "0x1": return "Ethereum Mainnet";
      case "0xaa36a7": return "Sepolia Testnet";
      case "0x5": return "Goerli Testnet";
      case "0x89": return "Polygon Mainnet";
      case "0xa4b1": return "Arbitrum One";
      case "0xa": return "Optimism";
      case "0x2105": return "Base";
      default: return id ? `Unknown Network (${id})` : "Unknown";
    }
  };

  const isSupportedNetwork = chainId === "0x1" || chainId === "0xaa36a7";

  return {
    account,
    chainId,
    isConnecting,
    error,
    connect,
    networkName: getNetworkName(chainId),
    isSupportedNetwork,
    hasMetaMask: typeof window !== "undefined" && !!(window as any).ethereum
  };
}