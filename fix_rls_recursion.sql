-- Fix for infinite recursion in RLS policies

-- 1. Create a SECURITY DEFINER function to safely get the current user's role
-- By using SECURITY DEFINER, this function bypasses RLS and prevents the infinite loop.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Drop the existing policies that cause infinite recursion on the profiles table
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;

-- 3. Recreate the policy using the new function
CREATE POLICY "Admins can manage all profiles." ON public.profiles
FOR ALL TO authenticated
USING (get_user_role() = 'admin');

-- 4. Apply the same fix to all other tables that use the recursive policy check
DROP POLICY IF EXISTS "Admins can manage categories." ON public.categories;
CREATE POLICY "Admins can manage categories." ON public.categories TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all equipment." ON public.equipment;
CREATE POLICY "Admins can view all equipment." ON public.equipment FOR SELECT TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Owners can insert their own equipment." ON public.equipment;
CREATE POLICY "Owners can insert their own equipment." ON public.equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND get_user_role() = 'owner');

DROP POLICY IF EXISTS "Admins can update equipment (approve/reject)." ON public.equipment;
CREATE POLICY "Admins can update equipment (approve/reject)." ON public.equipment FOR UPDATE TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage all equipment images." ON public.equipment_images;
CREATE POLICY "Admins can manage all equipment images." ON public.equipment_images TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view/manage all bookings." ON public.bookings;
CREATE POLICY "Admins can view/manage all bookings." ON public.bookings TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all rentals." ON public.rentals;
CREATE POLICY "Admins can view all rentals." ON public.rentals FOR ALL TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all rental items." ON public.rental_items;
CREATE POLICY "Admins can view all rental items." ON public.rental_items FOR ALL TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view/manage all payments." ON public.payments;
CREATE POLICY "Admins can view/manage all payments." ON public.payments TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage all reviews." ON public.reviews;
CREATE POLICY "Admins can manage all reviews." ON public.reviews TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage owner requests." ON public.owner_requests;
CREATE POLICY "Admins can manage owner requests." ON public.owner_requests TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all transactions." ON public.transactions;
CREATE POLICY "Admins can view all transactions." ON public.transactions FOR SELECT TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view activity logs." ON public.activity_logs;
CREATE POLICY "Admins can view activity logs." ON public.activity_logs FOR SELECT TO authenticated USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view/manage contact messages." ON public.contact_messages;
CREATE POLICY "Admins can view/manage contact messages." ON public.contact_messages TO authenticated USING (get_user_role() = 'admin');

-- 5. Update handle_new_user trigger function to read the selected role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role user_role := 'customer';
BEGIN
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    BEGIN
      default_role := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
      default_role := 'customer';
    END;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.email,
    default_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

