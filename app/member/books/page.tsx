'use client'

import { useState, useEffect } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookCard } from '@/components/book-card'
import { getAllBooks } from '@/lib/actions/books'
import { borrowBook } from '@/lib/actions/transactions'
import { createReservation } from '@/lib/actions/reservations'
import { getGenres } from '@/lib/actions/books'
import { toast } from 'sonner'
import type { Book } from '@/types'

export default function MemberBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [reserving, setReserving] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = [...books]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.isbn.toLowerCase().includes(searchLower) ||
          book.genre.toLowerCase().includes(searchLower)
      )
    }

    // Genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter((book) => book.genre === genreFilter)
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter((book) => book.available_copies > 0)
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter((book) => book.available_copies === 0)
    }

    setFilteredBooks(filtered)
  }, [search, genreFilter, availabilityFilter, books])

  const loadData = async () => {
    setLoading(true)
    const [booksResult, genresResult] = await Promise.all([
      getAllBooks(),
      getGenres(),
    ])
    setBooks(booksResult.data)
    setGenres(genresResult)
    setLoading(false)
  }

  const handleBookAction = async (book: Book) => {
    setReserving(book.id)
    
    try {
      if (book.available_copies > 0) {
        // Book is available - borrow it
        const result = await borrowBook(book.id)
        if (result.success) {
          toast.success(result.message)
          // Refresh books list
          loadData()
        } else {
          toast.error(result.error || 'Failed to borrow book')
        }
      } else {
        // Book is unavailable - create reservation
        const result = await createReservation(book.id)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.error || 'Failed to reserve book')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setReserving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Books</h1>
        <p className="text-muted-foreground">
          Borrow available books or reserve unavailable ones from our collection of {books.length} books
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, ISBN, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={availabilityFilter} 
          onValueChange={(v) => setAvailabilityFilter(v as 'all' | 'available' | 'unavailable')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Books" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Books</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredBooks.length} of {books.length} books
        </p>
        {(search || genreFilter !== 'all' || availabilityFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setGenreFilter('all')
              setAvailabilityFilter('all')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No books found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              actionLabel={
                reserving === book.id
                  ? book.available_copies > 0
                    ? 'Borrowing...'
                    : 'Reserving...'
                  : book.available_copies > 0
                  ? 'Borrow'
                  : 'Reserve'
              }
              onAction={() => handleBookAction(book)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
