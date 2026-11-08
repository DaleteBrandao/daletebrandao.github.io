import type { ReactNode } from 'react';
import dishes from '@/assets/yummi-pratos.jpg.asset.json';

export function AuthShell({ children }: { children: ReactNode }) {
  return <main className="auth-scene relative flex min-h-screen items-center justify-center px-5 py-12">
    <img src={dishes.url} alt="Seleção de sushi do Yummi Sushi Bar" className="absolute inset-0 h-full w-full object-cover" />
    <div className="auth-photo-overlay absolute inset-0" />
    <div className="relative z-10 w-full max-w-md">{children}</div>
  </main>;
}