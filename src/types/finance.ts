export type PaymentMethod = 'dinheiro' | 'cartao' | 'pix' | 'boleto' | 'ixpressum';

export interface Transaction {
  id: string;
  user_id?: string;
  date: string;
  description: string;
  type: 'receita' | 'despesa';
  amount: number;
  paymentMethod?: PaymentMethod;
}

export interface MonthlyData {
  month: string;
  year: number;
  transactions: Transaction[];
  totalReceitas: number;
  totalDespesas: number;
  saldoMes: number;
}
