import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Rocket, FileCheck, Shield, Image as ImageIcon, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { CollectionFormValues } from "./CollectionForm";
import { ArtworkFile } from "./ArtworkUpload";
import { RoyaltySettingsValues } from "./RoyaltySettings";
import { useWallet } from "@/hooks/useWallet";

interface DeployStepProps {
  collection: CollectionFormValues | null;
  artworks: ArtworkFile[];
  royalties: RoyaltySettingsValues | null;
  onBack: () => void;
}

export function DeployStep({ collection, artworks, royalties, onBack }: DeployStepProps) {
  const { account, networkName } = useWallet();
  const [deployState, setDeployState] = useState<"idle" | "compiling" | "uploading" | "deploying" | "success" | "error">("idle");
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const simulateDeployment = async () => {
    if (!account) {
      setDeployState("error");
      return;
    }

    try {
      setDeployState("compiling");
      await new Promise(r => setTimeout(r, 1500));
      
      setDeployState("uploading");
      await new Promise(r => setTimeout(r, 2000));
      
      setDeployState("deploying");
      await new Promise(r => setTimeout(r, 2500));
      
      const fakeAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setDeployedAddress(fakeAddress);
      setDeployState("success");
    } catch (e) {
      setDeployState("error");
    }
  };

  if (!collection || !royalties) return null;

  const isDeploying = ["compiling", "uploading", "deploying"].includes(deployState);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Review & Deploy</h2>
        <p className="text-muted-foreground">
          Review your collection details before deploying to the blockchain.
        </p>
      </div>

      {deployState === "success" && deployedAddress ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <Rocket className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Deployment Successful!</h3>
              <p className="text-muted-foreground max-w-md">
                Your NFT collection <strong>{collection.name}</strong> has been successfully deployed to the network.
              </p>
              
              <div className="bg-background/80 border border-border rounded-lg p-4 w-full max-w-md mt-4 font-mono text-sm break-all text-primary shadow-inner">
                {deployedAddress}
              </div>

              <div className="flex gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${deployedAddress}`, '_blank')}
                  data-testid="link-etherscan"
                >
                  View on Etherscan <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" /> Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-right">{collection.name}</span>
                  
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-medium text-right font-mono">{collection.symbol}</span>
                  
                  <span className="text-muted-foreground">Max Supply</span>
                  <span className="font-medium text-right">{collection.maxSupply.toLocaleString()}</span>
                  
                  <span className="text-muted-foreground">Mint Price</span>
                  <span className="font-medium text-right">{collection.mintPrice} ETH</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Royalties & Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-muted-foreground">Royalty %</span>
                  <span className="font-medium text-right">{royalties.percentage}%</span>
                  
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-medium text-right font-mono text-xs truncate" title={royalties.recipient}>
                    {royalties.recipient.substring(0, 10)}...
                  </span>
                  
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium text-right">{networkName}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" /> Assets Ready
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Total Tokens</span>
                  <span className="text-2xl font-bold">{artworks.length}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {artworks.slice(0, 4).map(a => (
                    <img key={a.id} src={a.previewUrl} alt="preview" className="w-12 h-12 rounded object-cover border border-border" />
                  ))}
                  {artworks.length > 4 && (
                    <div className="w-12 h-12 rounded border border-dashed border-border flex items-center justify-center text-xs font-medium text-muted-foreground bg-secondary/50">
                      +{artworks.length - 4}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {deployState === "error" && (
              <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Deployment Failed</AlertTitle>
                <AlertDescription>
                  Make sure your wallet is connected and you have enough funds for gas.
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-primary/50 bg-primary/5 backdrop-blur-sm relative overflow-hidden">
              {isDeploying && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-primary" 
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: deployState === "compiling" ? "33%" : deployState === "uploading" ? "66%" : "95%"
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <CardContent className="pt-6">
                <Button 
                  size="lg" 
                  className="w-full text-lg h-14 font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-1"
                  onClick={simulateDeployment}
                  disabled={isDeploying || deployState === "success"}
                  data-testid="button-deploy"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      {deployState === "compiling" && "Compiling Contract..."}
                      {deployState === "uploading" && "Uploading to IPFS..."}
                      {deployState === "deploying" && "Awaiting Confirmation..."}
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-3" /> Deploy Collection
                    </>
                  )}
                </Button>
                <p className="text-xs text-center mt-4 text-muted-foreground">
                  By deploying, you agree to sign a transaction with your connected wallet. This will incur gas fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {deployState !== "success" && !isDeploying && (
        <div className="pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Settings
          </Button>
        </div>
      )}
    </div>
  );
}