import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, PaymentMethod } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { manageCollaborators } from '@/lib/collaborators';

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
        authorName: t.author_name ?? undefined,
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') fetchTransactions();
      if (event === 'SIGNED_OUT') setTransactions([]);
    });
    return () => subscription.unsubscribe();
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
        authorName: data.author_name ?? undefined,
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

  const removeTransaction = useCallback(async (id: string, password: string) => {
    try {
      await manageCollaborators({ action: 'delete-transaction', id, password });

      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Transação removida com sucesso!',
      });
    } catch (error: any) {
      throw error;
    }
  }, [toast]);

  const updateTransaction = useCallback(async (id: string, changes: Partial<Omit<Transaction, 'id'>>) => {
    const { error } = await supabase.from('transactions').update({
      ...(changes.description !== undefined && { description: changes.description }),
      ...(changes.amount !== undefined && { amount: changes.amount }),
      ...(changes.date !== undefined && { date: changes.date }),
      ...(changes.paymentMethod !== undefined && { payment_method: changes.paymentMethod }),
    }).eq('id', id);
    if (error) {
      toast({ title: 'Erro ao editar', description: error.message, variant: 'destructive' });
      return;
    }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
    toast({ title: 'Sucesso', description: 'Transação atualizada!' });
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
    };
  }, [filteredTransactions]);

  const despesasPorDescricao = useMemo(() => {
    const despesas = filteredTransactions.filter(t => t.type === 'despesa');
    const categorias = ['Mercado', 'Peixe', 'Refrielvas', 'Energia', 'Água', 'Internet', 'Segurança Social', 'Salário', 'Freelancer', 'Chinês', 'Decoração', 'Outros'];
    
    const result: Record<string, number> = {};
    categorias.forEach(cat => {
      result[cat] = despesas.filter(t => t.description === cat).reduce((sum, t) => sum + t.amount, 0);
    });
    
    // Add any transactions with descriptions not in the list to "Outros"
    const outrasDescricoes = despesas.filter(t => !categorias.includes(t.description));
    result['Outros'] += outrasDescricoes.reduce((sum, t) => sum + t.amount, 0);
    
    return result;
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
    updateTransaction,
    selectedMonth,
    setSelectedMonth,
    receitasPorMetodo,
    despesasPorDescricao,
    totals,
    loading,
  };
}
