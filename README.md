# Library Management System

A comprehensive Library Management System built with Next.js 15, Supabase, and shadcn/ui. Features role-based authentication (Admin, Librarian, Member) with complete book management, transactions, reservations, and fine tracking.

## 📚 Overview

This LMS provides a complete digital library solution with three distinct user roles, each with tailored dashboards and functionalities. The system handles book cataloging, lending operations, fine management, and reservation systems with an intuitive, modern UI.

## ✨ Features

## ✨ Features

### 🔐 Role-Based Access Control

- **Admin**: 
  - User management (create, update, delete users)
  - Book catalog management (add, edit, remove books)
  - System-wide statistics and analytics
  - View all transactions and fines
  - Generate reports

- **Librarian**: 
  - Issue and return books
  - Approve/reject member borrow requests
  - Manage reservations and fulfill queued requests
  - View overdue books and notify members
  - Handle transactions and process fines

- **Member**: 
  - Browse and search book catalog
  - Request to borrow books (approval-based system)
  - View borrowed books and due dates
  - Reserve unavailable books
  - View transaction history
  - Pay fines online

### 📖 Core Functionality

- **Book Catalog**: Browse 25+ sample books with Open Library cover images
- **Approval-Based Borrowing**: Members create requests, librarians approve/reject
- **Issue/Return System**: Automated due dates (14 days default)
- **Fine Calculation**: Automatic calculation at ₹10/day after due date
- **Reservation System**: Queue management with 3-day expiry
- **Advanced Search**: Filter by title, author, genre, availability
- **Real-time Updates**: Instant availability tracking across the system
- **Transaction History**: Complete audit trail of all operations
- **Dashboard Analytics**: Role-specific statistics and insights

## 🛠️ Tech Stack

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router & Server Actions
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: TypeScript
- **Testing**: Selenium WebDriver with Python (pytest)

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (free tier works)
- Python 3.13+ (for running tests)

## 🚀 Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd lms
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migrations

1. Go to Supabase Dashboard > SQL Editor
2. Run each SQL file in order from the `sql_scripts/` folder:
   - `supabase-schema.sql` - Creates tables, RLS policies, and triggers
   - `supabase-seed.sql` - Adds 25 sample books
   - `supabase-create-test-users.sql` - Creates test accounts
   - `supabase-borrow-requests.sql` - Creates borrow_requests table (approval system)

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login with Test Accounts

- **Admin**: 
  - Email: `admin@lms.com`
  - Password: `admin123`

- **Librarian**: 
  - Email: `librarian@lms.com`
  - Password: `lib123`

- **Member**: 
  - Email: `m1@lms.com`
  - Password: `mem1123`

## 📁 Project Structure

```
lms/
├── app/
│   ├── admin/              # Admin dashboard & pages
│   │   ├── books/          # Book management
│   │   ├── users/          # User management
│   │   ├── transactions/   # All transactions
│   │   └── fines/          # Fine management
│   ├── librarian/          # Librarian dashboard & pages
│   │   ├── requests/       # Approve/reject borrow requests
│   │   ├── issue/          # Issue books
│   │   ├── return/         # Return books
│   │   ├── overdue/        # Overdue books list
│   │   ├── reservations/   # Manage reservations
│   │   └── transactions/   # View transactions
│   ├── member/             # Member dashboard & pages
│   │   ├── books/          # Browse books
│   │   ├── my-books/       # Currently borrowed
│   │   ├── history/        # Transaction history
│   │   ├── reservations/   # My reservations
│   │   ├── fines/          # View & pay fines
│   │   └── requests/       # My borrow requests
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── book-card.tsx       # Book display component
│   ├── navbar.tsx          # Navigation bar
│   ├── sidebar.tsx         # Dashboard sidebar
│   ├── search-bar.tsx      # Search component
│   └── stat-card.tsx       # Statistics card
├── lib/
│   ├── actions/            # Server actions for data operations
│   ├── supabase/           # Supabase client utilities
│   ├── utils.ts            # Helper utilities
│   ├── helpers.ts          # Common helper functions
│   └── constants.ts        # App constants
├── types/
│   └── index.ts            # TypeScript type definitions
├── sql_scripts/            # Database migration scripts
│   ├── supabase-schema.sql
│   ├── supabase-seed.sql
│   ├── supabase-create-test-users.sql
│   ├── supabase-borrow-requests.sql
│   └── ...
├── tests/                  # Selenium test suite
│   ├── test_auth.py        # Authentication tests
│   ├── test_admin.py       # Admin dashboard tests
│   ├── test_librarian.py   # Librarian dashboard tests
│   ├── test_member.py      # Member dashboard tests
│   ├── run_all_tests.py    # Test runner
│   ├── README.md           # Testing documentation
│   └── SELENIUM_TEST_ENDPOINTS.md  # Test scenarios
├── middleware.ts           # Auth & role-based routing
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🧪 Testing

This project includes comprehensive Selenium-based automated tests covering all user roles and features.

### Setup Tests

```bash
cd tests
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install selenium pytest pytest-html
```

### Run Tests

```bash
# Run all tests
python -m pytest -v

# Run specific test file
python test_admin.py
python test_librarian.py
python test_member.py
python test_auth.py

# Generate HTML report
python -m pytest -v --html=report.html --self-contained-html
```

### Test Coverage

- ✅ **Authentication**: Login for all roles, invalid credentials
- ✅ **Admin**: Dashboard, books, users, transactions, fines
- ✅ **Librarian**: Dashboard, requests, issue, return, overdue pages
- ✅ **Member**: Dashboard, browse books, my books, search, fines

**All 19 tests passing** ✨

See `tests/SELENIUM_TEST_ENDPOINTS.md` for detailed test scenarios and selectors.

## 🔑 Key Features Explained

### Approval-Based Borrowing System

1. **Member** creates a borrow request for a book
2. Request enters pending state
3. **Librarian** reviews request in `/librarian/requests`
4. Librarian approves or rejects with optional notes
5. On approval, book is automatically issued to member
6. Member sees book in "My Books" with due date

### Fine Calculation

- **Loan Period**: 14 days default
- **Late Fee**: ₹10 per day after due date
- **Auto-calculation**: Computed on book return
- **Payment Tracking**: Members can view and pay fines online

### Reservation System

- Members can reserve books that are currently unavailable
- Reservations enter a queue (FIFO)
- Librarians fulfill reservations when books are returned
- Reservations expire after 3 days if not fulfilled
- Members notified when reservation is ready

### Book Covers

Books display cover images from [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers) using ISBN-13.

## 📊 Database Schema

Core tables:
- `profiles` - User profiles with roles
- `books` - Book catalog
- `transactions` - All book issues/returns
- `reservations` - Book reservations queue
- `fines` - Fine records
- `borrow_requests` - Pending borrow requests (approval system)

See `sql_scripts/supabase-schema.sql` for complete schema with RLS policies.

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control via middleware
- Supabase Auth integration
- Secure server actions for data mutations
- Environment variable protection

## 📝 License

Educational purposes only.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) by Vercel
- [Supabase](https://supabase.com/) for backend services
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Open Library](https://openlibrary.org/) for book cover images

---

Built with ❤️ using Next.js and Supabase
