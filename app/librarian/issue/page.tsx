'use client'

import { useState } from 'react'
import { BookOpen, Search, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookCard } from '@/components/book-card'
import { issueBook, searchBooks } from '@/lib/actions/books'
import { getUserByMemberId } from '@/lib/actions/users'
import { toast } from 'sonner'
import type { Book, Profile } from '@/types'

export default function IssueBookPage() {
  const [memberSearch, setMemberSearch] = useState('')
  const [member, setMember] = useState<Profile | null>(null)
  const [loadingMember, setLoadingMember] = useState(false)

  const [bookSearch, setBookSearch] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loadingBooks, setLoadingBooks] = useState(false)

  const [issuing, setIssuing] = useState(false)

  const handleSearchMember = async () => {
    if (!memberSearch.trim()) {
      toast.error('Please enter member ID or email')
      return
    }

    setLoadingMember(true)
    try {
      const result = await getUserByMemberId(memberSearch.trim())
      if (result) {
        setMember(result)
        toast.success('Member found!')
      } else {
        toast.error('Member not found')
        setMember(null)
      }
    } catch (error) {
      toast.error('Error searching for member')
      console.error(error)
    } finally {
      setLoadingMember(false)
    }
  }

  const handleSearchBooks = async () => {
    if (!bookSearch.trim()) {
      toast.error('Please enter book title, ISBN, or author')
      return
    }

    setLoadingBooks(true)
    try {
      const result = await searchBooks(bookSearch.trim())
      setBooks(result.filter(book => book.available_copies > 0))
      if (result.length === 0) {
        toast.info('No books found')
      }
    } catch (error) {
      toast.error('Error searching for books')
      console.error(error)
    } finally {
      setLoadingBooks(false)
    }
  }

  const handleIssueBook = async () => {
    if (!member || !selectedBook) {
      toast.error('Please select both member and book')
      return
    }

    setIssuing(true)
    try {
      const result = await issueBook(selectedBook.id, member.id)
      if (result.success) {
        toast.success('Book issued successfully!')
        // Reset state
        setSelectedBook(null)
        setBooks([])
        setBookSearch('')
      } else {
        toast.error(result.error || 'Failed to issue book')
      }
    } catch (error) {
      toast.error('Error issuing book')
      console.error(error)
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Issue Book</h1>
        <p className="text-muted-foreground">Issue a book to a member</p>
      </div>

      {/* Step 1: Search Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Step 1: Find Member
          </CardTitle>
          <CardDescription>Search by member ID or email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter member ID (e.g., MEM001000) or email"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchMember()}
              disabled={loadingMember}
            />
            <Button onClick={handleSearchMember} disabled={loadingMember}>
              {loadingMember ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {member && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{member.full_name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-sm text-muted-foreground">Member ID: {member.member_id}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {member.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Search Book */}
      {member && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Step 2: Find Book
            </CardTitle>
            <CardDescription>Search for available books</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter book title, ISBN, or author"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchBooks()}
                disabled={loadingBooks}
              />
              <Button onClick={handleSearchBooks} disabled={loadingBooks}>
                {loadingBooks ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {books.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className={`cursor-pointer transition-all ${
                      selectedBook?.id === book.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedBook(book)}
                  >
                    <BookCard
                      book={book}
                      actionLabel={
                        selectedBook?.id === book.id ? 'Selected ✓' : 'Click to select'
                      }
                      onAction={() => setSelectedBook(book)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Issue Book */}
      {member && selectedBook && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Confirm Issue</CardTitle>
            <CardDescription>Review and confirm book issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Member</Label>
                <p className="font-medium">{member.full_name}</p>
                <p className="text-muted-foreground">{member.member_id}</p>
              </div>
              <div>
                <Label>Book</Label>
                <p className="font-medium">{selectedBook.title}</p>
                <p className="text-muted-foreground">by {selectedBook.author}</p>
              </div>
              <div>
                <Label>Due Date</Label>
                <p className="font-medium">
                  {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">14 days from now</p>
              </div>
              <div>
                <Label>Fine Rate</Label>
                <p className="font-medium">₹10 per day</p>
                <p className="text-muted-foreground">After due date</p>
              </div>
            </div>

            <Button
              onClick={handleIssueBook}
              disabled={issuing}
              className="w-full"
              size="lg"
            >
              {issuing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Issuing Book...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Issue Book
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
