import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowDownUp } from 'lucide-react';
import { TokenInput } from './TokenInput';
import { SlippageSettings } from './SlippageSettings';
import { useDebounce } from '../hooks/useDebounce';
import { useSwapQuote } from '../hooks/useSwapQuote';
import { useSwap } from '../hooks/useSwap';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { TOKENS } from '../constants/tokens';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [direction, setDirection] = useState<'MON_TO_USDC' | 'USDC_TO_MON'>('MON_TO_USDC');
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);

  const debouncedAmountIn = useDebounce(amountIn, 300);

  const { monBalance, usdcBalance, refetch: refetchBalances } = useWalletBalances(
    address,
    TOKENS.USDC.address
  );

  const { amountOutStr, amountOutRaw, isPending: isQuotePending } = useSwapQuote(debouncedAmountIn, direction);

  const displayAmountOut = (debouncedAmountIn === '' || debouncedAmountIn === '0')
    ? '--'
    : (isQuotePending ? 'Fetching...' : amountOutStr);

  const {
    needsApproval,
    executeApprove,
    executeSwap,
    isProcessing,
    refetchAllowance,
  } = useSwap(debouncedAmountIn, amountOutRaw, direction, slippage);

  const handleSwapDirection = () => {
    setDirection(prev => prev === 'MON_TO_USDC' ? 'USDC_TO_MON' : 'MON_TO_USDC');
    setAmountIn('');
  };

  const handleAction = async () => {
    if (needsApproval) {
      try {
        await executeApprove();
        toast({ title: 'Approval submitted', description: 'Waiting for confirmation...' });
        setTimeout(() => refetchAllowance(), 5000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        toast({ variant: 'destructive', title: 'Approval failed', description: msg });
      }
    } else {
      try {
        const tx = await executeSwap();
        if (tx) {
          toast({ title: 'Swap submitted', description: 'Tx hash: ' + tx });
          setAmountIn('');
          setTimeout(() => refetchBalances(), 5000);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        toast({ variant: 'destructive', title: 'Swap failed', description: msg });
      }
    }
  };

  let buttonText = 'Connect Wallet';
  let buttonDisabled = true;
  let actionFn: (() => void) | undefined = undefined;

  if (isConnected) {
    if (!amountIn || amountIn === '0') {
      buttonText = 'Enter an amount';
      buttonDisabled = true;
    } else if (isProcessing) {
      buttonText = needsApproval ? 'Approving...' : 'Swapping...';
      buttonDisabled = true;
    } else if (needsApproval) {
      buttonText = 'Approve USDC';
      buttonDisabled = false;
      actionFn = handleAction;
    } else {
      buttonText = 'Swap';
      buttonDisabled = false;
      actionFn = handleAction;
    }
  }

  const inputToken = direction === 'MON_TO_USDC' ? TOKENS.MON : TOKENS.USDC;
  const outputToken = direction === 'MON_TO_USDC' ? TOKENS.USDC : TOKENS.MON;

  const inputBalance = direction === 'MON_TO_USDC' ? monBalance : usdcBalance;
  const outputBalance = direction === 'MON_TO_USDC' ? usdcBalance : monBalance;

  const rate = amountOutStr && debouncedAmountIn
    ? (Number(amountOutStr) / Number(debouncedAmountIn)).toFixed(6)
    : null;
  const rateDisplay = rate
    ? '1 ' + inputToken.symbol + ' = ' + rate + ' ' + outputToken.symbol
    : '';

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-border bg-card/90 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">Swap</CardTitle>
        <SlippageSettings slippage={slippage} setSlippage={setSlippage} />
      </CardHeader>
      <CardContent className="space-y-2">
        <TokenInput
          label="You pay"
          value={amountIn}
          onChange={setAmountIn}
          symbol={inputToken.symbol}
          balanceRaw={inputBalance}
          decimals={inputToken.decimals}
          isConnected={isConnected}
        />

        <div className="flex justify-center -my-3 relative z-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 bg-background border-border shadow-md hover:bg-secondary transition-transform hover:scale-110 active:scale-95"
            onClick={handleSwapDirection}
            data-testid="button-flip-tokens"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <TokenInput
          label="You receive"
          value={displayAmountOut}
          symbol={outputToken.symbol}
          balanceRaw={outputBalance}
          decimals={outputToken.decimals}
          isConnected={isConnected}
          readOnly
        />

        {rateDisplay && (
          <div className="flex items-center justify-between px-2 pt-4 pb-2 text-sm text-muted-foreground">
            <span>Exchange Rate</span>
            <span className="font-mono">{rateDisplay}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isConnected ? (
          <div className="w-full flex justify-center [&>div]:w-full [&>div>button]:w-full [&>div>button]:h-12 [&>div>button]:text-lg [&>div>button]:font-bold">
            <ConnectButton showBalance={false} chainStatus="none" />
          </div>
        ) : (
          <Button
            className="w-full h-12 text-lg font-bold"
            disabled={buttonDisabled}
            onClick={actionFn}
            data-testid="button-execute-swap"
          >
            {buttonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
