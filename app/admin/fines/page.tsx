'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar, User, IndianRupee, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAllFines, syncOverdueFines } from '@/lib/actions/fines'
import { formatDate, formatCurrency } from '@/lib/helpers'
import type { Fine } from '@/types'

export default function AdminFinesPage() {
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFines()
  }, [])

  const loadFines = async () => {
    setLoading(true)
    // Sync overdue fines first
    await syncOverdueFines()
    const result = await getAllFines()
    setFines(result)
    setLoading(false)
  }

  const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0)
  const paidAmount = fines.filter((f) => f.paid).reduce((sum, fine) => sum + fine.amount, 0)
  const unpaidAmount = fines.filter((f) => !f.paid).reduce((sum, fine) => sum + fine.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fines</h1>
          <p className="text-muted-foreground">View and manage all fines</p>
        </div>
        <Button onClick={loadFines} variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <IndianRupee className="h-4 w-4" />
            <p className="text-sm">Total Fines</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <IndianRupee className="h-4 w-4" />
            <p className="text-sm">Collected</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <IndianRupee className="h-4 w-4" />
            <p className="text-sm">Outstanding</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(unpaidAmount)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : fines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No fines found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines.map((fine) => (
                <TableRow key={fine.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{fine.user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {fine.user?.member_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2">{fine.reason}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{formatCurrency(fine.amount)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(fine.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {fine.paid_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(fine.paid_date)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not paid</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {fine.payment_method ? (
                      <Badge variant="outline" className="capitalize">
                        {fine.payment_method}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={fine.paid ? 'secondary' : 'destructive'}>
                      {fine.paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
