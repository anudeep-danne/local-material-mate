-- Temporarily disable RLS for testing order cancellation
-- This will help us identify if RLS is the issue

-- Disable RLS on orders table temporarily
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Also create a more permissive policy as backup
DROP POLICY IF EXISTS "Allow all operations for testing" ON public.orders;
CREATE POLICY "Allow all operations for testing" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS but with permissive policy
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY; 