# Selenium Test Endpoints & Automation Guide

This document outlines all endpoints, user flows, and UI interactions that can be automated using Selenium for the Library Management System.

## Table of Contents
1. [Authentication Flows](#authentication-flows)
2. [Admin Dashboard & Features](#admin-dashboard--features)
3. [Librarian Dashboard & Features](#librarian-dashboard--features)
4. [Member Dashboard & Features](#member-dashboard--features)
5. [Common UI Components](#common-ui-components)
6. [Test Data](#test-data)

---

## Authentication Flows

### 1. User Registration
- **Endpoint**: `/register`
- **Method**: POST (form submission)
- **Test Scenarios**:
  - ✅ Successful registration with valid data
  - ✅ Registration with existing email (should fail)
  - ✅ Registration with invalid email format
  - ✅ Registration with password < 6 characters
  - ✅ Verify redirect after successful registration
  - ✅ Form validation messages display correctly
  - ✅ Optional fields (phone, address) work correctly

**Selenium Actions**:
```python
# Navigate to register page
driver.get("http://localhost:3000/register")

# Fill form fields
driver.find_element(By.ID, "full_name").send_keys("John Doe")
driver.find_element(By.ID, "email").send_keys("john@example.com")
driver.find_element(By.ID, "password").send_keys("password123")
driver.find_element(By.ID, "phone").send_keys("+91 1234567890")
driver.find_element(By.ID, "address").send_keys("123 Test Street")

# Submit form
driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

# Verify success toast appears
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-sonner-toast]")))
```

### 2. User Login
- **Endpoint**: `/login`
- **Method**: POST (form submission)
- **Test Scenarios**:
  - ✅ Login as Admin
  - ✅ Login as Librarian
  - ✅ Login as Member
  - ✅ Login with invalid credentials
  - ✅ Login with non-existent email
  - ✅ Verify redirect to correct dashboard based on role
  - ✅ Form validation works correctly

**Selenium Actions**:
```python
# Navigate to login page
driver.get("http://localhost:3000/login")

# Fill credentials
driver.find_element(By.ID, "email").send_keys("admin@library.com")
driver.find_element(By.ID, "password").send_keys("admin123")

# Submit
driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

# Verify redirect to admin dashboard
wait.until(EC.url_contains("/admin"))
```

### 3. Logout
- **Action**: Click user menu → Logout
- **Test Scenarios**:
  - ✅ Logout from admin dashboard
  - ✅ Logout from librarian dashboard
  - ✅ Logout from member dashboard
  - ✅ Verify redirect to login page
  - ✅ Verify session cleared (cannot access protected pages)

---

## Admin Dashboard & Features

### Base URL: `/admin`

### 1. Admin Dashboard Home
- **Endpoint**: `/admin`
- **Test Scenarios**:
  - ✅ Dashboard loads with all stat cards
  - ✅ Total books count displays correctly
  - ✅ Available books count displays correctly
  - ✅ Active transactions count displays correctly
  - ✅ Total members count displays correctly
  - ✅ Total fines amount displays correctly

**Selenium Selectors**:
```python
# Verify stat cards
total_books = driver.find_element(By.XPATH, "//p[text()='Total Books']/following-sibling::p").text
available_books = driver.find_element(By.XPATH, "//p[text()='Available']/following-sibling::p").text
active_transactions = driver.find_element(By.XPATH, "//p[text()='Active Transactions']/following-sibling::p").text
```

### 2. Books Management
- **Endpoint**: `/admin/books`
- **Test Scenarios**:
  - ✅ View all books in table
  - ✅ Search books by title
  - ✅ Filter books by genre
  - ✅ Filter books by availability
  - ✅ Add new book
  - ✅ Edit existing book
  - ✅ Delete book
  - ✅ Pagination works correctly
  - ✅ Book details display correctly (title, author, ISBN, genre, copies)

**Selenium Actions - Add Book**:
```python
# Click Add Book button
driver.find_element(By.XPATH, "//button[contains(text(), 'Add Book')]").click()

# Fill book form (in dialog/modal)
driver.find_element(By.ID, "title").send_keys("Test Book Title")
driver.find_element(By.ID, "author").send_keys("Test Author")
driver.find_element(By.ID, "isbn").send_keys("1234567890123")
driver.find_element(By.ID, "genre").send_keys("Fiction")
driver.find_element(By.ID, "publisher").send_keys("Test Publisher")
driver.find_element(By.ID, "published_year").send_keys("2024")
driver.find_element(By.ID, "total_copies").send_keys("5")
driver.find_element(By.ID, "location").send_keys("Shelf A-1")

# Submit
driver.find_element(By.XPATH, "//button[contains(text(), 'Add')]").click()
```

**Selenium Actions - Search Books**:
```python
# Use search bar
search_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Search']")
search_input.send_keys("Harry Potter")
search_input.send_keys(Keys.RETURN)

# Verify filtered results
time.sleep(1)  # Wait for search results
books = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
```

### 3. Users Management
- **Endpoint**: `/admin/users`
- **Test Scenarios**:
  - ✅ View all users in table
  - ✅ Filter users by role (Admin, Librarian, Member)
  - ✅ Search users by name or email
  - ✅ Edit user details
  - ✅ Update user role
  - ✅ Delete user
  - ✅ User stats display correctly (borrowed books, fines)

**Selenium Actions - Filter by Role**:
```python
# Click role filter dropdown
driver.find_element(By.XPATH, "//button[contains(text(), 'All Roles')]").click()

# Select 'Member'
driver.find_element(By.XPATH, "//div[contains(text(), 'Member')]").click()

# Verify filtered results
time.sleep(1)
users = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
```

### 4. Transactions Management
- **Endpoint**: `/admin/transactions`
- **Test Scenarios**:
  - ✅ View all transactions
  - ✅ Filter by status (Issued, Returned, Overdue)
  - ✅ Search by book title or member name
  - ✅ Transaction details display correctly
  - ✅ View issue date, due date, return date
  - ✅ Overdue transactions highlighted

### 5. Reservations Management
- **Endpoint**: `/admin/reservations`
- **Test Scenarios**:
  - ✅ View all reservations
  - ✅ Filter by status (Pending, Fulfilled, Cancelled, Expired)
  - ✅ Reservation details display correctly
  - ✅ Reserved date and status visible

### 6. Fines Management
- **Endpoint**: `/admin/fines`
- **Test Scenarios**:
  - ✅ View all fines
  - ✅ Filter by status (Pending, Paid)
  - ✅ Fines auto-sync when page loads
  - ✅ Fine amounts calculate correctly (₹10/day)
  - ✅ Mark fine as paid
  - ✅ Total fines amount displays correctly

**Selenium Actions - Mark Fine as Paid**:
```python
# Find first pending fine
first_fine = driver.find_element(By.XPATH, "//table/tbody/tr[1]//button[contains(text(), 'Mark as Paid')]")
first_fine.click()

# Verify status changes to 'Paid'
time.sleep(1)
status = driver.find_element(By.XPATH, "//table/tbody/tr[1]//span[contains(@class, 'badge')]").text
assert status == "Paid"
```

---

## Librarian Dashboard & Features

### Base URL: `/librarian`

### 1. Librarian Dashboard Home
- **Endpoint**: `/librarian`
- **Test Scenarios**:
  - ✅ Dashboard loads with quick stats
  - ✅ Pending requests count displays
  - ✅ Active transactions count displays
  - ✅ Overdue books count displays
  - ✅ Quick action buttons work

### 2. Borrow Requests (Approval System)
- **Endpoint**: `/librarian/requests`
- **Test Scenarios**:
  - ✅ View all pending borrow requests
  - ✅ Approve a borrow request
  - ✅ Reject a borrow request
  - ✅ Request details display correctly (member name, book title, request date)
  - ✅ Approved requests create transactions
  - ✅ Rejected requests update status
  - ✅ Book availability updates after approval

**Selenium Actions - Approve Request**:
```python
# Find first pending request
approve_btn = driver.find_element(By.XPATH, "//table/tbody/tr[1]//button[contains(text(), 'Approve')]")
approve_btn.click()

# Confirm in dialog if needed
wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]"))).click()

# Verify success toast
wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'approved')]")))
```

### 3. Issue Books
- **Endpoint**: `/librarian/issue`
- **Test Scenarios**:
  - ✅ Select member from dropdown
  - ✅ Select book from dropdown
  - ✅ Issue book successfully
  - ✅ Due date auto-calculated (14 days)
  - ✅ Cannot issue if book unavailable
  - ✅ Transaction created successfully

**Selenium Actions - Issue Book**:
```python
# Select member
driver.find_element(By.ID, "member-select").click()
driver.find_element(By.XPATH, "//div[contains(text(), 'John Doe')]").click()

# Select book
driver.find_element(By.ID, "book-select").click()
driver.find_element(By.XPATH, "//div[contains(text(), 'Test Book')]").click()

# Click Issue
driver.find_element(By.XPATH, "//button[contains(text(), 'Issue Book')]").click()
```

### 4. Return Books
- **Endpoint**: `/librarian/return`
- **Test Scenarios**:
  - ✅ View all active transactions
  - ✅ Return a book
  - ✅ Fine calculated if overdue
  - ✅ Fine created automatically for overdue books
  - ✅ Book availability updates
  - ✅ Transaction status updates to 'returned' or 'overdue'

**Selenium Actions - Return Book**:
```python
# Find first active transaction
return_btn = driver.find_element(By.XPATH, "//table/tbody/tr[1]//button[contains(text(), 'Return')]")
return_btn.click()

# Confirm return
wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]"))).click()

# Check if fine message appears (if overdue)
try:
    fine_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Fine')]").text
    print(f"Fine: {fine_msg}")
except:
    print("No fine - returned on time")
```

### 5. Overdue Books
- **Endpoint**: `/librarian/overdue`
- **Test Scenarios**:
  - ✅ View all overdue transactions
  - ✅ Overdue books highlighted
  - ✅ Days overdue calculated correctly
  - ✅ Fine amount displayed correctly
  - ✅ Can return overdue books from this page

### 6. Reservations
- **Endpoint**: `/librarian/reservations`
- **Test Scenarios**:
  - ✅ View all reservations
  - ✅ Filter by status
  - ✅ Cancel reservation
  - ✅ Mark as fulfilled

### 7. Transactions
- **Endpoint**: `/librarian/transactions`
- **Test Scenarios**:
  - ✅ View all transactions
  - ✅ Filter by status
  - ✅ Search transactions

---

## Member Dashboard & Features

### Base URL: `/member`

### 1. Member Dashboard Home
- **Endpoint**: `/member`
- **Test Scenarios**:
  - ✅ Dashboard loads with member stats
  - ✅ Books borrowed count displays
  - ✅ Books due soon count displays
  - ✅ Pending fines amount displays
  - ✅ Recent activity displays

### 2. Browse Books
- **Endpoint**: `/member/books`
- **Test Scenarios**:
  - ✅ View all available books in grid
  - ✅ Search books by title/author
  - ✅ Filter by genre
  - ✅ Filter by availability
  - ✅ Book cards display correctly (cover, title, author, genre, availability)
  - ✅ Request to borrow book
  - ✅ Reserve unavailable book
  - ✅ Request creates borrow_request (pending approval)

**Selenium Actions - Request Book**:
```python
# Search for a book
search_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Search']")
search_input.send_keys("Test Book")

# Click on first available book's "Request" button
wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Request Book')]"))).click()

# Confirm request in dialog
wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]"))).click()

# Verify success toast
wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Request sent')]")))
```

**Selenium Actions - Reserve Book**:
```python
# Find an unavailable book
unavailable_book = driver.find_element(By.XPATH, "//span[contains(text(), 'Unavailable')]/ancestor::div[@class='book-card']")

# Click Reserve button
unavailable_book.find_element(By.XPATH, ".//button[contains(text(), 'Reserve')]").click()

# Verify reservation created
wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'reserved')]")))
```

### 3. My Books (Currently Borrowed)
- **Endpoint**: `/member/my-books`
- **Test Scenarios**:
  - ✅ View all currently borrowed books
  - ✅ Book details display correctly
  - ✅ Issue date and due date visible
  - ✅ Days remaining calculated correctly
  - ✅ Overdue warning displays for overdue books
  - ✅ Fine amount shown for overdue books
  - ✅ Return book button works
  - ✅ Return confirmation dialog appears
  - ✅ Return dialog has Cancel and Confirm buttons
  - ✅ Book returned successfully
  - ✅ Summary stats display (Total, On Time, Overdue)

**Selenium Actions - Return Book**:
```python
# Navigate to my books
driver.get("http://localhost:3000/member/my-books")

# Click Return button on first book
return_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Return Book')]")
return_btn.click()

# Wait for dialog to appear
wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Return Book')]")))

# Click Confirm Return in dialog
confirm_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Confirm Return')]")
confirm_btn.click()

# Verify success toast
wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'returned successfully')]")))
```

### 4. Borrow Requests Status
- **Endpoint**: `/member/requests`
- **Test Scenarios**:
  - ✅ View all borrow requests
  - ✅ Filter by status (Pending, Approved, Rejected)
  - ✅ Request details display correctly
  - ✅ Request date visible
  - ✅ Status badges display correctly
  - ✅ Cancel pending request

**Selenium Actions - Cancel Request**:
```python
# Find pending request
cancel_btn = driver.find_element(By.XPATH, "//table/tbody/tr[.//span[text()='Pending']]//button[contains(text(), 'Cancel')]")
cancel_btn.click()

# Confirm cancellation
wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]"))).click()

# Verify status changes
time.sleep(1)
status = driver.find_element(By.XPATH, "//table/tbody/tr[1]//span[contains(@class, 'badge')]").text
assert status in ["Cancelled", "Canceled"]
```

### 5. Borrowing History
- **Endpoint**: `/member/history`
- **Test Scenarios**:
  - ✅ View all past transactions
  - ✅ Filter by status (Returned, Overdue)
  - ✅ Transaction history displays correctly
  - ✅ Return dates visible
  - ✅ Fines paid status visible

### 6. Reservations
- **Endpoint**: `/member/reservations`
- **Test Scenarios**:
  - ✅ View all reservations
  - ✅ Filter by status (Pending, Fulfilled, Cancelled, Expired)
  - ✅ Cancel pending reservation
  - ✅ Reservation details display correctly

### 7. Fines
- **Endpoint**: `/member/fines`
- **Test Scenarios**:
  - ✅ View all fines
  - ✅ Fines auto-sync when page loads
  - ✅ Filter by status (Pending, Paid)
  - ✅ Fine amounts display correctly
  - ✅ Associated book title shows
  - ✅ Overdue days calculated correctly
  - ✅ Pay fine button (if implemented)
  - ✅ Total fines summary

**Selenium Actions - View Fines**:
```python
# Navigate to fines page
driver.get("http://localhost:3000/member/fines")

# Wait for fines to load (after auto-sync)
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table")))

# Get total fines amount
total_fines = driver.find_element(By.XPATH, "//p[text()='Total Fines']/following-sibling::p").text

# Verify fine details in table
first_fine_amount = driver.find_element(By.XPATH, "//table/tbody/tr[1]/td[3]").text  # Adjust column index
```

---

## Common UI Components

### 1. Navbar
- **Test Scenarios**:
  - ✅ Logo/title displays
  - ✅ User name displays
  - ✅ User role displays
  - ✅ User menu opens on click
  - ✅ Logout works from menu

**Selenium Actions**:
```python
# Click user menu
driver.find_element(By.CSS_SELECTOR, "button[aria-label='User menu']").click()

# Verify menu items
driver.find_element(By.XPATH, "//div[contains(text(), 'Admin')]")  # Role
driver.find_element(By.XPATH, "//div[contains(text(), 'Logout')]").click()
```

### 2. Sidebar Navigation
- **Test Scenarios**:
  - ✅ All navigation links display correctly
  - ✅ Active link highlighted
  - ✅ Navigation links work correctly
  - ✅ Icons display correctly

**Selenium Actions**:
```python
# Click on Books link
driver.find_element(By.XPATH, "//a[contains(text(), 'Books')]").click()

# Verify URL changes
wait.until(EC.url_contains("/books"))

# Verify active state
active_link = driver.find_element(By.CSS_SELECTOR, "a[aria-current='page']")
```

### 3. Search Bar Component
- **Test Scenarios**:
  - ✅ Search input accepts text
  - ✅ Search icon displays
  - ✅ Placeholder text correct
  - ✅ Search triggers on Enter key
  - ✅ Results filter correctly

### 4. Toast Notifications (Sonner)
- **Test Scenarios**:
  - ✅ Success toast displays
  - ✅ Error toast displays
  - ✅ Toast auto-dismisses
  - ✅ Toast message content correct

**Selenium Actions**:
```python
# Wait for toast to appear
toast = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-sonner-toast]")))

# Get toast message
message = toast.find_element(By.CSS_SELECTOR, "[data-description]").text

# Verify toast type
toast_type = toast.get_attribute("data-type")  # success, error, etc.
```

### 5. Dialogs/Modals
- **Test Scenarios**:
  - ✅ Dialog opens on trigger
  - ✅ Dialog content displays correctly
  - ✅ Cancel button closes dialog
  - ✅ Confirm button triggers action
  - ✅ Dialog closes after action
  - ✅ Backdrop click closes dialog (if enabled)

### 6. Tables
- **Test Scenarios**:
  - ✅ Table headers display correctly
  - ✅ Table data loads
  - ✅ Pagination works (if implemented)
  - ✅ Sorting works (if implemented)
  - ✅ Row actions work (edit, delete buttons)

### 7. Stat Cards
- **Test Scenarios**:
  - ✅ Card displays correct value
  - ✅ Card label displays correctly
  - ✅ Icons display correctly
  - ✅ Values update when data changes

---

## Test Data

### Test User Accounts

#### Admin Account
```
Email: admin@lms.com
Password: admin123
Role: admin
```

#### Librarian Account
```
Email: librarian@library.com
Password: lib123
Role: librarian
```

#### Member Account
```
Email: m1@library.com
Password: mem1123
Role: member
```

### Sample Books for Testing
```
Title: The Great Gatsby
Author: F. Scott Fitzgerald
ISBN: 9780743273565
Genre: Fiction
Publisher: Scribner
Year: 1925
Copies: 5
Location: Shelf A-1

Title: To Kill a Mockingbird
Author: Harper Lee
ISBN: 9780061120084
Genre: Fiction
Publisher: Harper Perennial
Year: 1960
Copies: 3
Location: Shelf A-2

Title: 1984
Author: George Orwell
ISBN: 9780451524935
Genre: Dystopian
Publisher: Signet Classic
Year: 1949
Copies: 4
Location: Shelf B-1
```

---

## End-to-End Test Flows

### Flow 1: Complete Member Borrow Journey
1. Login as member
2. Browse books
3. Search for a specific book
4. Request to borrow book
5. Logout
6. Login as librarian
7. Navigate to borrow requests
8. Approve the request
9. Logout
10. Login as member
11. Navigate to My Books
12. Verify book appears
13. Return book
14. Verify book removed from My Books

### Flow 2: Overdue Book & Fine Management
1. (Setup: Create transaction with past due date in database)
2. Login as member
3. Navigate to My Books
4. Verify overdue warning displays
5. Verify fine amount shown
6. Navigate to Fines page
7. Verify fine appears in list
8. Return overdue book
9. Login as admin
10. Navigate to Fines
11. Verify fine exists
12. Mark fine as paid
13. Login as member
14. Verify fine status updated to Paid

### Flow 3: Book Reservation Flow
1. Login as member
2. Browse books
3. Find unavailable book
4. Reserve the book
5. Navigate to Reservations
6. Verify reservation appears with Pending status
7. (Setup: Return a copy to make available)
8. Refresh reservations
9. Verify status changes or notification received

### Flow 4: Complete Admin Workflow
1. Login as admin
2. Add new book
3. Add new user (member)
4. Navigate to transactions
5. View active transactions
6. Navigate to fines
7. View all fines
8. Mark fine as paid
9. Navigate to users
10. Edit user details
11. View user stats

---

## Selenium Best Practices for This Project

### 1. Wait Strategies
```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Explicit waits for dynamic content
wait = WebDriverWait(driver, 10)
element = wait.until(EC.presence_of_element_located((By.ID, "myElement")))

# Wait for toasts
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-sonner-toast]")))

# Wait for page navigation
wait.until(EC.url_contains("/expected-path"))
```

### 2. Handling Dialogs
```python
# Wait for dialog to appear
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[role='dialog']")))

# Interact with dialog
dialog = driver.find_element(By.CSS_SELECTOR, "[role='dialog']")
dialog.find_element(By.XPATH, "//button[contains(text(), 'Confirm')]").click()

# Wait for dialog to close
wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, "[role='dialog']")))
```

### 3. Handling Loading States
```python
# Wait for loader to disappear
wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, ".animate-spin")))

# Wait for table data to load
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr")))
```

### 4. Screenshot on Failure
```python
try:
    # Test steps
    pass
except Exception as e:
    driver.save_screenshot(f"error_{test_name}_{timestamp}.png")
    raise e
```

### 5. Clean State Between Tests
```python
def tearDown(self):
    # Clear cookies/session
    driver.delete_all_cookies()
    
    # Navigate to logout
    driver.get("http://localhost:3000/login")
```

---

## Notes

- **Base URL**: `http://localhost:3000` (update for production)
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components
- **Toast Library**: Sonner
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### Important Considerations

1. **Dynamic Content**: Most pages load data asynchronously, use explicit waits
2. **Toast Messages**: Appear briefly, catch them with proper waits
3. **Dialogs**: Use `[role='dialog']` selector for modal dialogs
4. **Tables**: May have pagination, test with small datasets first
5. **Server Actions**: Form submissions use Next.js Server Actions (may take 1-2 seconds)
6. **Auto-sync**: Fines pages auto-sync on load, wait for this to complete

### Recommended Test Order

1. Authentication tests (login/register)
2. Navigation tests (sidebar, navbar)
3. Admin CRUD operations (add/edit/delete books, users)
4. Librarian workflows (approve requests, issue/return books)
5. Member workflows (browse, request, my books, return)
6. End-to-end flows
7. Edge cases and error handling

---

## Getting Started with Selenium

### Python Setup
```bash
pip install selenium
pip install webdriver-manager
```

### Basic Test Template
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Setup
driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

try:
    # Navigate
    driver.get("http://localhost:3000/login")
    
    # Login
    driver.find_element(By.ID, "email").send_keys("member@library.com")
    driver.find_element(By.ID, "password").send_keys("member123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    
    # Wait for redirect
    wait.until(EC.url_contains("/member"))
    
    # Assert
    assert "/member" in driver.current_url
    print("✅ Login successful")
    
finally:
    # Cleanup
    driver.quit()
```

---

**Last Updated**: November 6, 2025
