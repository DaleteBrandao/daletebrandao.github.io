# Architecture rules
- Manage collaborator invitations, deactivation and password-protected deletions through the authenticated manage-collaborators edge function; validate roles and active status server-side to prevent client bypass.
- Preserve collaborator profiles and author snapshots when removing access so existing financial history keeps its attribution.
- Assign transaction author ID and name in a database trigger, never from client input, so attribution cannot be forged.
- Keep selectable payment methods in one shared frontend module; preserve legacy methods for historical reporting without offering them in transaction controls.
- Share branding and the authentication photo shell across entry and password pages; define the restaurant theme in global tokens so financial controls remain consistent.
- Define income options and their persisted descriptions in the income-categories module so category selection and transaction attribution can be tested independently of the form.