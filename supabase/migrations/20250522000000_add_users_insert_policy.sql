-- Add policy to allow service role to insert into users table
CREATE POLICY "Service role can insert users" ON public.users
FOR INSERT TO service_role
WITH CHECK (true);

-- Add policy to allow authenticated users to insert their own data
CREATE POLICY "Users can insert own data" ON public.users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Add policy to allow anon users to insert during signup
CREATE POLICY "Allow signup" ON public.users
FOR INSERT TO anon
WITH CHECK (true);
