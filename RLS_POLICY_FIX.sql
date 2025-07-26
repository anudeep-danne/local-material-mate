-- Fix RLS policies for users table to allow updates
-- This ensures users can update their own account information

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;

-- Create a more specific policy for updates
CREATE POLICY "Users can update their own data" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Create a policy for reading own data
CREATE POLICY "Users can read their own data" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Create a policy for inserting (during signup)
CREATE POLICY "Users can insert their own data" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Alternative: If you want to allow all operations (less secure but simpler)
-- CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true); 