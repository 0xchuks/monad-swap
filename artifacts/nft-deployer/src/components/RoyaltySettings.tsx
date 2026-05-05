import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, Settings } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export interface RoyaltySettingsValues {
  recipient: string;
  percentage: number;
}

interface RoyaltySettingsProps {
  initialValues: Partial<RoyaltySettingsValues>;
  onNext: (values: RoyaltySettingsValues) => void;
  onBack: () => void;
}

export function RoyaltySettings({ initialValues, onNext, onBack }: RoyaltySettingsProps) {
  const { account } = useWallet();
  const defaultRecipient = account || "0x0000000000000000000000000000000000000000";
  
  const [recipient, setRecipient] = useState(initialValues.recipient || defaultRecipient);
  const [percentage, setPercentage] = useState(initialValues.percentage ?? 5);

  const earningsOn1Eth = (1 * (percentage / 100)).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Royalty Settings</h2>
        <p className="text-muted-foreground">
          Configure secondary sales royalties (EIP-2981). These determine your earnings when NFTs are traded.
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6 space-y-8">
          
          <div className="space-y-3">
            <Label htmlFor="recipient">Royalty Recipient Address</Label>
            <Input 
              id="recipient"
              value={recipient} 
              onChange={e => setRecipient(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
              data-testid="input-royalty-recipient"
            />
            <p className="text-xs text-muted-foreground">
              Earnings from secondary sales will be sent to this address.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Royalty Percentage</Label>
              <span className="font-mono text-primary font-bold">{percentage}%</span>
            </div>
            
            <div className="flex gap-4 items-center">
              <Slider 
                value={[percentage]} 
                min={0} 
                max={15} 
                step={0.5}
                onValueChange={vals => setPercentage(vals[0])}
                className="flex-1"
                data-testid="slider-royalty-percentage"
              />
              <Input 
                type="number" 
                min={0} 
                max={15} 
                step={0.5} 
                value={percentage} 
                onChange={e => setPercentage(Number(e.target.value))}
                className="w-20 text-center font-mono"
              />
            </div>
            
            <div className="bg-secondary/50 border border-border p-4 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-background rounded-md shadow-sm border border-border">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Earnings</p>
                <p className="text-sm text-muted-foreground mt-1">
                  On a secondary sale of 1 ETH, you'll receive <span className="font-mono text-white font-bold">{earningsOn1Eth} ETH</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              type="button" 
              onClick={() => onNext({ recipient, percentage })} 
              className="gap-2" 
              data-testid="button-next-step"
            >
              Continue to Deploy <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}