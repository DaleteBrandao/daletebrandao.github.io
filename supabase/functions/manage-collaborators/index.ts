import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { canManageCollaborators, canDeleteTransaction, passwordMatches } from './rules.ts';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('list') }),
  z.object({ action: z.literal('invite'), name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), jobTitle: z.string().trim().min(2).max(120), redirectTo: z.string().url() }),
  z.object({ action: z.literal('remove'), id: z.string().uuid(), password: z.string().min(1).max(128) }),
  z.object({ action: z.literal('delete-transaction'), id: z.string().uuid(), password: z.string().min(1).max(128) }),
]);

Deno.serve(async (req) => {
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'Pedido inválido.' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return respond({ error: 'Serviço indisponível.' }, 503);
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const token = req.headers.get('Authorization')?.replace(/^Bearer /i, '');
    if (!token) return respond({ error: 'Entre na sua conta.' }, 401);
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user) return respond({ error: 'Sessão expirada. Entre novamente.' }, 401);
    const [{ data: active }, { data: isAdmin, error: roleError }] = await Promise.all([
      client.rpc('is_active_member', { _user_id: user.id }),
      client.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
    ]);
    if (!active || roleError) return respond({ error: 'Acesso indisponível.' }, 403);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return respond({ error: 'Verifique os campos preenchidos.' }, 400);
    const body = parsed.data;
    if (body.action !== 'delete-transaction' && !canManageCollaborators(Boolean(isAdmin), Boolean(active))) return respond({ error: 'Apenas a administradora pode gerir colaboradores.' }, 403);

    if (body.action === 'list') {
      const { data: roles, error } = await client.from('user_roles').select('user_id, role');
      if (error) throw error;
      const admins = new Set((roles || []).filter((r) => r.role === 'admin').map((r) => r.user_id));
      const ids = (roles || []).filter((r) => r.role === 'collaborator' && !admins.has(r.user_id)).map((r) => r.user_id);
      if (!ids.length) return respond({ collaborators: [] });
      const { data: collaborators, error: profileError } = await client.from('profiles').select('id, full_name, email, job_title, is_active').in('id', ids).order('created_at');
      if (profileError) throw profileError;
      return respond({ collaborators });
    }

    if (body.action === 'invite') {
      const redirect = new URL(body.redirectTo);
      const allowedHost = redirect.hostname === 'yummifinancas.lovable.app' || redirect.hostname === 'id-preview--f2f6ac90-f230-4432-b1a1-04619320614b.lovable.app';
      if (!allowedHost || redirect.protocol !== 'https:' || redirect.pathname !== '/reset-password') return respond({ error: 'Endereço do convite inválido.' }, 400);
      const { data, error } = await client.auth.admin.inviteUserByEmail(body.email, { data: { full_name: body.name }, redirectTo: body.redirectTo });
      if (error || !data.user) return respond({ error: 'Não foi possível enviar o convite. Verifique se o email já tem conta ou tente mais tarde.' }, 400);
      const { error: updateError } = await client.from('profiles').update({ full_name: body.name, job_title: body.jobTitle }).eq('id', data.user.id);
      if (updateError) throw updateError;
      return respond({ success: true });
    }

    const { data: allowed, error: attemptError } = await client.rpc('consume_deletion_attempt', { _user_id: user.id });
    if (attemptError) throw attemptError;
    if (!allowed) return respond({ error: 'Muitas tentativas. Aguarde um minuto.' }, 429);
    if (!passwordMatches(body.password, Deno.env.get('COLLABORATOR_DELETE_PASSWORD'))) return respond({ error: 'Senha de exclusão incorreta.' }, 403);

    if (body.action === 'remove') {
      if (body.id === user.id) return respond({ error: 'Não pode excluir a sua própria conta.' }, 400);
      const { data: targetAdmin } = await client.rpc('has_role', { _user_id: body.id, _role: 'admin' });
      if (targetAdmin) return respond({ error: 'Não pode excluir uma administradora.' }, 403);
      const { data: target } = await client.from('user_roles').select('id').eq('user_id', body.id).eq('role', 'collaborator').maybeSingle();
      if (!target) return respond({ error: 'Colaborador não encontrado.' }, 404);
      // Keep the account and attribution history, but revoke its access immediately.
      const { error } = await client.from('profiles').update({ is_active: false }).eq('id', body.id);
      if (error) throw error;
      const { error: banError } = await client.auth.admin.updateUserById(body.id, { ban_duration: '876000h' });
      if (banError) throw banError;
      return respond({ success: true });
    }

    const { data: transaction, error } = await client.from('transactions').select('user_id').eq('id', body.id).maybeSingle();
    if (error) throw error;
    if (!transaction) return respond({ error: 'Transação não encontrada.' }, 404);
    if (!canDeleteTransaction(Boolean(isAdmin), Boolean(active), user.id, transaction.user_id)) return respond({ error: 'Não tem permissão para excluir esta transação.' }, 403);
    const { data: removed, error: deleteError } = await client.from('transactions').delete().eq('id', body.id).select('id').maybeSingle();
    if (deleteError) throw deleteError;
    if (!removed) return respond({ error: 'Transação não encontrada.' }, 404);
    return respond({ success: true });
  } catch {
    return respond({ error: 'Não foi possível concluir o pedido. Tente novamente.' }, 500);
  }
});