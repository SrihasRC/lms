# Library Management SystemThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A comprehensive Library Management System built with Next.js 15, Supabase, and shadcn/ui. Features role-based authentication (Admin, Librarian, Member) with complete book management, transactions, reservations, and fine tracking.## Getting Started



## FeaturesFirst, run the development server:



### Role-Based Access Control```bash

- **Admin**: Manage users, books, view all transactions, system statisticsnpm run dev

- **Librarian**: Issue/return books, manage transactions, handle reservations# or

- **Member**: Browse books, borrow/return, view history, pay finesyarn dev

# or

### Core Functionalitypnpm dev

- Book catalog with Open Library cover images# or

- Book issuing and returning with automatic due datesbun dev

- Fine calculation (₹10/day after due date)```

- Book reservation system with queue management

- Advanced search and filtersOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- Real-time availability tracking

- Transaction historyYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- Dashboard statistics

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tech Stack

## Learn More

- **Framework**: Next.js 15 with App Router

- **Database & Auth**: Supabase (PostgreSQL + Auth)To learn more about Next.js, take a look at the following resources:

- **Styling**: Tailwind CSS 4

- **UI Components**: shadcn/ui- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Icons**: Lucide React- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Type Safety**: TypeScript

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Prerequisites

## Deploy on Vercel

- Node.js 18+ 

- npm or yarnThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- Supabase account (free tier works)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Run Database Migrations

1. Go to Supabase Dashboard > SQL Editor
2. Run the contents of `supabase-schema.sql`
3. This creates all tables, RLS policies, and triggers

### 5. Seed Sample Data

Run the contents of `supabase-seed.sql` in SQL Editor to add 25 sample books.

### 6. Create Initial Admin User

1. Register a new user via the app
2. In Supabase SQL Editor, run:

\`\`\`sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';
\`\`\`

### 7. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
lms/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── librarian/      # Librarian dashboard
│   ├── member/         # Member dashboard
│   ├── login/          # Login page
│   └── register/       # Registration page
├── components/         # UI components
├── lib/
│   ├── actions/        # Server actions
│   └── supabase/       # Supabase clients
├── types/              # TypeScript types
├── middleware.ts       # Auth middleware
├── supabase-schema.sql # Database schema
└── supabase-seed.sql   # Sample data
\`\`\`

## Key Features

### Book Covers
Books display covers from Open Library API using ISBN.

### Fine Calculation
- Default loan: 14 days
- Fine: ₹10/day after due date
- Automatic calculation on return

### Reservations
- Queue system for unavailable books
- 3-day expiry
- Librarian fulfillment

## License

Educational purposes only.
