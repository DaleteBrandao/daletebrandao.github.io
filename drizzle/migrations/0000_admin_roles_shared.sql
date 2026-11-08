INSERT INTO public.user_roles (user_id, role) SELECT '51cbaf69-8c7d-4be5-b411-3bf85a6f6a01', 'admin' WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='51cbaf69-8c7d-4be5-b411-3bf85a6f6a01' AND role='admin');
CREATE POLICY "Admins view all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update all transactions" ON public.transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete all transactions" ON public.transactions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));