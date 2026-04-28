'use server'

import { getUserByUsername, verifyPassword, createSession, destroySession } from '@/lib/auth/utils'

export async function login(username: string, password: string): Promise<{ error?: string }> {
  try {
    // Find user by username
    const user = await getUserByUsername(username)
    
    console.log('[v0] User found:', user ? { id: user.id, username: user.username, active: user.active, hasHash: !!user.password_hash, hashLength: user.password_hash?.length } : null)
    
    if (!user) {
      return { error: 'Invalid username or password' }
    }
    
    if (!user.active) {
      return { error: 'Account is disabled' }
    }
    
    // Verify password
    console.log('[v0] Verifying password against hash:', user.password_hash?.substring(0, 20) + '...')
    const isValid = await verifyPassword(password, user.password_hash)
    console.log('[v0] Password valid:', isValid)
    
    if (!isValid) {
      return { error: 'Invalid username or password' }
    }
    
    // Create session
    await createSession(user)
    
    return {}
  } catch (error) {
    console.error('[v0] Login error:', error)
    return { error: 'An error occurred during login' }
  }
}

export async function logout(): Promise<void> {
  await destroySession()
}
