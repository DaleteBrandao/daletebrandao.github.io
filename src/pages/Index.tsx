import { useFinanceData } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/SummaryCard';
import { RevenueBreakdown } from '@/components/RevenueBreakdown';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionTable } from '@/components/TransactionTable';
import { MonthSelector } from '@/components/MonthSelector';
import { FinanceChart } from '@/components/FinanceChart';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';

const Index = () => {
  const {
    transactions,
    allTransactions,
    addTransaction,
    removeTransaction,
    selectedMonth,
    setSelectedMonth,
    receitasPorMetodo,
    totals,
  } = useFinanceData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
                <span className="text-2xl">🍣</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight">Yummi Sushi</h1>
                <p className="text-sm text-muted-foreground">Controle Financeiro</p>
              </div>
            </div>
            <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Receitas"
            value={totals.totalReceitas}
            icon={TrendingUp}
            variant="success"
            delay={0}
          />
          <SummaryCard
            title="Total Despesas"
            value={totals.totalDespesas}
            icon={TrendingDown}
            variant="danger"
            delay={100}
          />
          <SummaryCard
            title="Saldo do Mês"
            value={totals.saldoMes}
            icon={Wallet}
            variant={totals.saldoMes >= 0 ? 'success' : 'danger'}
            delay={200}
          />
          <SummaryCard
            title="Saldo Acumulado"
            value={totals.saldoAcumulado}
            icon={PiggyBank}
            variant="accent"
            delay={300}
          />
        </section>

        {/* Finance Chart */}
        <section>
          <FinanceChart transactions={allTransactions} />
        </section>

        {/* Revenue Breakdown & Form */}
        <section className="grid gap-6 lg:grid-cols-2">
          <RevenueBreakdown
            dinheiro={receitasPorMetodo.dinheiro}
            cartao={receitasPorMetodo.cartao}
            ixpressum={receitasPorMetodo.ixpressum}
          />
          <TransactionForm onAdd={addTransaction} selectedMonth={selectedMonth} />
        </section>

        {/* Transactions Table */}
        <section>
          <TransactionTable transactions={transactions} onRemove={removeTransaction} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container py-4">
          <p className="text-sm text-muted-foreground text-center">
            © 2024 Yummi Sushi • Gestão Financeira
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
