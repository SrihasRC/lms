// Constants for the application

export const FINE_PER_DAY = 10; // Fine amount per day in rupees
export const LOAN_DURATION_DAYS = 14; // Default loan duration in days
export const RESERVATION_EXPIRY_DAYS = 3; // Days before reservation expires

export const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Programming',
  'Computer Science',
  'Database',
  'Software Architecture',
  'Business',
  'History',
  'Psychology',
  'Biography',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Self-Help',
  'Education',
  'Reference',
  'Other'
] as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  MEMBER: 'member',
} as const;

export const TRANSACTION_STATUS = {
  ISSUED: 'issued',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
} as const;

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;
