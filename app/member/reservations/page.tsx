'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookMarked, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getUserReservations, cancelReservation } from '@/lib/actions/reservations'
import { formatDate, getStatusColor } from '@/lib/helpers'
import { toast } from 'sonner'
import type { Reservation } from '@/types'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    setLoading(true)
    const result = await getUserReservations('current-user-id')
    setReservations(result)
    setLoading(false)
  }

  const handleCancel = async (id: string) => {
    setCancelling(id)
    try {
      const result = await cancelReservation(id)
      if (result.success) {
        toast.success(result.message)
        loadReservations()
      } else {
        toast.error(result.error || 'Failed to cancel reservation')
      }
    } catch (error) {
      toast.error('Error cancelling reservation')
      console.error(error)
    } finally {
      setCancelling(null)
    }
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending')
  const otherReservations = reservations.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookMarked className="h-8 w-8" />
          My Reservations
        </h1>
        <p className="text-muted-foreground">
          {pendingReservations.length} pending {pendingReservations.length === 1 ? 'reservation' : 'reservations'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No reservations</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You haven&apos;t reserved any books yet. Reserve unavailable books to get notified when they become available.
          </p>
          <a
            href="/member/books"
            className="inline-block text-sm text-primary hover:underline"
          >
            Browse Books →
          </a>
        </div>
      ) : (
        <>
          {/* Pending Reservations */}
          {pendingReservations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Active Reservations ({pendingReservations.length})
              </h2>
              <div className="grid gap-4">
                {pendingReservations.map((reservation) => (
                  <div key={reservation.id} className="rounded-lg border bg-card p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Book Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default">
                              Queue Position #{reservation.queue_position || 'N/A'}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{reservation.book?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {reservation.book?.author}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {reservation.book?.genre}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Reserved On</p>
                            <p className="font-medium">
                              {formatDate(reservation.reservation_date)}
                            </p>
                          </div>
                          {reservation.expiry_date && (
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                                <span>Expires On</span>
                              </div>
                              <p className="font-medium">
                                {formatDate(reservation.expiry_date)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <Badge variant="default" className="capitalize">
                          {reservation.status}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(reservation.id)}
                          disabled={cancelling === reservation.id}
                        >
                          {cancelling === reservation.id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Info Banner */}
                    <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                      <Clock className="inline h-4 w-4 mr-1" />
                      You&apos;ll be notified when the book becomes available. Please collect it within 3 days.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {otherReservations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">History ({otherReservations.length})</h2>
              <div className="grid gap-4">
                {otherReservations.map((reservation) => (
                  <div key={reservation.id} className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{reservation.book?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {reservation.book?.author}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Reserved: {formatDate(reservation.reservation_date)}
                          </span>
                          {reservation.fulfilled_date && (
                            <span className="text-muted-foreground">
                              Fulfilled: {formatDate(reservation.fulfilled_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(reservation.status)} className="capitalize">
                        {reservation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
