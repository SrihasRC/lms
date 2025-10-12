import { Book, Users, ArrowRightLeft, AlertCircle, IndianRupee, BookMarked } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/stats'
import { StatCard } from '@/components/stat-card'
import { formatCurrency } from '@/lib/helpers'

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of the library system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          description={`${stats.availableBooks} available`}
          icon={Book}
        />
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          description="Registered members"
          icon={Users}
        />
        <StatCard
          title="Active Loans"
          value={stats.activeTransactions}
          description="Currently borrowed books"
          icon={ArrowRightLeft}
        />
        <StatCard
          title="Overdue Books"
          value={stats.overdueTransactions}
          description="Needs attention"
          icon={AlertCircle}
        />
        <StatCard
          title="Pending Reservations"
          value={stats.totalReservations}
          description="Books reserved"
          icon={BookMarked}
        />
        <StatCard
          title="Unpaid Fines"
          value={formatCurrency(stats.unpaidFines)}
          description={`Total: ${formatCurrency(stats.totalFines)}`}
          icon={IndianRupee}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Book Availability</span>
              <span className="text-sm font-medium">
                {((stats.availableBooks / stats.totalBooks) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Books in Circulation</span>
              <span className="text-sm font-medium">
                {stats.totalBooks - stats.availableBooks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average per Member</span>
              <span className="text-sm font-medium">
                {stats.totalMembers > 0
                  ? (stats.activeTransactions / stats.totalMembers).toFixed(1)
                  : '0.0'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overdue Rate</span>
              <span className={`text-sm font-medium ${stats.overdueTransactions > 5 ? 'text-destructive' : 'text-green-600'}`}>
                {stats.activeTransactions > 0
                  ? ((stats.overdueTransactions / stats.activeTransactions) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fine Collection</span>
              <span className="text-sm font-medium">
                {stats.totalFines > 0
                  ? ((( stats.totalFines - stats.unpaidFines) / stats.totalFines) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reservation Demand</span>
              <span className="text-sm font-medium">{stats.totalReservations}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
