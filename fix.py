import re

with open('supabase/migrations/001_initial_schema.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# 1. Enums (Using DO $$ BEGIN ... END $$ block to catch exceptions)
# Instead of IF NOT EXISTS (which pg doesn't support for CREATE TYPE ENUM), we use exception handling
enums = re.findall(r'CREATE TYPE (\w+) AS ENUM \((.*?)\);', sql)
enum_block = 'DO $$\nBEGIN\n'
for name, vals in enums:
    enum_block += f"""  BEGIN
    CREATE TYPE {name} AS ENUM ({vals});
  EXCEPTION WHEN duplicate_object THEN null;
  END;\n"""
enum_block += 'END $$;'

sql = re.sub(r'(CREATE TYPE \w+ AS ENUM \(.*?\);(\n)?)+', enum_block + '\n\n', sql)

# 2. CREATE TABLE
sql = re.sub(r'CREATE TABLE (\w+)', r'CREATE TABLE IF NOT EXISTS \1', sql)

# 3. CREATE INDEX
sql = re.sub(r'CREATE INDEX (idx_\w+)', r'CREATE INDEX IF NOT EXISTS \1', sql)

# 4. CREATE TRIGGER
def trigger_repl(m):
    trig_name = m.group(1)
    table_name = m.group(2)
    return f'DROP TRIGGER IF EXISTS {trig_name} ON {table_name};\nCREATE TRIGGER {trig_name} BEFORE UPDATE ON {table_name}'

sql = re.sub(r'CREATE TRIGGER (\w+) BEFORE UPDATE ON (\w+)', trigger_repl, sql)

# 5. CREATE POLICY
def policy_repl(m):
    pol_name = m.group(1)
    table_name = m.group(2)
    # Rename 'Public Access' policy for storage objects to avoid duplicate names in same table
    if pol_name == '\"Public Access\"' and table_name == 'storage.objects':
        if 'equipment-images' in m.group(0):
            pol_name = '\"Public Access for equipment-images\"'
        elif 'profile-images' in m.group(0):
            pol_name = '\"Public Access for profile-images\"'
    
    # recreate the policy definition with potentially modified name
    pol_def = m.group(0)
    if pol_name != m.group(1):
        pol_def = pol_def.replace(m.group(1), pol_name, 1)
        
    return f'DROP POLICY IF EXISTS {pol_name} ON {table_name};\n{pol_def}'

sql = re.sub(r'CREATE POLICY (\"\w.*?\"|\w+) ON ([\w\.]+)', policy_repl, sql)

with open('supabase/migrations/001_initial_schema.sql', 'w', encoding='utf-8') as f:
    f.write(sql)
print('Done!')
