'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Key, Shield, User as UserIcon, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/auth/utils'
import {
  createUserAction,
  updateUserAction,
  updateUserPasswordAction,
  deleteUserAction,
} from './actions'

interface UsersPageClientProps {
  users: User[]
}

export function UsersPageClient({ users: initialUsers }: UsersPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState(initialUsers)
  
  // Create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user')
  
  // Edit dialog state
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user')
  const [editActive, setEditActive] = useState(true)
  
  // Password dialog state
  const [passwordUser, setPasswordUser] = useState<User | null>(null)
  const [newUserPassword, setNewUserPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username and password are required')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setError(null)
    startTransition(async () => {
      const result = await createUserAction(newUsername.trim(), newPassword, newName.trim() || null, newRole)
      
      if (result.error) {
        setError(result.error)
      } else if (result.user) {
        setUsers([...users, result.user])
        setShowCreateDialog(false)
        setNewUsername('')
        setNewPassword('')
        setNewName('')
        setNewRole('user')
      }
    })
  }

  const handleEdit = () => {
    if (!editingUser) return
    
    startTransition(async () => {
      const result = await updateUserAction(editingUser.id, {
        name: editName.trim() || null,
        role: editRole,
        active: editActive,
      })
      
      if (result.error) {
        setError(result.error)
      } else if (result.user) {
        setUsers(users.map(u => u.id === result.user!.id ? result.user! : u))
        setEditingUser(null)
        setError(null)
      }
    })
  }

  const handlePasswordChange = () => {
    if (!passwordUser) return
    
    if (newUserPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    if (newUserPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setError(null)
    startTransition(async () => {
      const result = await updateUserPasswordAction(passwordUser.id, newUserPassword)
      
      if (result.error) {
        setError(result.error)
      } else {
        setPasswordUser(null)
        setNewUserPassword('')
        setConfirmPassword('')
      }
    })
  }

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      const result = await deleteUserAction(userId)
      
      if (!result.error) {
        setUsers(users.filter(u => u.id !== userId))
      }
    })
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setEditName(user.name || '')
    setEditRole(user.role)
    setEditActive(user.active)
    setError(null)
  }

  const openPasswordDialog = (user: User) => {
    setPasswordUser(user)
    setNewUserPassword('')
    setConfirmPassword('')
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with username and password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name (optional)</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as 'admin' | 'user')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isPending}>
                {isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-[1fr,1fr,100px,100px,150px] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Username</div>
          <div>Display Name</div>
          <div>Role</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        
        {users.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No users yet. Create your first user to get started.
          </div>
        ) : (
          <div className="divide-y">
            {users.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "grid grid-cols-[1fr,1fr,100px,100px,150px] gap-4 px-4 py-3 items-center",
                  !user.active && "bg-muted/30"
                )}
              >
                <div className="font-medium">{user.username}</div>
                <div className="text-muted-foreground">{user.name || '-'}</div>
                <div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </div>
                <div>
                  <Badge variant={user.active ? 'outline' : 'destructive'}>
                    {user.active ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <X className="mr-1 h-3 w-3" />
                        Disabled
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openPasswordDialog(user)}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {user.username}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details for {editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter display name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as 'admin' | 'user')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-active">Status</Label>
              <Select value={editActive ? 'active' : 'disabled'} onValueChange={(v) => setEditActive(v === 'active')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={!!passwordUser} onOpenChange={() => setPasswordUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordUser(null)}>Cancel</Button>
            <Button onClick={handlePasswordChange} disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
