import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface WidgetCardProps {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'warning' | 'danger' | 'success';
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-card',
  warning: 'bg-warning/10 border-warning/30',
  danger: 'bg-destructive/10 border-destructive/30',
  success: 'bg-success/10 border-success/30',
};

export function WidgetCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  onClick,
}: WidgetCardProps) {
  return (
    <div
      className={cn(
        'widget-card',
        variantStyles[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="widget-label">{title}</p>
          <div className="widget-value">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-secondary">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}
