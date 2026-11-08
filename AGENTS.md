# Architecture rules
- Manage collaborator invitations, deactivation and password-protected deletions through the authenticated manage-collaborators edge function; validate roles and active status server-side to prevent client bypass.
- Preserve collaborator profiles and author snapshots when removing access so existing financial history keeps its attribution.
- Assign transaction author ID and name in a database trigger, never from client input, so attribution cannot be forged.