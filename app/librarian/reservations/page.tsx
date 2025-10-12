'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookMarked, Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAllReservations, fulfillReservation, cancelReservation } from '@/lib/actions/reservations'
import { formatDate, getStatusColor } from '@/lib/helpers'
import { toast } from 'sonner'
import type { Reservation } from '@/types'

export default function LibrarianReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    setLoading(true)
    const result = await getAllReservations()
    setReservations(result)
    setLoading(false)
  }

  const handleFulfill = async (id: string) => {
    setProcessing(id)
    try {
      const result = await fulfillReservation(id)
      if (result.success) {
        toast.success(result.message)
        loadReservations()
      } else {
        toast.error(result.error || 'Failed to fulfill reservation')
      }
    } catch (error) {
      toast.error('Error fulfilling reservation')
      console.error(error)
    } finally {
      setProcessing(null)
    }
  }

  const handleCancel = async (id: string) => {
    setProcessing(id)
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
      setProcessing(null)
    }
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending')
  const otherReservations = reservations.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservations</h1>
        <p className="text-muted-foreground">Manage book reservations and queue</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reservations found</p>
        </div>
      ) : (
        <>
          {/* Pending Reservations */}
          {pendingReservations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pending Reservations ({pendingReservations.length})</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Queue</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Reserved On</TableHead>
                      <TableHead>Expires On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <Badge variant="outline">#{reservation.queue_position || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">
                              {reservation.book?.title || 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reservation.book?.author}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reservation.user?.full_name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                              {reservation.user?.member_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(reservation.reservation_date)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {reservation.expiry_date ? formatDate(reservation.expiry_date) : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(reservation.status)} className="capitalize">
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleFulfill(reservation.id)}
                              disabled={processing === reservation.id}
                            >
                              {processing === reservation.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Fulfill
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancel(reservation.id)}
                              disabled={processing === reservation.id}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Other Reservations */}
          {otherReservations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">History ({otherReservations.length})</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Reserved On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fulfilled On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">
                              {reservation.book?.title || 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reservation.book?.author}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reservation.user?.full_name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                              {reservation.user?.member_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(reservation.reservation_date)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(reservation.status)} className="capitalize">
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {reservation.fulfilled_date ? formatDate(reservation.fulfilled_date) : '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingReservations.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fulfilled</p>
                <p className="text-2xl font-bold">
                  {reservations.filter((r) => r.status === 'fulfilled').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">
                  {reservations.filter((r) => r.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
