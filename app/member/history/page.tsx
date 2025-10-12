'use client'

import { useState, useEffect } from 'react'
import { Loader2, History as HistoryIcon, Calendar, BookCheck } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getUserTransactions } from '@/lib/actions/transactions'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/helpers'
import type { Transaction } from '@/types'

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    const result = await getUserTransactions('current-user-id')
    setTransactions(result)
    setLoading(false)
  }

  const returnedBooks = transactions.filter(t => t.status === 'returned')
  const totalFines = transactions.reduce((sum, t) => sum + t.fine_amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-8 w-8" />
          Borrowing History
        </h1>
        <p className="text-muted-foreground">Complete record of your book transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Books Borrowed</p>
          <p className="text-3xl font-bold">{transactions.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Returned</p>
          <p className="text-3xl font-bold text-green-600">{returnedBooks.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Fines Paid</p>
          <p className="text-3xl font-bold">{formatCurrency(totalFines)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <BookCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No transaction history</h3>
          <p className="text-sm text-muted-foreground">
            Your borrowing history will appear here once you borrow books
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium line-clamp-1">{transaction.book?.title}</p>
                      <p className="text-sm text-muted-foreground">{transaction.book?.author}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(transaction.issue_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(transaction.due_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.return_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(transaction.return_date)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not returned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(transaction.status)} className="capitalize">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.fine_amount > 0 ? (
                      <div className="text-sm">
                        <p className="font-medium">{formatCurrency(transaction.fine_amount)}</p>
                        <Badge
                          variant={transaction.fine_paid ? 'secondary' : 'destructive'}
                          className="text-xs mt-1"
                        >
                          {transaction.fine_paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No fine</span>
                    )}
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
