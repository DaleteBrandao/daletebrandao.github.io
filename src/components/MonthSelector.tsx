import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const [year, month] = selectedMonth.split('-').map(Number);
  
  const formatMonthYear = (dateString: string) => {
    const [y, m] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border shadow-soft">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-display font-semibold capitalize min-w-[160px] text-center">
          {formatMonthYear(selectedMonth)}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => changeMonth(-1)}
          className="h-10 w-10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => changeMonth(1)}
          className="h-10 w-10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
