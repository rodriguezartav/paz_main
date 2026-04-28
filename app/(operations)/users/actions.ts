'use server'

import { revalidatePath } from 'next/cache'
import { createUser, updateUser, updateUserPassword, deleteUser, type User } from '@/lib/auth/utils'

export async function createUserAction(
  username: string,
  password: string,
  name: string | null,
  role: 'admin' | 'user'
): Promise<{ user?: User; error?: string }> {
  try {
    const user = await createUser(username, password, name, role)
    revalidatePath('/users')
    return { user }
  } catch (error: any) {
    if (error?.code === '23505') {
      return { error: 'Username already exists' }
    }
    console.error('Create user error:', error)
    return { error: 'Failed to create user' }
  }
}

export async function updateUserAction(
  id: string,
  updates: { name?: string | null; role?: 'admin' | 'user'; active?: boolean }
): Promise<{ user?: User; error?: string }> {
  try {
    const user = await updateUser(id, updates)
    revalidatePath('/users')
    return { user }
  } catch (error) {
    console.error('Update user error:', error)
    return { error: 'Failed to update user' }
  }
}

export async function updateUserPasswordAction(
  id: string,
  newPassword: string
): Promise<{ error?: string }> {
  try {
    await updateUserPassword(id, newPassword)
    return {}
  } catch (error) {
    console.error('Update password error:', error)
    return { error: 'Failed to update password' }
  }
}

export async function deleteUserAction(id: string): Promise<{ error?: string }> {
  try {
    await deleteUser(id)
    revalidatePath('/users')
    return {}
  } catch (error) {
    console.error('Delete user error:', error)
    return { error: 'Failed to delete user' }
  }
}
