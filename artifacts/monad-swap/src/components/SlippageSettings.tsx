import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface SlippageSettingsProps {
  slippage: number;
  setSlippage: (val: number) => void;
}

export function SlippageSettings({ slippage, setSlippage }: SlippageSettingsProps) {
  const [inputValue, setInputValue] = useState(slippage.toString());

  const handleSlippageChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0.1 && num <= 50) {
      setSlippage(num);
    }
  };

  const presets = [0.1, 0.5, 1.0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          data-testid="button-slippage-settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-card border-border" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Slippage Tolerance</h4>
            <p className="text-xs text-muted-foreground">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>
          <div className="flex gap-2">
            {presets.map(preset => (
              <Button
                key={preset}
                variant={slippage === preset ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleSlippageChange(preset.toString())}
                data-testid={'button-slippage-preset-' + preset}
              >
                {preset}%
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => handleSlippageChange(e.target.value)}
                className="pr-6"
                placeholder="Custom"
                data-testid="input-custom-slippage"
              />
              <span className="absolute right-2 top-2.5 text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
