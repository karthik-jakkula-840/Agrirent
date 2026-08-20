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
      INSERT INTO categories (id, name, description, slug, is_active) VALUES
      (gen_random_uuid(), 'Tractors', 'Various sizes of tractors for farming and agriculture', 'tractors', true),
      (gen_random_uuid(), 'Harvesters', 'Combine harvesters and reapers', 'harvesters', true),
      (gen_random_uuid(), 'Tillage Equipment', 'Plows, harrows, and tillers', 'tillage-equipment', true),
      (gen_random_uuid(), 'Seeding & Planting', 'Seed drills and planters', 'seeding-planting', true),
      (gen_random_uuid(), 'Irrigation', 'Pumps, pipes, and sprinkler systems', 'irrigation', true)
      ON CONFLICT (slug) DO NOTHING;
    `

    const res = await client.query(query)
    console.log('Categories successfully seeded!')

  } catch (err) {
    console.error('Error seeding categories:', err)
  } finally {
    await client.end()
  }
}

run().catch(console.error)
