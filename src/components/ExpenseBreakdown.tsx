import { 
  ShoppingCart, 
  Fish, 
  Leaf, 
  Zap, 
  Droplets, 
  Wifi, 
  Shield, 
  Banknote, 
  User, 
  Utensils, 
  Palette,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseBreakdownProps {
  despesas: Record<string, number>;
}

const categoryConfig: Record<string, { icon: React.ElementType; colorClass: string; textClass: string }> = {
  'Mercado': { icon: ShoppingCart, colorClass: 'bg-success', textClass: 'text-success' },
  'Peixe': { icon: Fish, colorClass: 'bg-cardPayment', textClass: 'text-cardPayment' },
  'Refrielvas': { icon: Leaf, colorClass: 'bg-success', textClass: 'text-success' },
  'Energia': { icon: Zap, colorClass: 'bg-accent', textClass: 'text-accent' },
  'Água': { icon: Droplets, colorClass: 'bg-cardPayment', textClass: 'text-cardPayment' },
  'Internet': { icon: Wifi, colorClass: 'bg-primary', textClass: 'text-primary' },
  'Segurança Social': { icon: Shield, colorClass: 'bg-cardPayment', textClass: 'text-cardPayment' },
  'Salário': { icon: Banknote, colorClass: 'bg-primary', textClass: 'text-primary' },
  'Freelancer': { icon: User, colorClass: 'bg-primary', textClass: 'text-primary' },
  'Chinês': { icon: Utensils, colorClass: 'bg-primary', textClass: 'text-primary' },
  'Decoração': { icon: Palette, colorClass: 'bg-success', textClass: 'text-success' },
  'Outros': { icon: MoreHorizontal, colorClass: 'bg-muted-foreground', textClass: 'text-muted-foreground' },
};

export function ExpenseBreakdown({ despesas }: ExpenseBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const total = Object.values(despesas).reduce((sum, val) => sum + val, 0);
  const getPercentage = (value: number) => total > 0 ? ((value / total) * 100).toFixed(1) : '0';

  // Filter out categories with zero values and sort by value descending
  const items = Object.entries(despesas)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      ...categoryConfig[label] || categoryConfig['Outros'],
    }));

  return (
    <div className="border-t border-border py-5 animate-fade-in" style={{ animationDelay: '250ms' }}>
      <h3 className="text-2xl font-display uppercase mb-4">Despesas por Categoria</h3>
      
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">Nenhuma despesa registrada</p>
      ) : (
        <>
          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted overflow-hidden flex mb-6">
            {items.map((item, index) => (
              <div
                key={item.label}
                className={cn('h-full transition-all duration-500', item.colorClass)}
                style={{ 
                  width: `${getPercentage(item.value)}%`,
                  animationDelay: `${350 + index * 100}ms`
                }}
              />
            ))}
          </div>

          {/* Breakdown list */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-slide-in"
                style={{ animationDelay: `${450 + index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', item.colorClass, 'bg-opacity-20')}>
                    <item.icon className="h-4 w-4 text-background" />
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
        </>
      )}
    </div>
  );
}
