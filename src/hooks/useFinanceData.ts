import { useState, useCallback, useMemo } from 'react';
import { Transaction, PaymentMethod, MonthlyData } from '@/types/finance';

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialTransactions: Transaction[] = [
  { id: generateId(), date: '2024-01-05', description: 'Vendas do dia', type: 'receita', amount: 2500, paymentMethod: 'cartao' },
  { id: generateId(), date: '2024-01-05', description: 'Vendas em dinheiro', type: 'receita', amount: 800, paymentMethod: 'dinheiro' },
  { id: generateId(), date: '2024-01-06', description: 'Pedidos IXpressum', type: 'receita', amount: 1200, paymentMethod: 'ixpressum' },
  { id: generateId(), date: '2024-01-07', description: 'Fornecedor de peixe', type: 'despesa', amount: 1500 },
  { id: generateId(), date: '2024-01-08', description: 'Conta de luz', type: 'despesa', amount: 450 },
  { id: generateId(), date: '2024-01-10', description: 'Vendas cartão', type: 'receita', amount: 3200, paymentMethod: 'cartao' },
  { id: generateId(), date: '2024-01-12', description: 'Salários', type: 'despesa', amount: 4500 },
  { id: generateId(), date: '2024-01-15', description: 'Vendas em dinheiro', type: 'receita', amount: 950, paymentMethod: 'dinheiro' },
];

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-01');

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: generateId() }]);
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const receitasPorMetodo = useMemo(() => {
    const receitas = filteredTransactions.filter(t => t.type === 'receita');
    return {
      dinheiro: receitas.filter(t => t.paymentMethod === 'dinheiro').reduce((sum, t) => sum + t.amount, 0),
      cartao: receitas.filter(t => t.paymentMethod === 'cartao').reduce((sum, t) => sum + t.amount, 0),
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
  };
}
