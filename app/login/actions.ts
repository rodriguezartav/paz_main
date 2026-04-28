'use server'

import { getUserByUsername, verifyPassword, createSession, destroySession } from '@/lib/auth/utils'
import { redirect } from 'next/navigation'

export async function login(username: string, password: string, redirectTo: string = '/dashboard'): Promise<{ error?: string }> {
  let shouldRedirect = false
  
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
    shouldRedirect = true
    
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'An error occurred during login' }
  }
  
  // Redirect must be outside try/catch as it throws
  if (shouldRedirect) {
    redirect(redirectTo)
  }
  
  return {}
}

export async function logout(): Promise<void> {
  await destroySession()
}
