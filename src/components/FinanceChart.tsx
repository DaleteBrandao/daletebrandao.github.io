import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Transaction } from '@/types/finance';

interface FinanceChartProps {
  transactions: Transaction[];
}

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const chartConfig = {
  receitas: {
    label: 'Receitas',
    color: 'hsl(var(--success))',
  },
  despesas: {
    label: 'Despesas',
    color: 'hsl(var(--destructive))',
  },
  saldo: {
    label: 'Saldo',
    color: 'hsl(var(--accent))',
  },
};

export function FinanceChart({ transactions }: FinanceChartProps) {
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { receitas: number; despesas: number }> = {};

    transactions.forEach((t) => {
      const monthKey = t.date.substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { receitas: 0, despesas: 0 };
      }
      if (t.type === 'receita') {
        monthlyData[monthKey].receitas += t.amount;
      } else {
        monthlyData[monthKey].despesas += t.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
          month: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
          receitas: data.receitas,
          despesas: data.despesas,
          saldo: data.receitas - data.despesas,
        };
      });
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border shadow-soft">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-lg font-display">Evolução Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Adicione transações para visualizar o gráfico
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-lg font-display">Evolução Financeira</CardTitle>
          <p className="text-sm text-muted-foreground">Receitas, despesas e saldo por mês</p>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                width={80}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="font-medium">
                        {formatCurrency(value as number)}
                      </span>
                    )}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="hsl(var(--destructive))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Saldo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
