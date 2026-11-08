import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'accent';
  delay?: number;
}

export function SummaryCard({ title, value, icon: Icon, variant = 'default', delay = 0 }: SummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const variantStyles = {
    default: 'bg-card border-border',
    success: 'bg-card border-border',
    danger: 'bg-card border-border',
    accent: 'bg-card border-accent/40',
  };

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-success/10 text-success',
    danger: 'bg-destructive/10 text-destructive',
    accent: 'bg-accent/10 text-accent',
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-success',
    danger: 'text-destructive',
    accent: 'text-accent',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-5 shadow-soft transition-all duration-300 hover:shadow-elegant animate-fade-in',
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-3xl font-semibold font-body tabular-nums', valueStyles[variant])}>
            {formatCurrency(value)}
          </p>
        </div>
        <div className={cn('rounded-lg p-2.5', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
