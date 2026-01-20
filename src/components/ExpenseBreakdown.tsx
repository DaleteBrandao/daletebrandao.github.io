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
  'Mercado': { icon: ShoppingCart, colorClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
  'Peixe': { icon: Fish, colorClass: 'bg-blue-500', textClass: 'text-blue-500' },
  'Refrielvas': { icon: Leaf, colorClass: 'bg-green-500', textClass: 'text-green-500' },
  'Energia': { icon: Zap, colorClass: 'bg-yellow-500', textClass: 'text-yellow-500' },
  'Água': { icon: Droplets, colorClass: 'bg-cyan-500', textClass: 'text-cyan-500' },
  'Internet': { icon: Wifi, colorClass: 'bg-purple-500', textClass: 'text-purple-500' },
  'Segurança Social': { icon: Shield, colorClass: 'bg-indigo-500', textClass: 'text-indigo-500' },
  'Salário': { icon: Banknote, colorClass: 'bg-orange-500', textClass: 'text-orange-500' },
  'Freelancer': { icon: User, colorClass: 'bg-pink-500', textClass: 'text-pink-500' },
  'Chinês': { icon: Utensils, colorClass: 'bg-red-500', textClass: 'text-red-500' },
  'Decoração': { icon: Palette, colorClass: 'bg-teal-500', textClass: 'text-teal-500' },
  'Outros': { icon: MoreHorizontal, colorClass: 'bg-gray-500', textClass: 'text-gray-500' },
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
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft animate-fade-in" style={{ animationDelay: '250ms' }}>
      <h3 className="text-lg font-semibold font-display mb-4">Despesas por Categoria</h3>
      
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
        </>
      )}
    </div>
  );
}
