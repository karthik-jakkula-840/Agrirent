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

    // 1. Get all functions named handle_new_user and their namespace
    console.log('\n--- 1. Listing all handle_new_user functions ---')
    const res = await client.query(`
      SELECT proname, nspname, prosrc 
      FROM pg_proc 
      JOIN pg_namespace ON pg_namespace.oid = pronamespace 
      WHERE proname = 'handle_new_user'
    `)
    res.rows.forEach(r => {
      console.log(`Schema: ${r.nspname} | Name: ${r.proname}`)
      console.log('Source:\n', r.prosrc)
      console.log('-------------------------------------------')
    })

    // 2. Get triggers on auth.users
    console.log('\n--- 2. Listing triggers on auth.users ---')
    const triggersRes = await client.query(`
      SELECT tgname, tgrelid::regclass as relname, tgfoid::regproc as funcname
      FROM pg_trigger
      WHERE tgrelid = 'auth.users'::regclass
    `)
    triggersRes.rows.forEach(r => {
      console.log(`Trigger: ${r.tgname} | Table: ${r.relname} | Function: ${r.funcname}`)
    })

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.end()
  }
}

run().catch(console.error)
