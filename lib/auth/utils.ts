import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  username: string
  name: string | null
  role: 'admin' | 'user'
  active: boolean
  created_at: string
  updated_at: string
}

export interface SessionData {
  userId: string
  username: string
  name: string | null
  role: 'admin' | 'user'
}

const SESSION_COOKIE = 'paz_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify a password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create a session
export async function createSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  
  const sessionData: SessionData = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  }
  
  // Encode session data as base64 JSON
  const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: false, // Allow both HTTP and HTTPS for v0 preview
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

// Get current session
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    return sessionData as SessionData
  } catch {
    return null
  }
}

// Destroy session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// Get user by username
export async function getUserByUsername(username: string): Promise<(User & { password_hash: string }) | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error || !data) return null
  return data
}

// Get all users
export async function getUsers(): Promise<User[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, username, name, role, active, created_at, updated_at')
    .order('username', { ascending: true })
  
  if (error) throw error
  return data || []
}

// Create user
export async function createUser(username: string, password: string, name: string | null, role: 'admin' | 'user'): Promise<User> {
  const supabase = await createClient()
  const passwordHash = await hashPassword(password)
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      password_hash: passwordHash,
      name,
      role,
      active: true,
    })
    .select('id, username, name, role, active, created_at, updated_at')
    .single()
  
  if (error) throw error
  return data
}

// Update user
export async function updateUser(id: string, updates: { name?: string; role?: 'admin' | 'user'; active?: boolean }): Promise<User> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, username, name, role, active, created_at, updated_at')
    .single()
  
  if (error) throw error
  return data
}

// Update user password
export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const supabase = await createClient()
  const passwordHash = await hashPassword(newPassword)
  
  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', id)
  
  if (error) throw error
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
