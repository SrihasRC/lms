# LMS Selenium Tests

Simple and minimal Selenium tests for the Library Management System.

## Setup

1. Run the setup script to download ChromeDriver:
```bash
cd /home/srihasrc/Music/lms/tests
./setup_chromedriver.sh
```

2. Activate the virtual environment:
```bash
source venv/bin/activate
```

3. Install dependencies (if not already installed):
```bash
pip install selenium
```

4. Start the development server (in another terminal):
```bash
cd /home/srihasrc/Music/lms
npm run dev
```

## Running Tests

**Important:** Always activate the virtual environment first!

```bash
cd /home/srihasrc/Music/lms/tests
source venv/bin/activate
```

### Run all tests:
```bash
python run_all_tests.py
```

### Run individual test files:
```bash
# Authentication tests
python test_auth.py

# Member tests
python test_member.py

# Admin tests
python test_admin.py

# Librarian tests
python test_librarian.py
```

## Test Files

- **test_auth.py** - Login tests for all user roles (admin, librarian, member)
- **test_member.py** - Member dashboard and features (browse books, my books, fines)
- **test_admin.py** - Admin dashboard and pages (books, users, transactions, fines)
- **test_librarian.py** - Librarian dashboard and pages (requests, issue, return, overdue)
- **run_all_tests.py** - Runs all tests in sequence

## Test Accounts

Make sure these test accounts exist in your database:

- **Admin**: admin@lms.com / admin123
- **Librarian**: librarian@lms.com / lib123
- **Member**: m1@lms.com / mem1123

## Screenshots

Failed tests automatically save screenshots with the format:
- `error_[test_name].png`

## Notes

- All tests use `BASE_URL = "http://localhost:3000"`
- Tests are kept simple and minimal
- Each test is independent and can run on its own
- Tests use explicit waits to handle async page loads
