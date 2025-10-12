'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchBar } from '@/components/search-bar'
import { BookCard } from '@/components/book-card'
import { createBook, updateBook, deleteBook, getAllBooks } from '@/lib/actions/books'
import { GENRES } from '@/lib/constants'
import { toast } from 'sonner'
import type { Book, BookFormData, BookFilters } from '@/types'

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filters, setFilters] = useState<BookFilters>({})
  const [formData, setFormData] = useState<BookFormData>({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publication_year: undefined,
    genre: '',
    description: '',
    total_copies: 1,
    location: '',
  })

  const loadBooks = async () => {
    setLoading(true)
    const result = await getAllBooks(filters, 1, 100)
    setBooks(result.data)
    setLoading(false)
  }

  useEffect(() => {
    loadBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleOpenDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book)
      setFormData({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher || '',
        publication_year: book.publication_year,
        genre: book.genre,
        description: book.description || '',
        total_copies: book.total_copies,
        location: book.location || '',
      })
    } else {
      setEditingBook(null)
      setFormData({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publication_year: undefined,
        genre: '',
        description: '',
        total_copies: 1,
        location: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = editingBook
        ? await updateBook(editingBook.id, formData)
        : await createBook(formData)

      if (result.success) {
        toast.success(result.message)
        setDialogOpen(false)
        loadBooks()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (book: Book) => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return

    const result = await deleteBook(book.id)
    if (result.success) {
      toast.success(result.message)
      loadBooks()
    } else {
      toast.error(result.error)
    }
  }

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query || undefined })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Books Management</h1>
          <p className="text-muted-foreground">Manage library book inventory</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by title, author, ISBN..."
          />
        </div>
        <Select
          value={filters.genre || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, genre: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {GENRES.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.availability || 'all'}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              availability: value === 'all' ? undefined : (value as 'available' | 'unavailable'),
            })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Books</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book.id} className="relative group">
              <BookCard book={book} showAvailability />
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => handleOpenDialog(book)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDelete(book)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            <DialogDescription>
              {editingBook
                ? 'Update book details. Cover image will be fetched from Open Library using ISBN.'
                : 'Add a new book to the library. Cover image will be fetched from Open Library using ISBN.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN *</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="9780134685991"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre *</Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(value) => setFormData({ ...formData, genre: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Book title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Publisher name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publication_year">Year</Label>
                  <Input
                    id="publication_year"
                    type="number"
                    value={formData.publication_year || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publication_year: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="2024"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_copies">Total Copies *</Label>
                  <Input
                    id="total_copies"
                    type="number"
                    min="1"
                    value={formData.total_copies}
                    onChange={(e) =>
                      setFormData({ ...formData, total_copies: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Section A - Shelf 1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingBook ? 'Update' : 'Add'} Book</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
