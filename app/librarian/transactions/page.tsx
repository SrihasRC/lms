'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar, User, Book as BookIcon, Filter } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getAllTransactions } from '@/lib/actions/transactions'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/helpers'
import type { Transaction } from '@/types'

export default function LibrarianTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter(t => t.status === statusFilter))
    }
  }, [statusFilter, transactions])

  const loadTransactions = async () => {
    setLoading(true)
    const result = await getAllTransactions()
    setTransactions(result)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage book transactions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
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
                          <Badge variant={transaction.fine_paid ? 'secondary' : 'destructive'} className="text-xs">
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

          {/* Summary */}
          <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {transactions.filter((t) => t.status === 'issued').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">
                  {transactions.filter((t) => t.status === 'overdue').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Returned</p>
                <p className="text-2xl font-bold">
                  {transactions.filter((t) => t.status === 'returned').length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
