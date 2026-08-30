-- Function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role user_role := 'customer';
  user_phone text := NULL;
BEGIN
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    BEGIN
      default_role := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
      default_role := 'customer';
    END;
  END IF;

  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data->>'phone' IS NOT NULL THEN
    user_phone := NEW.raw_user_meta_data->>'phone';
  ELSIF NEW.phone IS NOT NULL THEN
    user_phone := NEW.phone;
  ELSIF NEW.email LIKE '%@phone.agrirent.app' THEN
    user_phone := split_part(NEW.email, '@', 1);
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.email,
    default_role,
    user_phone
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger the function every time a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
