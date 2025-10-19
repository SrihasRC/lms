'use client'

import { useState, useEffect } from 'react'
import { Loader2, Clock, CheckCircle, XCircle, Ban } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUserBorrowRequests, cancelBorrowRequest } from '@/lib/actions/borrow-requests'
import { toast } from 'sonner'
import type { BorrowRequest } from '@/types'

export default function MemberRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    const data = await getUserBorrowRequests()
    setRequests(data)
    setLoading(false)
  }

  const handleCancel = async (requestId: string) => {
    setCancelling(requestId)
    try {
      const result = await cancelBorrowRequest(requestId)
      if (result.success) {
        toast.success(result.message)
        loadRequests()
      } else {
        toast.error(result.error || 'Failed to cancel request')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setCancelling(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'cancelled':
        return <Badge variant="outline"><Ban className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const historyRequests = requests.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Borrow Requests</h1>
        <p className="text-muted-foreground">
          View and manage your book borrow requests
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {requests.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-3">
            <Ban className="h-8 w-8 text-gray-500" />
            <div>
              <p className="text-2xl font-bold">
                {requests.filter(r => r.status === 'cancelled').length}
              </p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 border rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No borrow requests yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Go to Browse Books to request a book
          </p>
        </div>
      ) : (
        <>
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pending Requests</h2>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Requested Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.request_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.book?.title}
                        </TableCell>
                        <TableCell>{request.book?.author}</TableCell>
                        <TableCell>
                          {new Date(request.requested_due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(request.id)}
                            disabled={cancelling === request.id}
                          >
                            {cancelling === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Cancel'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* History */}
          {historyRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Request History</h2>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.request_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.book?.title}
                        </TableCell>
                        <TableCell>{request.book?.author}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.reviewed_at ? (
                            <div>
                              <p className="text-sm">
                                {new Date(request.reviewed_at).toLocaleDateString()}
                              </p>
                              {request.reviewed_by_profile && (
                                <p className="text-xs text-muted-foreground">
                                  by {request.reviewed_by_profile.full_name}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.rejection_reason ? (
                            <span className="text-sm text-red-500">
                              {request.rejection_reason}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
