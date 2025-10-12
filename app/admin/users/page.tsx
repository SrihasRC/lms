'use client'

import { useState, useEffect } from 'react'
import { Loader2, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/search-bar'
import { getAllUsers, updateUserRole, searchUsers } from '@/lib/actions/users'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import type { Profile, UserRole } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllUsers(filterRole === 'all' ? undefined : filterRole)
    setUsers(result)
    setLoading(false)
  }

  const handleSearch = async (query: string) => {
    if (!query) {
      loadUsers()
      return
    }
    setLoading(true)
    const result = await searchUsers(query)
    setUsers(result)
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const result = await updateUserRole(userId, newRole)
    if (result.success) {
      toast.success(result.message)
      loadUsers()
    } else {
      toast.error(result.error)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'librarian':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">Manage library members and staff</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by name, email, or member ID..."
          />
        </div>
        <Select value={filterRole} onValueChange={(value) => setFilterRole(value as UserRole | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="librarian">Librarian</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">
                    {user.member_id || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {user.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{user.address}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                    >
                      <SelectTrigger className="w-32">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="librarian">Librarian</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total Users: <span className="font-medium text-foreground">{users.length}</span>
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Admins:{' '}
              <span className="font-medium text-foreground">
                {users.filter((u) => u.role === 'admin').length}
              </span>
            </span>
            <span className="text-muted-foreground">
              Librarians:{' '}
              <span className="font-medium text-foreground">
                {users.filter((u) => u.role === 'librarian').length}
              </span>
            </span>
            <span className="text-muted-foreground">
              Members:{' '}
              <span className="font-medium text-foreground">
                {users.filter((u) => u.role === 'member').length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
