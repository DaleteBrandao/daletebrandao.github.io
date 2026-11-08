import { useEffect, useState } from 'react';
import { UserPlus, Users, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeletionDialog } from '@/components/DeletionDialog';
import { manageCollaborators, Collaborator } from '@/lib/collaborators';
import { useToast } from '@/hooks/use-toast';

export function CollaboratorManager() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Collaborator | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('assistente de sala');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    setError('');
    try { const data = await manageCollaborators({ action: 'list' }); setCollaborators(data.collaborators || []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível carregar colaboradores.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const invite = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setFormError('');
    try {
      const origin = window.location.hostname === 'localhost' ? 'https://yummifinancas.lovable.app' : window.location.origin;
      await manageCollaborators({ action: 'invite', name, email, jobTitle, redirectTo: `${origin}/reset-password` });
      setAdding(false); setName(''); setEmail('');
      toast({ title: 'Convite enviado', description: 'O colaborador recebe um email para confirmar a conta e definir a senha.' });
      await load();
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Não foi possível enviar o convite.'); }
    finally { setBusy(false); }
  };

  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl font-semibold font-display"><Users className="h-5 w-5 text-primary" />Colaboradores</h2>
      <Button onClick={() => { setFormError(''); setAdding(true); }}><UserPlus className="mr-2 h-4 w-4" />Incluir colaborador</Button>
    </div>
    {loading ? <Loader2 aria-label="A carregar colaboradores" className="h-6 w-6 animate-spin text-primary" /> : error ? <div role="alert" className="space-y-2"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={load}>Tentar novamente</Button></div> : <div className="overflow-x-auto border border-border rounded-lg">
      <Table><TableHeader><TableRow><TableHead>Nome / ID</TableHead><TableHead>Função</TableHead><TableHead>Email</TableHead><TableHead>Estado</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
        <TableBody>{collaborators.length === 0 ? <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">Nenhum colaborador</TableCell></TableRow> : collaborators.map((person) => <TableRow key={person.id}>
          <TableCell><p className="font-medium">{person.full_name || 'Colaborador'}</p><p className="text-xs text-muted-foreground break-all">{person.id}</p></TableCell>
          <TableCell>{person.job_title || 'Colaborador'}</TableCell><TableCell>{person.email}</TableCell><TableCell className={person.is_active ? 'text-success' : 'text-muted-foreground'}>{person.is_active ? 'Ativo' : 'Excluído'}</TableCell>
          <TableCell>{person.is_active && <Button variant="ghost" size="icon" aria-label={`Excluir ${person.full_name || 'colaborador'}`} title="Excluir colaborador" onClick={() => setRemoving(person)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</TableCell>
        </TableRow>)}</TableBody></Table>
    </div>}
    <Dialog open={adding} onOpenChange={(open) => { if (!busy) setAdding(open); }}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Incluir colaborador</DialogTitle><DialogDescription>Convite de acesso ao Yummi Finanças</DialogDescription></DialogHeader>
      <form onSubmit={invite} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="collaborator-name">Nome</Label><Input id="collaborator-name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="collaborator-email">Email</Label><Input id="collaborator-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="collaborator-job">Função</Label><Select value={jobTitle} onValueChange={setJobTitle}><SelectTrigger id="collaborator-job"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="assistente de sala">Assistente de sala</SelectItem><SelectItem value="cozinheiro">Cozinheiro</SelectItem><SelectItem value="ajudante de cozinha">Ajudante de cozinha</SelectItem><SelectItem value="colaborador">Colaborador</SelectItem></SelectContent></Select></div>
        {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}Enviar convite</Button>
      </form>
    </DialogContent></Dialog>
    {removing && <DeletionDialog title="Excluir colaborador" description={`Retirar o acesso de ${removing.full_name || removing.email}? Os lançamentos e a identificação permanecem guardados.`} onClose={() => setRemoving(null)} onConfirm={async (password) => {
      await manageCollaborators({ action: 'remove', id: removing.id, password });
      toast({ title: 'Colaborador excluído', description: 'O acesso foi retirado; o histórico foi preservado.' });
      await load();
    }} />}
  </section>;
}