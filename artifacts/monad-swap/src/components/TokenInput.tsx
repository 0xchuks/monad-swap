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
  const numericBalance = parseFloat(formattedBalance);
  const displayBalance = isConnected
    ? numericBalance.toLocaleString('en-US', {
        maximumFractionDigits: symbol === 'MON' ? 4 : 2,
      })
    : '--';

  const handleMaxClick = () => {
    if (!isConnected || readOnly || !onChange) return;
    onChange(formattedBalance);
  };

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 hover:border-border transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground" data-testid={'text-balance-' + symbol}>
            Balance: {displayBalance} {symbol}
          </span>
          {isConnected && !readOnly && numericBalance > 0 && (
            <button
              onClick={handleMaxClick}
              className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20"
            >
              MAX
            </button>
          )}
        </div>
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
