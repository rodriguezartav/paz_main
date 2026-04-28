import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createDefaultAdmin() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Hash the default password
  const password = 'admin123'
  const passwordHash = await bcrypt.hash(password, 10)
  
  // Insert admin user
  const { data, error } = await supabase
    .from('users')
    .upsert({
      username: 'admin',
      password_hash: passwordHash,
      name: 'Administrator',
      role: 'admin',
      active: true
    }, {
      onConflict: 'username'
    })
    .select()
  
  if (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
  
  console.log('Default admin user created successfully!')
  console.log('Username: admin')
  console.log('Password: admin123')
  console.log('Please change the password after first login!')
}

createDefaultAdmin()
