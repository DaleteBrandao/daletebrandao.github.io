import logo from '@/assets/yummi-logo.png';
import { cn } from '@/lib/utils';

export function YummiBrand({ centered = false }: { centered?: boolean }) {
  return <div className={cn('flex items-center gap-4', centered && 'flex-col text-center')}>
    <img src={logo} alt="Yummi Sushi Bar" className={cn('w-auto object-contain', centered ? 'h-24' : 'h-14')} />
    <div className="min-w-0">
      <p className="font-display text-3xl uppercase leading-none text-foreground">Yummi Finanças</p>
      <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">Yummi Sushi Bar</p>
    </div>
  </div>;
}