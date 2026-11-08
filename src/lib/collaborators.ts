import { supabase } from '@/integrations/supabase/client';

export interface Collaborator {
  id: string;
  full_name: string | null;
  email: string | null;
  job_title: string | null;
  is_active: boolean;
}

export async function manageCollaborators(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('manage-collaborators', { body });
  if (error) {
    let message = 'Não foi possível concluir o pedido.';
    if (error.context instanceof Response) {
      const details = await error.context.json().catch(() => null);
      if (typeof details?.error === 'string') message = details.error;
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data as { success?: boolean; collaborators?: Collaborator[] };
}