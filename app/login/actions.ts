'use server'

import { getUserByUsername, verifyPassword, createSession, destroySession } from '@/lib/auth/utils'

export async function login(username: string, password: string): Promise<{ error?: string }> {
  try {
    // Find user by username
    const user = await getUserByUsername(username)
    
    if (!user) {
      return { error: 'Invalid username or password' }
    }
    
    if (!user.active) {
      return { error: 'Account is disabled' }
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    
    if (!isValid) {
      return { error: 'Invalid username or password' }
    }
    
    // Create session
    await createSession(user)
    
    return {}
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'An error occurred during login' }
  }
}

export async function logout(): Promise<void> {
  await destroySession()
}
