'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Calendar, User, Book as BookIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getOverdueTransactions } from '@/lib/actions/transactions'
import { formatDate, formatCurrency, calculateFine } from '@/lib/helpers'
import type { Transaction } from '@/types'

export default function OverdueBooksPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOverdueTransactions()
  }, [])

  const loadOverdueTransactions = async () => {
    setLoading(true)
    const result = await getOverdueTransactions()
    setTransactions(result)
    setLoading(false)
  }

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalFines = transactions.reduce((sum, t) => sum + calculateFine(t.due_date), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            Overdue Books
          </h1>
          <p className="text-muted-foreground">Track and manage overdue book returns</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Overdue</p>
          <p className="text-3xl font-bold text-destructive">{transactions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Books not returned on time</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Fines</p>
          <p className="text-3xl font-bold text-destructive">{formatCurrency(totalFines)}</p>
          <p className="text-xs text-muted-foreground mt-1">Accumulated fine amount</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Average Days Overdue</p>
          <p className="text-3xl font-bold">
            {transactions.length > 0
              ? Math.round(
                  transactions.reduce((sum, t) => sum + getDaysOverdue(t.due_date), 0) /
                    transactions.length
                )
              : 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Days past due date</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Overdue Books</h3>
          <p className="text-sm text-muted-foreground">
            All books are returned on time or still within due date
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Fine Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const daysOverdue = getDaysOverdue(transaction.due_date)
                const fineAmount = calculateFine(transaction.due_date)

                return (
                  <TableRow key={transaction.id} className="border-l-4 border-l-destructive">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium line-clamp-1">
                            {transaction.book?.title || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.book?.author}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {transaction.book?.isbn}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{transaction.user?.full_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.user?.member_id}
                          </p>
                          {transaction.user?.email && (
                            <p className="text-xs text-muted-foreground">
                              {transaction.user.email}
                            </p>
                          )}
                          {transaction.user?.phone && (
                            <p className="text-xs text-muted-foreground">
                              {transaction.user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(transaction.issue_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-destructive font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(transaction.due_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="font-bold">
                        {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-bold text-destructive text-lg">
                          {formatCurrency(fineAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹10/day × {daysOverdue}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="capitalize">
                        Overdue
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Action Reminder */}
      {transactions.length > 0 && (
        <div className="rounded-lg border bg-destructive/10 border-destructive p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">Action Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Contact members with overdue books and request immediate returns. Fines will
                continue to accumulate at ₹10 per day until books are returned.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
