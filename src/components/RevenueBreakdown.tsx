import { Banknote, CreditCard, Smartphone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueBreakdownProps {
  dinheiro: number;
  cartao: number;
  pix: number;
  boleto: number;
  ixpressum: number;
}

export function RevenueBreakdown({ dinheiro, cartao, pix, boleto, ixpressum }: RevenueBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const total = dinheiro + cartao + pix + boleto + ixpressum;
  const getPercentage = (value: number) => total > 0 ? ((value / total) * 100).toFixed(1) : '0';

  const items = [
    { label: 'Dinheiro', value: dinheiro, icon: Banknote, colorClass: 'bg-cash', textClass: 'text-cash' },
    { label: 'Cartão', value: cartao, icon: CreditCard, colorClass: 'bg-cardPayment', textClass: 'text-cardPayment' },
    { label: 'PIX', value: pix, icon: Smartphone, colorClass: 'bg-pix', textClass: 'text-pix' },
    { label: 'Boleto', value: boleto, icon: FileText, colorClass: 'bg-boleto', textClass: 'text-boleto' },
    { label: 'IXpressum', value: ixpressum, icon: Smartphone, colorClass: 'bg-ixpressum', textClass: 'text-ixpressum' },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft animate-fade-in" style={{ animationDelay: '200ms' }}>
      <h3 className="text-lg font-semibold font-display mb-4">Receitas por Método</h3>
      
      {/* Progress bar */}
      <div className="h-3 rounded-full bg-muted overflow-hidden flex mb-6">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn('h-full transition-all duration-500', item.colorClass)}
            style={{ 
              width: `${getPercentage(item.value)}%`,
              animationDelay: `${300 + index * 100}ms`
            }}
          />
        ))}
      </div>

      {/* Breakdown list */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-slide-in"
            style={{ animationDelay: `${400 + index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', item.colorClass, 'bg-opacity-20')}>
                <item.icon className={cn('h-4 w-4', item.textClass)} />
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(item.value)}</p>
              <p className="text-xs text-muted-foreground">{getPercentage(item.value)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
