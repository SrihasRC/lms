import { Book, BookOpen, AlertCircle, DollarSign, BookMarked, Clock } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/stats'
import { getUserTransactions, getActiveTransactions } from '@/lib/actions/transactions'
import { getUserReservations } from '@/lib/actions/reservations'
import { getUserFines } from '@/lib/actions/fines'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/stat-card'
import { formatDate, formatCurrency, isOverdue } from '@/lib/helpers'

export default async function MemberDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [stats, activeTransactions, allTransactions, reservations, fines] = await Promise.all([
    getDashboardStats(),
    getActiveTransactions(user.id),
    getUserTransactions(user.id),
    getUserReservations(user.id),
    getUserFines(user.id),
  ])

  const overdueBooks = activeTransactions.filter(t => isOverdue(t.due_date))
  const unpaidFines = fines.filter(f => !f.paid)
  const totalUnpaidFines = unpaidFines.reduce((sum, f) => sum + f.amount, 0)
  const pendingReservations = reservations.filter(r => r.status === 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your library overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Currently Borrowed"
          value={activeTransactions.length}
          description="Books you have checked out"
          icon={BookOpen}
        />
        <StatCard
          title="Overdue Books"
          value={overdueBooks.length}
          description={overdueBooks.length > 0 ? 'Please return soon' : 'All on time'}
          icon={AlertCircle}
        />
        <StatCard
          title="Unpaid Fines"
          value={formatCurrency(totalUnpaidFines)}
          description={unpaidFines.length > 0 ? `${unpaidFines.length} fine(s)` : 'All clear'}
          icon={DollarSign}
        />
        <StatCard
          title="Active Reservations"
          value={pendingReservations.length}
          description="Books reserved for you"
          icon={BookMarked}
        />
        <StatCard
          title="Total Borrowed"
          value={allTransactions.length}
          description="All time"
          icon={Book}
        />
        <StatCard
          title="Available Books"
          value={stats.availableBooks}
          description={`of ${stats.totalBooks} in library`}
          icon={Book}
        />
      </div>

      {/* Currently Borrowed Books */}
      {activeTransactions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Currently Borrowed ({activeTransactions.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeTransactions.slice(0, 4).map((transaction) => {
              const overdue = isOverdue(transaction.due_date)
              const daysRemaining = Math.ceil(
                (new Date(transaction.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )

              return (
                <div
                  key={transaction.id}
                  className={`rounded-lg border p-4 ${overdue ? 'border-destructive bg-destructive/5' : 'bg-card'}`}
                >
                  <h3 className="font-semibold line-clamp-1">{transaction.book?.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    by {transaction.book?.author}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className={overdue ? 'text-destructive font-medium' : ''}>
                        {formatDate(transaction.due_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={overdue ? 'text-destructive font-medium' : 'text-green-600'}>
                        {overdue
                          ? `Overdue by ${Math.abs(daysRemaining)} days`
                          : `${daysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {activeTransactions.length > 4 && (
            <a
              href="/member/my-books"
              className="text-sm text-primary hover:underline inline-block"
            >
              View all borrowed books →
            </a>
          )}
        </div>
      )}

      {/* Overdue Warning */}
      {overdueBooks.length > 0 && (
        <div className="rounded-lg border bg-destructive/10 border-destructive p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-destructive">You have overdue books!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please return {overdueBooks.length} overdue {overdueBooks.length === 1 ? 'book' : 'books'} as soon as
                possible to avoid additional fines. Current fines accumulate at ₹10 per day.
              </p>
              <a
                href="/member/my-books"
                className="text-sm text-destructive hover:underline inline-block mt-2 font-medium"
              >
                View overdue books →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Book className="h-5 w-5" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            <a
              href="/member/books"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <h3 className="font-medium">Browse Books</h3>
              <p className="text-sm text-muted-foreground">
                Explore {stats.availableBooks} available books
              </p>
            </a>
            <a
              href="/member/reservations"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <h3 className="font-medium">My Reservations</h3>
              <p className="text-sm text-muted-foreground">
                {pendingReservations.length} pending {pendingReservations.length === 1 ? 'reservation' : 'reservations'}
              </p>
            </a>
            {unpaidFines.length > 0 && (
              <a
                href="/member/fines"
                className="block p-3 rounded-lg border border-destructive hover:bg-destructive/5 transition-colors"
              >
                <h3 className="font-medium text-destructive">Pay Fines</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(totalUnpaidFines)} pending
                </p>
              </a>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Library Info
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Books</span>
              <span className="font-medium">{stats.totalBooks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Now</span>
              <span className="font-medium text-green-600">{stats.availableBooks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Members</span>
              <span className="font-medium">{stats.totalMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Loan Period</span>
              <span className="font-medium">14 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fine Rate</span>
              <span className="font-medium">₹10/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
