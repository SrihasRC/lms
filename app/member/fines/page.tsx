'use client'

import { useState, useEffect } from 'react'
import { Loader2, DollarSign, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUserFines, payFine, syncOverdueFines } from '@/lib/actions/fines'
import { formatDate, formatCurrency } from '@/lib/helpers'
import { toast } from 'sonner'
import type { Fine } from '@/types'

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)

  useEffect(() => {
    loadFines()
  }, [])

  const loadFines = async () => {
    setLoading(true)
    // Sync overdue fines first
    await syncOverdueFines()
    const result = await getUserFines()
    setFines(result)
    setLoading(false)
  }

  const handlePayFine = async (id: string) => {
    setPaying(id)
    try {
      const result = await payFine(id, 'cash')
      if (result.success) {
        toast.success(result.message)
        loadFines()
      } else {
        toast.error(result.error || 'Failed to pay fine')
      }
    } catch (error) {
      toast.error('Error paying fine')
      console.error(error)
    } finally {
      setPaying(null)
    }
  }

  const unpaidFines = fines.filter(f => !f.paid)
  const paidFines = fines.filter(f => f.paid)
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0)
  const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            My Fines
          </h1>
          <p className="text-muted-foreground">Track and pay your library fines</p>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unpaid Fines</p>
          <p className="text-3xl font-bold text-destructive">
            {formatCurrency(totalUnpaid)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {unpaidFines.length} {unpaidFines.length === 1 ? 'fine' : 'fines'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Paid Fines</p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(totalPaid)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {paidFines.length} {paidFines.length === 1 ? 'fine' : 'fines'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Fines</p>
          <p className="text-3xl font-bold">{formatCurrency(totalUnpaid + totalPaid)}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : fines.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No fines!</h3>
          <p className="text-sm text-muted-foreground">
            You have no fines. Keep returning books on time!
          </p>
        </div>
      ) : (
        <>
          {/* Unpaid Fines */}
          {unpaidFines.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Unpaid Fines ({unpaidFines.length})
                </h2>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(totalUnpaid)}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-destructive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Fine Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidFines.map((fine) => (
                      <TableRow key={fine.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">
                              {fine.transaction?.book?.title || 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {fine.transaction?.book?.author}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{fine.reason}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(fine.created_at)}</span>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-destructive text-lg">
                            {formatCurrency(fine.amount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handlePayFine(fine.id)}
                            disabled={paying === fine.id}
                          >
                            {paying === fine.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-3 w-3 mr-1" />
                                Pay Fine
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Payment Info */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payment Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please pay your fines at the library counter. You can also pay online through the
                  library portal. Fines must be cleared before borrowing more books.
                </p>
              </div>
            </div>
          )}

          {/* Paid Fines History */}
          {paidFines.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Payment History ({paidFines.length})
              </h2>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Fine Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidFines.map((fine) => (
                      <TableRow key={fine.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">
                              {fine.transaction?.book?.title || 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {fine.transaction?.book?.author}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{fine.reason}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(fine.created_at)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {fine.paid_date ? formatDate(fine.paid_date) : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{formatCurrency(fine.amount)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Paid</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
