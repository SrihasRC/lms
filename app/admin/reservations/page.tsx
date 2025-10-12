'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar, User, Book as BookIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllReservations } from '@/lib/actions/reservations'
import { formatDate, getStatusColor } from '@/lib/helpers'
import type { Reservation } from '@/types'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    setLoading(true)
    const result = await getAllReservations()
    setReservations(result)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservations</h1>
        <p className="text-muted-foreground">View all book reservations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reservations found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Reserved On</TableHead>
                <TableHead>Queue Position</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium line-clamp-1">
                          {reservation.book?.title || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.book?.author}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{reservation.user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.user?.member_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(reservation.reservation_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {reservation.queue_position ? `#${reservation.queue_position}` : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reservation.expiry_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(reservation.expiry_date)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(reservation.status)} className="capitalize">
                      {reservation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Reservations</p>
            <p className="text-2xl font-bold">{reservations.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">
              {reservations.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Fulfilled</p>
            <p className="text-2xl font-bold text-green-600">
              {reservations.filter((r) => r.status === 'fulfilled').length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Cancelled/Expired</p>
            <p className="text-2xl font-bold">
              {reservations.filter((r) => r.status === 'cancelled' || r.status === 'expired').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
