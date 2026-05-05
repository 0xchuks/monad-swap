import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

interface WalletConnectProps {
  onNext: () => void;
}

export function WalletConnect({ onNext }: WalletConnectProps) {
  const { account, connect, isConnecting, error, networkName, isSupportedNetwork, hasMetaMask } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Connect Wallet</h2>
        <p className="text-muted-foreground">
          Connect your Ethereum wallet to deploy your NFT collection.
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Wallet Status
          </CardTitle>
          <CardDescription>
            Your wallet will be the owner of the deployed smart contract.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasMetaMask ? (
            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>MetaMask not found</AlertTitle>
              <AlertDescription className="flex flex-col gap-2 mt-2">
                <span>Please install a Web3 wallet like MetaMask to continue.</span>
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary hover:underline font-medium inline-block w-fit"
                  data-testid="link-install-metamask"
                >
                  Install MetaMask
                </a>
              </AlertDescription>
            </Alert>
          ) : !account ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-border rounded-lg bg-background/50">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <Button 
                onClick={connect} 
                disabled={isConnecting}
                size="lg"
                className="w-full sm:w-auto"
                data-testid="button-connect-wallet"
              >
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </Button>
              {error && (
                <p className="text-destructive text-sm mt-4 font-medium text-center">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Connected Address</p>
                    <p className="text-lg font-mono text-foreground font-semibold" data-testid="text-wallet-address">
                      {truncateAddress(account)}
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Network</p>
                  <p className="text-md font-medium text-foreground" data-testid="text-wallet-network">
                    {networkName}
                  </p>
                </div>
                {!isSupportedNetwork && (
                  <span className="text-xs font-medium bg-destructive/20 text-destructive px-2 py-1 rounded-md border border-destructive/20">
                    Unsupported
                  </span>
                )}
              </div>

              {!isSupportedNetwork && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Unsupported Network</AlertTitle>
                  <AlertDescription>
                    Please switch to Ethereum Mainnet or Sepolia Testnet in your wallet to deploy safely.
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={onNext} 
                  disabled={!isSupportedNetwork}
                  className="gap-2"
                  data-testid="button-next-step"
                >
                  Continue to Collection Details <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}