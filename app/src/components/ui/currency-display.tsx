import { cn } from '../../lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  showSign?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
};

export function CurrencyDisplay({
  amount,
  currency,
  showSign = false,
  className,
  size = 'md',
}: CurrencyDisplayProps) {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return (
    <span
      className={cn(
        sizeStyles[size],
        showSign && isNegative && 'currency-negative',
        showSign && !isNegative && 'currency-positive',
        className
      )}
    >
      {showSign && isNegative && '-'}
      {formatted}
    </span>
  );
}
