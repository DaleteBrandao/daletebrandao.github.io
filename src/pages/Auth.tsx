import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { YummiBrand } from '@/components/YummiBrand';
import { AuthShell } from '@/components/AuthShell';
import { Loader2, Mail, Lock } from 'lucide-react';

function traduzirErro(msg?: string) {
  if (!msg) return 'Ocorreu um erro. Tente novamente.';
  if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
  if (msg.includes('Email not confirmed')) return 'Confirme o seu email antes de entrar (veja a caixa de correio).';
  if (msg.includes('rate limit')) return 'Demasiados pedidos de email. Aguarde cerca de 1 hora e tente novamente.';
  if (msg.includes('already registered')) return 'Este email já tem conta. Use "Entrar".';
  if (msg.includes('Password should be')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (msg.includes('pwned') || msg.includes('weak')) return 'Esta senha é muito comum. Escolha outra mais segura.';
  return msg;
}

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Erro',
        description: traduzirErro(error?.message),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Card className="w-full border-border bg-card/95 shadow-elegant backdrop-blur-md">
        <CardHeader className="space-y-5 text-center pb-6">
          <YummiBrand centered />
          <CardTitle className="text-3xl font-normal uppercase">Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 z-10 h-4 w-4 text-muted-foreground" />
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-sm text-primary"
              onClick={async () => {
                if (!email) {
                  toast({ title: 'Indique o email', description: 'Escreva o seu email acima primeiro.', variant: 'destructive' });
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
                toast(error
                  ? { title: 'Erro', description: traduzirErro(error.message), variant: 'destructive' }
                  : { title: 'Email enviado', description: 'Veja a sua caixa de correio para criar uma nova senha.' });
              }}
            >
              Esqueci a senha
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
