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

    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
    `)
    console.log('Columns in profiles table:')
    res.rows.forEach(r => {
      console.log(`- ${r.column_name}: ${r.data_type}`)
    })

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.end()
  }
}

run().catch(console.error)
