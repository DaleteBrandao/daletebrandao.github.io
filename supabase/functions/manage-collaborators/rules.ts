export function canManageCollaborators(isAdmin: boolean, isActive: boolean) {
  return isAdmin && isActive;
}

export function canDeleteTransaction(isAdmin: boolean, isActive: boolean, actorId: string, authorId: string) {
  return isActive && (isAdmin || actorId === authorId);
}

export function passwordMatches(input: string, secret: string | undefined) {
  if (!secret || input.length !== secret.length) return false;
  let difference = 0;
  for (let i = 0; i < secret.length; i++) difference |= input.charCodeAt(i) ^ secret.charCodeAt(i);
  return difference === 0;
}