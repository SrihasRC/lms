import { FINE_PER_DAY, LOAN_DURATION_DAYS } from './constants';

/**
 * Calculate fine amount based on due date and return date
 */
export function calculateFine(dueDate: string, returnDate: string = new Date().toISOString()): number {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  
  const daysOverdue = Math.floor((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue <= 0) {
    return 0;
  }
  
  return daysOverdue * FINE_PER_DAY;
}

/**
 * Calculate due date from issue date
 */
export function calculateDueDate(issueDate: string = new Date().toISOString(), days: number = LOAN_DURATION_DAYS): string {
  const issue = new Date(issueDate);
  const due = new Date(issue);
  due.setDate(due.getDate() + days);
  return due.toISOString();
}

/**
 * Check if a transaction is overdue
 */
export function isOverdue(dueDate: string): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  return now > due;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

/**
 * Get days remaining until due date
 */
export function getDaysRemaining(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Generate book cover URL from ISBN using Open Library API
 */
export function getBookCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
  if (!isbn) {
    return '/placeholder-book.png';
  }
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

/**
 * Generate member ID
 */
export function generateMemberId(count: number): string {
  return `MEM${String(count).padStart(6, '0')}`;
}

/**
 * Validate ISBN format (ISBN-10 or ISBN-13)
 */
export function isValidISBN(isbn: string): boolean {
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  // Check if it's 10 or 13 digits
  if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
    return false;
  }
  
  // For simplicity, just check if it's all numbers (except last digit of ISBN-10 can be X)
  if (cleanISBN.length === 10) {
    return /^\d{9}[\dX]$/.test(cleanISBN);
  }
  
  return /^\d{13}$/.test(cleanISBN);
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'issued':
    case 'pending':
      return 'default';
    case 'returned':
    case 'fulfilled':
      return 'secondary';
    case 'overdue':
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
