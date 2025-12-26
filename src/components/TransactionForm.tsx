import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, PaymentMethod } from '@/types/finance';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  selectedMonth: string;
}

export function TransactionForm({ onAdd, selectedMonth }: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'receita' | 'despesa'>('receita');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cartao');
  const [day, setDay] = useState('01');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      date: `${selectedMonth}-${day.padStart(2, '0')}`,
      description,
      type,
      amount: parseFloat(amount),
      paymentMethod: type === 'receita' ? paymentMethod : undefined,
    });

    setDescription('');
    setAmount('');
    setDay('01');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 shadow-soft animate-fade-in" style={{ animationDelay: '100ms' }}>
      <h3 className="text-lg font-semibold font-display mb-4">Nova Transação</h3>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-2">
          <Label htmlFor="day">Dia</Label>
          <Input
            id="day"
            type="number"
            min="1"
            max="31"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="bg-background"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Vendas do dia"
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={(v: 'receita' | 'despesa') => setType(v)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === 'receita' && (
          <div className="space-y-2">
            <Label htmlFor="payment">Método</Label>
            <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="bg-background"
          />
        </div>
      </div>

      <Button type="submit" className="mt-4 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </form>
  );
}
