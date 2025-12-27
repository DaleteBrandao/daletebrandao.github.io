import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, PaymentMethod } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch transactions from database
  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedTransactions: Transaction[] = (data || []).map(t => ({
        id: t.id,
        user_id: t.user_id,
        date: t.date,
        description: t.description,
        type: t.type as 'receita' | 'despesa',
        amount: Number(t.amount),
        paymentMethod: t.payment_method as PaymentMethod | undefined,
      }));

      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as transações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para adicionar transações.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          payment_method: transaction.paymentMethod,
          date: transaction.date,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        description: data.description,
        type: data.type as 'receita' | 'despesa',
        amount: Number(data.amount),
        paymentMethod: data.payment_method as PaymentMethod | undefined,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Transação adicionada com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error);
      toast({
        title: 'Erro ao adicionar',
        description: error.message || 'Não foi possível adicionar a transação.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const removeTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Transação removida com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao remover transação:', error);
      toast({
        title: 'Erro ao remover',
        description: error.message || 'Não foi possível remover a transação.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const receitasPorMetodo = useMemo(() => {
    const receitas = filteredTransactions.filter(t => t.type === 'receita');
    return {
      dinheiro: receitas.filter(t => t.paymentMethod === 'dinheiro').reduce((sum, t) => sum + t.amount, 0),
      cartao: receitas.filter(t => t.paymentMethod === 'cartao').reduce((sum, t) => sum + t.amount, 0),
      pix: receitas.filter(t => t.paymentMethod === 'pix').reduce((sum, t) => sum + t.amount, 0),
      boleto: receitas.filter(t => t.paymentMethod === 'boleto').reduce((sum, t) => sum + t.amount, 0),
      ixpressum: receitas.filter(t => t.paymentMethod === 'ixpressum').reduce((sum, t) => sum + t.amount, 0),
    };
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    const totalReceitas = filteredTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const totalDespesas = filteredTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const saldoMes = totalReceitas - totalDespesas;

    // Calculate accumulated balance (all transactions up to selected month)
    const [year, month] = selectedMonth.split('-').map(Number);
    const allPreviousTransactions = transactions.filter(t => {
      const [tYear, tMonth] = t.date.split('-').map(Number);
      return tYear < year || (tYear === year && tMonth <= month);
    });
    
    const totalReceitasAcumulado = allPreviousTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const totalDespesasAcumulado = allPreviousTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const saldoAcumulado = totalReceitasAcumulado - totalDespesasAcumulado;

    return { totalReceitas, totalDespesas, saldoMes, saldoAcumulado };
  }, [filteredTransactions, transactions, selectedMonth]);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    addTransaction,
    removeTransaction,
    selectedMonth,
    setSelectedMonth,
    receitasPorMetodo,
    totals,
    loading,
  };
}
