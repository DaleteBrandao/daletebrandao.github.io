import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceData } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/SummaryCard';
import { RevenueBreakdown } from '@/components/RevenueBreakdown';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionTable } from '@/components/TransactionTable';
import { MonthSelector } from '@/components/MonthSelector';
import { FinanceChart } from '@/components/FinanceChart';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut, Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  const {
    transactions,
    allTransactions,
    addTransaction,
    removeTransaction,
    selectedMonth,
    setSelectedMonth,
    receitasPorMetodo,
    totals,
    loading,
  } = useFinanceData();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

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
            <div className="flex items-center gap-4">
              <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
                pix={receitasPorMetodo.pix}
                boleto={receitasPorMetodo.boleto}
                ixpressum={receitasPorMetodo.ixpressum}
              />
              <TransactionForm onAdd={addTransaction} selectedMonth={selectedMonth} />
            </section>

            {/* Transactions Table */}
            <section>
              <TransactionTable transactions={transactions} onRemove={removeTransaction} />
            </section>
          </>
        )}
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
