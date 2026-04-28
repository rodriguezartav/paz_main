'use server'

import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function setupDefaultAdmin(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    
    // Check if admin user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single()
    
    if (existing) {
      return { 
        success: true, 
        message: 'Admin user already exists. You can log in now.' 
      }
    }
    
    // Hash the default password
    const passwordHash = await bcrypt.hash('admin123', 10)
    
    // Insert admin user
    const { error } = await supabase
      .from('users')
      .insert({
        username: 'admin',
        password_hash: passwordHash,
        name: 'Administrator',
        role: 'admin',
        active: true
      })
    
    if (error) {
      console.error('Error creating admin:', error)
      return { success: false, message: 'Failed to create admin user: ' + error.message }
    }
    
    return { 
      success: true, 
      message: 'Admin user created successfully!' 
    }
  } catch (error) {
    console.error('Setup error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
