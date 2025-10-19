'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPendingBorrowRequests, approveBorrowRequest, rejectBorrowRequest } from '@/lib/actions/borrow-requests'
import { toast } from 'sonner'
import type { BorrowRequest } from '@/types'

export default function LibrarianRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request: BorrowRequest | null }>({
    open: false,
    request: null,
  })
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    const data = await getPendingBorrowRequests()
    setRequests(data)
    setLoading(false)
  }

  const handleApprove = async (request: BorrowRequest) => {
    setProcessing(request.id)
    try {
      const result = await approveBorrowRequest(request.id)
      if (result.success) {
        toast.success(result.message)
        loadRequests()
      } else {
        toast.error(result.error || 'Failed to approve request')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectClick = (request: BorrowRequest) => {
    setRejectDialog({ open: true, request })
    setRejectionReason('')
  }

  const handleRejectConfirm = async () => {
    if (!rejectDialog.request) return

    setProcessing(rejectDialog.request.id)
    try {
      const result = await rejectBorrowRequest(rejectDialog.request.id, rejectionReason)
      if (result.success) {
        toast.success(result.message)
        loadRequests()
        setRejectDialog({ open: false, request: null })
      } else {
        toast.error(result.error || 'Failed to reject request')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Borrow Requests</h1>
          <p className="text-muted-foreground">
            Review and approve member borrow requests
          </p>
        </div>
        <Button onClick={loadRequests} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 border rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No pending borrow requests</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Requested Due</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {new Date(request.request_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.user?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.user?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.book?.title}
                  </TableCell>
                  <TableCell>{request.book?.author}</TableCell>
                  <TableCell>
                    <Badge variant={request.book?.available_copies ? 'default' : 'secondary'}>
                      {request.book?.available_copies} copies
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(request.requested_due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.notes ? (
                      <span className="text-sm">{request.notes}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request)}
                        disabled={processing === request.id || !request.book?.available_copies}
                        title={!request.book?.available_copies ? 'Book not available' : 'Approve request'}
                      >
                        {processing === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectClick(request)}
                        disabled={processing === request.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Borrow Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. The member will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                placeholder="e.g., Book reserved for another member, damaged copy..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            {rejectDialog.request && (
              <div className="text-sm space-y-1">
                <p><strong>Member:</strong> {rejectDialog.request.user?.full_name}</p>
                <p><strong>Book:</strong> {rejectDialog.request.book?.title}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, request: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={processing === rejectDialog.request?.id}
            >
              {processing === rejectDialog.request?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
