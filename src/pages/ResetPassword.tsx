import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { YummiBrand } from '@/components/YummiBrand';
import { AuthShell } from '@/components/AuthShell';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    if (params.get('error') || params.get('error_code')) setLinkError(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) { setReady(true); setLinkError(false); }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else setTimeout(() => supabase.auth.getSession().then(({ data }) => { if (!data.session) setLinkError(true); }), 2500);
    });
    return () => subscription.unsubscribe();
  }, []);

  const resend = async () => {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    toast(error ? { title: 'Erro', description: error.message, variant: 'destructive' }
      : { title: 'Email enviado', description: 'Abra apenas o link do email mais recente.' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Senha alterada', description: 'Já pode usar a nova senha.' });
    navigate('/');
  };

  return (
    <AuthShell>
      <Card className="w-full border-border bg-card/95 shadow-elegant backdrop-blur-md">
        <CardHeader className="text-center space-y-5">
          <YummiBrand centered />
          <CardTitle className="text-3xl font-normal uppercase">Nova senha</CardTitle>
        </CardHeader>
        <CardContent>
          {linkError && !ready ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Este link já foi usado ou expirou. Peça um novo link e abra apenas o email mais recente.
              </p>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              <Button className="w-full" onClick={resend}>Enviar novo link</Button>
            </div>
          ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <PasswordInput id="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !ready}>{ready ? 'Guardar nova senha' : 'A validar link...'}</Button>
          </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
