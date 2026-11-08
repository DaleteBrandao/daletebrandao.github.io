import { Transaction } from '@/types/finance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown, Banknote, CreditCard, Smartphone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pencil, Download, Search } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Omit<Transaction, 'id'>>) => void;
}

export function TransactionTable({ transactions, onRemove, onUpdate }: TransactionTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'dinheiro':
        return <Banknote className="h-4 w-4 text-cash" />;
      case 'cartao':
        return <CreditCard className="h-4 w-4 text-cardPayment" />;
      case 'pix':
        return <Smartphone className="h-4 w-4 text-pix" />;
      case 'boleto':
        return <FileText className="h-4 w-4 text-boleto" />;
      default:
        return null;
    }
  };

  const getPaymentLabel = (method?: string) => {
    switch (method) {
      case 'dinheiro':
        return 'Dinheiro';
      case 'cartao':
        return 'Cartão';
      case 'pix':
        return 'PIX';
      case 'boleto':
        return 'Boleto';
      default:
        return method;
    }
  };

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [methodFilter, setMethodFilter] = useState('todos');
  const [editing, setEditing] = useState<Transaction | null>(null);

  const visible = transactions.filter(t =>
    (typeFilter === 'todos' || t.type === typeFilter) &&
    (methodFilter === 'todos' || t.paymentMethod === methodFilter) &&
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const exportCsv = () => {
    const rows = [['Data', 'Descrição', 'Tipo', 'Método', 'Valor (€)'],
      ...visible.map(t => [t.date, t.description, t.type === 'receita' ? 'Receita' : 'Despesa', getPaymentLabel(t.paymentMethod) ?? '', t.amount.toFixed(2).replace('.', ',')])];
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'transacoes-yummi.csv';
    a.click();
  };

  const sortedTransactions = [...visible].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="p-5 border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold font-display">Transações do Mês</h3>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Exportar Excel</Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Procurar descrição" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os métodos</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Data</TableHead>
              <TableHead className="font-semibold">Descrição</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Método</TableHead>
              <TableHead className="font-semibold text-right">Valor</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma transação neste mês
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.id}
                  className="animate-slide-in hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      transaction.type === 'receita' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      {transaction.type === 'receita' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.paymentMethod ? (
                      <span className="inline-flex items-center gap-1.5">
                        {getPaymentIcon(transaction.paymentMethod)}
                        <span className="text-sm">{getPaymentLabel(transaction.paymentMethod)}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className={cn(
                    'text-right font-semibold',
                    transaction.type === 'receita' ? 'text-success' : 'text-destructive'
                  )}>
                    {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(transaction)} className="h-8 w-8 text-muted-foreground" aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(transaction.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar transação</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1"><Label>Descrição</Label>
                <Input value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="space-y-1"><Label>Valor (€)</Label>
                <Input type="number" step="0.01" min="0" value={editing.amount} onChange={e => setEditing({ ...editing, amount: Number(e.target.value) })} /></div>
              <div className="space-y-1"><Label>Data</Label>
                <Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} /></div>
              <div className="space-y-1"><Label>Método</Label>
                <Select value={editing.paymentMethod} onValueChange={v => setEditing({ ...editing, paymentMethod: v as Transaction['paymentMethod'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button disabled={!editing || !editing.description || !(editing.amount > 0) || !editing.paymentMethod} onClick={() => {
              if (!editing) return;
              onUpdate(editing.id, { description: editing.description, amount: editing.amount, date: editing.date, paymentMethod: editing.paymentMethod });
              setEditing(null);
            }}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
