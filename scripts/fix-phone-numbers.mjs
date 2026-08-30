import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { Client } = pg

const client = new Client({
  host: 'db.zgykctyindlmnfyqrood.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Karthik@2001M',
  ssl: {
    rejectUnauthorized: false
  }
})

async function run() {
  try {
    await client.connect()
    console.log('Connected to Database.')

    // 1. Update the handle_new_user trigger function to include phone
    const updateTriggerSql = `
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
    `
    await client.query(updateTriggerSql)
    console.log('Successfully updated handle_new_user trigger function.')

    // 2. Backfill existing profiles from auth.users metadata & phone
    const backfillSql = `
      UPDATE public.profiles p
      SET phone = COALESCE(
        u.raw_user_meta_data->>'phone',
        u.phone,
        CASE WHEN u.email LIKE '%@phone.agrirent.app' THEN split_part(u.email, '@', 1) ELSE NULL END
      )
      FROM auth.users u
      WHERE p.id = u.id
        AND (p.phone IS NULL OR p.phone = '' OR p.phone = 'N/A');
    `
    const backfillResult = await client.query(backfillSql)
    console.log(`Backfilled ${backfillResult.rowCount} profiles with phone numbers.`)

    // 3. Inspect the updated profiles
    const checkSql = `
      SELECT p.id, p.full_name, p.email, p.phone, p.role 
      FROM public.profiles p
      ORDER BY p.created_at DESC
      LIMIT 10;
    `
    const checkResult = await client.query(checkSql)
    console.log('\n--- Updated Profiles Sample ---')
    console.table(checkResult.rows)

  } catch (err) {
    console.error('Error executing query:', err)
  } finally {
    await client.end()
  }
}

run().catch(console.error)
