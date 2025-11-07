-- Borrow Requests Table for Approval-Based Borrowing System

CREATE TABLE IF NOT EXISTS borrow_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  requested_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_borrow_requests_user_id ON borrow_requests(user_id);
CREATE INDEX idx_borrow_requests_book_id ON borrow_requests(book_id);
CREATE INDEX idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX idx_borrow_requests_request_date ON borrow_requests(request_date DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_borrow_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_borrow_requests_updated_at
BEFORE UPDATE ON borrow_requests
FOR EACH ROW
EXECUTE FUNCTION update_borrow_requests_updated_at();

-- Enable Row Level Security (optional, if you re-enable RLS later)
-- ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE borrow_requests IS 'Stores borrow requests from members that need librarian approval';
COMMENT ON COLUMN borrow_requests.status IS 'pending: awaiting approval, approved: librarian approved (book will be issued), rejected: librarian rejected, cancelled: member cancelled';
