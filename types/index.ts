// Database Types matching Supabase schema

export type UserRole = 'admin' | 'librarian' | 'member';

export type TransactionStatus = 'issued' | 'returned' | 'overdue';

export type ReservationStatus = 'pending' | 'fulfilled' | 'cancelled' | 'expired';

export type BorrowRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  member_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  genre: string;
  description?: string;
  cover_url?: string;
  total_copies: number;
  available_copies: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  book_id: string;
  user_id: string;
  issued_by?: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  returned_by?: string;
  status: TransactionStatus;
  fine_amount: number;
  fine_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  book?: Book;
  user?: Profile;
  issued_by_profile?: Profile;
  returned_by_profile?: Profile;
}

export interface Reservation {
  id: string;
  book_id: string;
  user_id: string;
  reservation_date: string;
  status: ReservationStatus;
  expiry_date?: string;
  fulfilled_date?: string;
  queue_position?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  book?: Book;
  user?: Profile;
}

export interface Fine {
  id: string;
  transaction_id: string;
  user_id: string;
  amount: number;
  reason: string;
  paid: boolean;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  transaction?: Transaction;
  user?: Profile;
}

export interface BorrowRequest {
  id: string;
  book_id: string;
  user_id: string;
  request_date: string;
  requested_due_date: string;
  status: BorrowRequestStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  book?: Book;
  user?: Profile;
  reviewed_by_profile?: Profile;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  role?: UserRole;
}

export interface BookFormData {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  genre: string;
  description?: string;
  total_copies: number;
  location?: string;
}

export interface IssueBookFormData {
  book_id: string;
  user_id: string;
  due_date: string;
  notes?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalMembers: number;
  activeTransactions: number;
  overdueTransactions: number;
  totalFines: number;
  unpaidFines: number;
  totalReservations: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search and Filter Types
export interface BookFilters {
  genre?: string;
  availability?: 'all' | 'available' | 'unavailable';
  year?: number;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
