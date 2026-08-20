import pg from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { Client } = pg

// Get password from args or environment variable DB_PASSWORD
const password = process.argv[2] || process.env.DB_PASSWORD

if (!password) {
  console.error('Error: Please provide the database password as a command line argument or set DB_PASSWORD environment variable.')
  console.error('Usage: node scripts/apply-fix.mjs <database_password>')
  process.exit(1)
}

const client = new Client({
  host: 'db.zgykctyindlmnfyqrood.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: password,
  ssl: {
    rejectUnauthorized: false
  }
})

async function run() {
  try {
    console.log('Connecting to Supabase Postgres database...')
    await client.connect()
    console.log('Connected successfully.')

    const sqlPath = path.resolve('fix_rls_recursion.sql')
    console.log(`Reading SQL file from: ${sqlPath}`)
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('Executing SQL statements...')
    await client.query(sql)
    console.log('SQL statements executed successfully! RLS recursion fix applied.')
  } catch (err) {
    console.error('Error executing SQL:', err)
  } finally {
    await client.end()
  }
}

run()
