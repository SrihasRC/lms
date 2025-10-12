'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Book as BookIcon, User, MapPin } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Book } from '@/types'
import { getBookCoverUrl } from '@/lib/helpers'

interface BookCardProps {
  book: Book
  onAction?: (book: Book) => void
  actionLabel?: string
  showAvailability?: boolean
}

export function BookCard({ book, onAction, actionLabel = 'View Details', showAvailability = true }: BookCardProps) {
  const [imgError, setImgError] = useState(false)
  const coverUrl = getBookCoverUrl(book.isbn, 'M')

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg group">
      <div className="relative aspect-[2/3] bg-muted">
        {!imgError ? (
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <BookIcon className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        {showAvailability && (
          <div className="absolute top-2 right-2">
            <Badge variant={book.available_copies > 0 ? 'default' : 'destructive'}>
              {book.available_copies > 0 ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
          {book.title}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="line-clamp-1">{book.author}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline">{book.genre}</Badge>
          {book.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{book.location}</span>
            </div>
          )}
        </div>
        {showAvailability && (
          <p className="text-xs text-muted-foreground">
            {book.available_copies} of {book.total_copies} available
          </p>
        )}
      </CardContent>
      {onAction && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={() => onAction(book)} 
            className="w-full"
            variant={book.available_copies > 0 ? 'default' : 'secondary'}
            disabled={book.available_copies === 0 && actionLabel.includes('Issue')}
          >
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
