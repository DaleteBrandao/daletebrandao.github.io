import { Transaction } from '@/types/finance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown, Banknote, CreditCard, Smartphone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  onRemove: (id: string) => void;
}

export function TransactionTable({ transactions, onRemove }: TransactionTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold font-display">Transações do Mês</h3>
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
                  <TableCell>
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
    </div>
  );
}
