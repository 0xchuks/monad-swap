import { Input } from '@/components/ui/input';
import { formatUnits } from 'viem';

interface TokenInputProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  symbol: string;
  balanceRaw: bigint;
  decimals: number;
  readOnly?: boolean;
  isConnected?: boolean;
}

export function TokenInput({
  label,
  value,
  onChange,
  symbol,
  balanceRaw,
  decimals,
  readOnly = false,
  isConnected = false,
}: TokenInputProps) {
  const formattedBalance = formatUnits(balanceRaw, decimals);
  const displayBalance = parseFloat(formattedBalance).toLocaleString('en-US', {
    maximumFractionDigits: symbol === 'MON' ? 4 : 2,
  });

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 hover:border-border transition-colors">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {isConnected && (
          <span className="text-xs text-muted-foreground" data-testid={'text-balance-' + symbol}>
            Balance: {displayBalance} {symbol}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="0.0"
          readOnly={readOnly}
          className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-foreground placeholder:text-muted-foreground w-full"
          data-testid={'input-amount-' + symbol}
        />
        <div
          className="shrink-0 px-3 py-1.5 bg-primary/20 text-primary font-bold rounded-lg uppercase tracking-wider text-sm flex items-center justify-center min-w-[80px]"
          data-testid={'badge-token-' + symbol}
        >
          {symbol}
        </div>
      </div>
    </div>
  );
}
