import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Transaction, PaymentMethod, ExpenseCategory } from '@/types/finance';
import { Plus, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'vendas_restaurante', label: 'Vendas Restaurante' },
  { value: 'vendas_ixpressum', label: 'Vendas IXpressum' },
  { value: 'outros', label: 'Outros' },
];

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  selectedMonth: string;
}

export function TransactionForm({ onAdd, selectedMonth }: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('vendas_restaurante');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'receita' | 'despesa'>('receita');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cartao');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalDescription = type === 'despesa' 
      ? (expenseCategory === 'outros' ? customDescription : EXPENSE_CATEGORIES.find(c => c.value === expenseCategory)?.label || '')
      : description;
    
    if (!finalDescription || !amount || !selectedDate) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    onAdd({
      date: formattedDate,
      description: finalDescription,
      type,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod,
    });

    setDescription('');
    setCustomDescription('');
    setAmount('');
    setSelectedDate(new Date());
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 shadow-soft animate-fade-in" style={{ animationDelay: '100ms' }}>
      <h3 className="text-lg font-semibold font-display mb-4">Nova Transação</h3>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-2">
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-background",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: pt }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          {type === 'despesa' ? (
            <div className="space-y-2">
              <Select value={expenseCategory} onValueChange={(v: ExpenseCategory) => setExpenseCategory(v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {expenseCategory === 'outros' && (
                <Input
                  id="customDescription"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Descreva a despesa"
                  className="bg-background"
                />
              )}
            </div>
          ) : (
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Vendas do dia"
              className="bg-background"
            />
          )}
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

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (€)</Label>
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
