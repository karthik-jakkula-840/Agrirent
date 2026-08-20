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

    const query = `
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
    `

    await client.query(query)
    console.log('Trigger function handle_new_user successfully updated with SET search_path = public.')

  } catch (err) {
    console.error('Error executing query:', err)
  } finally {
    await client.end()
  }
}

run().catch(console.error)
