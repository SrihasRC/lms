import { Book, ArrowRightLeft, AlertCircle, BookMarked } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/stats'
import { StatCard } from '@/components/stat-card'

export default async function LibrarianDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Librarian Dashboard</h1>
        <p className="text-muted-foreground">Manage book transactions and reservations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Available Books"
          value={stats.availableBooks}
          description={`of ${stats.totalBooks} total`}
          icon={Book}
        />
        <StatCard
          title="Active Loans"
          value={stats.activeTransactions}
          description="Currently borrowed"
          icon={ArrowRightLeft}
        />
        <StatCard
          title="Overdue Books"
          value={stats.overdueTransactions}
          description="Requires action"
          icon={AlertCircle}
        />
        <StatCard
          title="Pending Reservations"
          value={stats.totalReservations}
          description="Waiting for books"
          icon={BookMarked}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/librarian/issue"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <h3 className="font-medium">Issue Book</h3>
              <p className="text-sm text-muted-foreground">Issue a book to a member</p>
            </a>
            <a
              href="/librarian/return"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <h3 className="font-medium">Return Book</h3>
              <p className="text-sm text-muted-foreground">Process book returns</p>
            </a>
            <a
              href="/librarian/overdue"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <h3 className="font-medium">View Overdue</h3>
              <p className="text-sm text-muted-foreground">Check overdue books</p>
            </a>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Books in Circulation</span>
              <span className="text-sm font-medium">
                {stats.totalBooks - stats.availableBooks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Circulation Rate</span>
              <span className="text-sm font-medium">
                {((( stats.totalBooks - stats.availableBooks) / stats.totalBooks) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overdue Rate</span>
              <span className={`text-sm font-medium ${stats.overdueTransactions > 5 ? 'text-destructive' : 'text-green-600'}`}>
                {stats.activeTransactions > 0
                  ? ((stats.overdueTransactions / stats.activeTransactions) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
