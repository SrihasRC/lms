'use client'

import { useState } from 'react'
import { BookCheck, Search, Loader2, AlertCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getActiveTransactions } from '@/lib/actions/transactions'
import { returnBook } from '@/lib/actions/transactions'
import { formatDate, formatCurrency, calculateFine } from '@/lib/helpers'
import { toast } from 'sonner'
import type { Transaction } from '@/types'

export default function ReturnBookPage() {
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [returning, setReturning] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!search.trim()) {
      toast.error('Please enter member ID, email, or book title')
      return
    }

    setLoading(true)
    try {
      const allTransactions = await getActiveTransactions()
      const filtered = allTransactions.filter(t => 
        t.user?.member_id?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.book?.isbn?.toLowerCase().includes(search.toLowerCase())
      )
      setTransactions(filtered)
      if (filtered.length === 0) {
        toast.info('No active transactions found')
      }
    } catch (error) {
      toast.error('Error searching transactions')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (transactionId: string) => {
    setReturning(transactionId)
    try {
      const result = await returnBook(transactionId, 'librarian')
      if (result.success) {
        toast.success(result.message)
        // Remove from list
        setTransactions(prev => prev.filter(t => t.id !== transactionId))
      } else {
        toast.error(result.error || 'Failed to return book')
      }
    } catch (error) {
      toast.error('Error returning book')
      console.error(error)
    } finally {
      setReturning(null)
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Return Book</h1>
        <p className="text-muted-foreground">Process book returns and handle fines</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Active Loans
          </CardTitle>
          <CardDescription>Search by member ID, email, or book title</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter member ID, email, or book title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {transactions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Loans ({transactions.length})</h2>
          <div className="grid gap-4">
            {transactions.map((transaction) => {
              const overdue = isOverdue(transaction.due_date)
              const fineAmount = overdue ? calculateFine(transaction.due_date) : 0

              return (
                <Card key={transaction.id} className={overdue ? 'border-destructive' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Book Info */}
                        <div>
                          <h3 className="font-semibold text-lg">{transaction.book?.title}</h3>
                          <p className="text-sm text-muted-foreground">by {transaction.book?.author}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            ISBN: {transaction.book?.isbn}
                          </p>
                        </div>

                        {/* Member Info */}
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Member: </span>
                            <span className="font-medium">{transaction.user?.full_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ID: </span>
                            <span className="font-mono">{transaction.user?.member_id}</span>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Issued: </span>
                            <span>{formatDate(transaction.issue_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Due: </span>
                            <span className={overdue ? 'text-destructive font-medium' : ''}>
                              {formatDate(transaction.due_date)}
                            </span>
                          </div>
                        </div>

                        {/* Fine Warning */}
                        {overdue && (
                          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            <div>
                              <p className="font-medium">Overdue - Fine: {formatCurrency(fineAmount)}</p>
                              <p className="text-xs">
                                {Math.floor((Date.now() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={overdue ? 'destructive' : 'default'}>
                          {overdue ? 'Overdue' : 'On Time'}
                        </Badge>
                        <Button
                          onClick={() => handleReturn(transaction.id)}
                          disabled={returning === transaction.id}
                          variant={overdue ? 'destructive' : 'default'}
                        >
                          {returning === transaction.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <BookCheck className="h-4 w-4 mr-2" />
                              Return Book
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {transactions.length === 0 && search && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Loans Found</h3>
            <p className="text-sm text-muted-foreground">
              Try searching with a different member ID, email, or book title
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
