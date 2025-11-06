'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookOpen, AlertCircle, Calendar, ArrowLeftRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getActiveTransactions, memberReturnBook } from '@/lib/actions/transactions'
import { formatDate, formatCurrency, isOverdue, calculateFine } from '@/lib/helpers'
import { toast } from 'sonner'
import type { Transaction } from '@/types'

export default function MyBooksPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [returning, setReturning] = useState<string | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    const result = await getActiveTransactions()
    setTransactions(result)
    setLoading(false)
  }

  const handleReturn = async (transactionId: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to return "${bookTitle}"?`)) {
      return
    }

    setReturning(transactionId)
    try {
      const result = await memberReturnBook(transactionId)
      if (result.success) {
        toast.success(result.message)
        loadTransactions() // Reload the list
      } else {
        toast.error(result.error || 'Failed to return book')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setReturning(null)
    }
  }

  const overdueBooks = transactions.filter(t => isOverdue(t.due_date))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Books</h1>
        <p className="text-muted-foreground">
          Currently borrowed: {transactions.length} {transactions.length === 1 ? 'book' : 'books'}
        </p>
      </div>

      {/* Overdue Warning */}
      {overdueBooks.length > 0 && (
        <div className="rounded-lg border bg-destructive/10 border-destructive p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">
                {overdueBooks.length} {overdueBooks.length === 1 ? 'book is' : 'books are'} overdue
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please return these books as soon as possible to avoid additional fines. Fines accumulate at ₹10 per day.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No books borrowed</h3>
          <p className="text-sm text-muted-foreground">
            Visit the Browse Books page to find something interesting to read
          </p>
          <a
            href="/member/books"
            className="inline-block mt-4 text-sm text-primary hover:underline"
          >
            Browse Books →
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {transactions.map((transaction) => {
            const overdue = isOverdue(transaction.due_date)
            const daysRemaining = Math.ceil(
              (new Date(transaction.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            const fineAmount = overdue ? calculateFine(transaction.due_date) : 0

            return (
              <div
                key={transaction.id}
                className={`rounded-lg border p-6 ${overdue ? 'border-destructive bg-destructive/5' : 'bg-card'}`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Book Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{transaction.book?.title}</h3>
                      <p className="text-sm text-muted-foreground">by {transaction.book?.author}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{transaction.book?.genre}</Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {transaction.book?.isbn}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Issue Date</span>
                        </div>
                        <p className="font-medium">{formatDate(transaction.issue_date)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due Date</span>
                        </div>
                        <p className={`font-medium ${overdue ? 'text-destructive' : ''}`}>
                          {formatDate(transaction.due_date)}
                        </p>
                      </div>
                    </div>

                    {transaction.book?.location && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Location: </span>
                        <span className="font-medium">{transaction.book.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <Badge variant={overdue ? 'destructive' : 'default'}>
                      {overdue ? 'Overdue' : 'On Time'}
                    </Badge>
                    {overdue ? (
                      <div className="text-right">
                        <p className="text-destructive font-bold text-lg">
                          {Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? 'day' : 'days'} overdue
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Fine: {formatCurrency(fineAmount)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="font-medium text-lg">
                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                        </p>
                        <p className="text-sm text-muted-foreground">Due soon</p>
                      </div>
                    )}
                    
                    {/* Return Button */}
                    <Button
                      size="sm"
                      variant={overdue ? 'destructive' : 'default'}
                      onClick={() => handleReturn(transaction.id, transaction.book?.title || 'Book')}
                      disabled={returning === transaction.id}
                      className="mt-2"
                    >
                      {returning === transaction.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Returning...
                        </>
                      ) : (
                        <>
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Return Book
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {overdue && (
                  <div className="mt-4 pt-4 border-t text-sm text-destructive">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Please return this book to avoid additional fines. Current fine: {formatCurrency(fineAmount)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Borrowed</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">On Time</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => !isOverdue(t.due_date)).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive">{overdueBooks.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
