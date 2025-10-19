# Library Management System - Test Cases

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | admin123 |
| Librarian | librarian@lms.com | lib123 |
| Member | m1@lms.com | mem1123 |

---

## Authentication Test Cases

| Test Case ID | Test Scenario | Test Steps | Test Data | Expected Results | Actual Results | Pass/Fail |
|-------------|---------------|------------|-----------|------------------|----------------|-----------|
| TC01 | Admin Login with Valid Credentials | 1. Go to /login<br>2. Enter Email<br>3. Enter Password<br>4. Click Sign In | Email: admin@lms.com<br>Password: admin123 | User should login and redirect to /admin dashboard | | |
| TC02 | Librarian Login with Valid Credentials | 1. Go to /login<br>2. Enter Email<br>3. Enter Password<br>4. Click Sign In | Email: librarian@lms.com<br>Password: lib123 | User should login and redirect to /librarian dashboard | | |
| TC03 | Member Login with Valid Credentials | 1. Go to /login<br>2. Enter Email<br>3. Enter Password<br>4. Click Sign In | Email: m1@lms.com<br>Password: mem1123 | User should login and redirect to /member dashboard | | |
| TC04 | Login with Invalid Credentials | 1. Go to /login<br>2. Enter Email<br>3. Enter Wrong Password<br>4. Click Sign In | Email: admin@lms.com<br>Password: wrongpass | Error message "Invalid credentials" should display | | |
| TC05 | Login with Empty Fields | 1. Go to /login<br>2. Leave fields empty<br>3. Click Sign In | Email: (empty)<br>Password: (empty) | Form validation error should appear | | |
| TC06 | Member Registration | 1. Go to /register<br>2. Fill all required fields<br>3. Click Create Account | Name: Test User<br>Email: test@test.com<br>Password: test123 | Success message and account created | | |
| TC07 | Logout Functionality | 1. Login as any user<br>2. Click user menu<br>3. Click Logout | Any valid credentials | User should logout and redirect to /login | | |

---

## Admin Dashboard Test Cases

| Test Case ID | Test Scenario | Test Steps | Test Data | Expected Results | Actual Results | Pass/Fail |
|-------------|---------------|------------|-----------|------------------|----------------|-----------|
| TC08 | View Admin Dashboard Stats | 1. Login as Admin<br>2. Go to /admin | Admin credentials | Dashboard shows: Total Books, Available Books, Total Members, Active Transactions | | |
| TC09 | Add New Book | 1. Login as Admin<br>2. Go to /admin/books<br>3. Click Add Book<br>4. Fill form<br>5. Click Submit | ISBN: 978-0-123456<br>Title: Test Book<br>Author: Test Author<br>Genre: Fiction<br>Copies: 5 | Book should be added successfully | | |
| TC10 | Edit Book Details | 1. Login as Admin<br>2. Go to /admin/books<br>3. Click Edit on a book<br>4. Modify details<br>5. Click Save | Update title to "Updated Book" | Book details should update successfully | | |
| TC11 | Delete Book | 1. Login as Admin<br>2. Go to /admin/books<br>3. Click Delete on a book<br>4. Confirm deletion | Select any book | Book should be deleted from system | | |
| TC12 | Search Books | 1. Login as Admin<br>2. Go to /admin/books<br>3. Enter search term<br>4. Press Enter | Search: "Harry Potter" | Matching books should display | | |
| TC13 | View All Users | 1. Login as Admin<br>2. Go to /admin/users | Admin credentials | All users with roles displayed in table | | |
| TC14 | Change User Role | 1. Login as Admin<br>2. Go to /admin/users<br>3. Select user<br>4. Change role dropdown<br>5. Confirm | Change member to librarian | User role should update successfully | | |
| TC15 | View All Transactions | 1. Login as Admin<br>2. Go to /admin/transactions | Admin credentials | All book transactions displayed with filters | | |
| TC16 | View All Reservations | 1. Login as Admin<br>2. Go to /admin/reservations | Admin credentials | All reservations displayed with status | | |
| TC17 | View All Fines | 1. Login as Admin<br>2. Go to /admin/fines | Admin credentials | All fines displayed with paid/unpaid status | | |

---

## Librarian Dashboard Test Cases

| Test Case ID | Test Scenario | Test Steps | Test Data | Expected Results | Actual Results | Pass/Fail |
|-------------|---------------|------------|-----------|------------------|----------------|-----------|
| TC18 | View Librarian Dashboard | 1. Login as Librarian<br>2. View dashboard | Librarian credentials | Dashboard shows pending requests, active loans, overdue books stats | | |
| TC19 | View Borrow Requests | 1. Login as Librarian<br>2. Go to /librarian/requests | Librarian credentials | All pending borrow requests displayed | | |
| TC20 | Approve Borrow Request | 1. Login as Librarian<br>2. Go to /librarian/requests<br>3. Click Approve on request<br>4. Confirm | Select pending request | Request approved and book issued to member | | |
| TC21 | Reject Borrow Request | 1. Login as Librarian<br>2. Go to /librarian/requests<br>3. Click Reject<br>4. Enter reason<br>5. Confirm | Reason: "Book damaged" | Request rejected with reason saved | | |
| TC22 | Reject Request without Reason | 1. Login as Librarian<br>2. Go to /librarian/requests<br>3. Click Reject<br>4. Leave reason empty<br>5. Confirm | Reason: (empty) | Default rejection reason applied | | |
| TC23 | Issue Book Manually | 1. Login as Librarian<br>2. Go to /librarian/issue<br>3. Search member<br>4. Search book<br>5. Select due date<br>6. Click Issue | Member: m1@lms.com<br>Book: Any available<br>Due: 14 days | Book issued successfully | | |
| TC24 | Issue Book to Non-existent Member | 1. Login as Librarian<br>2. Go to /librarian/issue<br>3. Search invalid member | Member: invalid@test.com | Error: Member not found | | |
| TC25 | Issue Unavailable Book | 1. Login as Librarian<br>2. Go to /librarian/issue<br>3. Try to issue book with 0 copies | Book with 0 available copies | Error: Book not available | | |
| TC26 | Return Book | 1. Login as Librarian<br>2. Go to /librarian/return<br>3. Search transaction<br>4. Click Return | Active transaction | Book returned, fine calculated if overdue | | |
| TC27 | Return Overdue Book | 1. Login as Librarian<br>2. Go to /librarian/return<br>3. Return overdue book | Overdue transaction | Fine calculated and displayed | | |
| TC28 | View All Transactions | 1. Login as Librarian<br>2. Go to /librarian/transactions<br>3. Apply filters | Filter: All/Issued/Returned | Transactions filtered correctly | | |
| TC29 | View Reservations | 1. Login as Librarian<br>2. Go to /librarian/reservations | Librarian credentials | Pending and fulfilled reservations displayed | | |
| TC30 | Fulfill Reservation | 1. Login as Librarian<br>2. Go to /librarian/reservations<br>3. Click Fulfill<br>4. Confirm | Pending reservation | Reservation marked as fulfilled | | |
| TC31 | Cancel Reservation | 1. Login as Librarian<br>2. Go to /librarian/reservations<br>3. Click Cancel<br>4. Confirm | Pending reservation | Reservation cancelled | | |
| TC32 | View Overdue Books | 1. Login as Librarian<br>2. Go to /librarian/overdue | Librarian credentials | All overdue books with fine details | | |

---

## Member Dashboard Test Cases

| Test Case ID | Test Scenario | Test Steps | Test Data | Expected Results | Actual Results | Pass/Fail |
|-------------|---------------|------------|-----------|------------------|----------------|-----------|
| TC33 | View Member Dashboard | 1. Login as Member<br>2. View dashboard | Member credentials | Dashboard shows borrowed books, pending requests, fines stats | | |
| TC34 | Browse Books | 1. Login as Member<br>2. Go to /member/books | Member credentials | All available books displayed in grid | | |
| TC35 | Search Books | 1. Login as Member<br>2. Go to /member/books<br>3. Enter search term | Search: "Fiction" | Matching books displayed | | |
| TC36 | Filter Books by Genre | 1. Login as Member<br>2. Go to /member/books<br>3. Select genre filter | Genre: Mystery | Only mystery books displayed | | |
| TC37 | Filter Books by Availability | 1. Login as Member<br>2. Go to /member/books<br>3. Select availability filter | Filter: Available | Only available books shown | | |
| TC38 | Request Available Book | 1. Login as Member<br>2. Go to /member/books<br>3. Click Request on available book | Any available book | Borrow request created successfully | | |
| TC39 | Reserve Unavailable Book | 1. Login as Member<br>2. Go to /member/books<br>3. Click Reserve on unavailable book | Book with 0 copies | Reservation created with queue position | | |
| TC40 | Request Already Borrowed Book | 1. Login as Member<br>2. Try to request already borrowed book | Book already issued | Error: Already have this book | | |
| TC41 | View My Requests | 1. Login as Member<br>2. Go to /member/requests | Member credentials | All borrow requests with status shown | | |
| TC42 | Cancel Pending Request | 1. Login as Member<br>2. Go to /member/requests<br>3. Click Cancel on pending request | Pending request | Request cancelled successfully | | |
| TC43 | Cancel Approved Request | 1. Login as Member<br>2. Go to /member/requests<br>3. Try to cancel approved request | Approved request | Cancel button disabled or error shown | | |
| TC44 | View My Books | 1. Login as Member<br>2. Go to /member/my-books | Member credentials | Currently borrowed books displayed | | |
| TC45 | View Overdue Warning | 1. Login as Member with overdue book<br>2. Go to /member/my-books | Member with overdue book | Warning banner displayed with fine | | |
| TC46 | View Borrowing History | 1. Login as Member<br>2. Go to /member/history | Member credentials | Complete transaction history displayed | | |
| TC47 | View Reservations | 1. Login as Member<br>2. Go to /member/reservations | Member credentials | Active reservations with queue position | | |
| TC48 | Cancel Reservation | 1. Login as Member<br>2. Go to /member/reservations<br>3. Click Cancel | Active reservation | Reservation cancelled | | |
| TC49 | View Fines | 1. Login as Member<br>2. Go to /member/fines | Member credentials | All fines (paid/unpaid) displayed | | |
| TC50 | Pay Fine | 1. Login as Member<br>2. Go to /member/fines<br>3. Click Pay on unpaid fine<br>4. Confirm | Unpaid fine | Fine marked as paid | | |

---

## Edge Cases & Negative Test Cases

| Test Case ID | Test Scenario | Test Steps | Test Data | Expected Results | Actual Results | Pass/Fail |
|-------------|---------------|------------|-----------|------------------|----------------|-----------|
| TC51 | Access Admin Page as Member | 1. Login as Member<br>2. Manually go to /admin URL | Member credentials | Access denied, redirect to /member | | |
| TC52 | Access Librarian Page as Member | 1. Login as Member<br>2. Manually go to /librarian URL | Member credentials | Access denied, redirect to /member | | |
| TC53 | Access Member Page as Admin | 1. Login as Admin<br>2. Manually go to /member URL | Admin credentials | Access denied, redirect to /admin | | |
| TC54 | Add Book with Duplicate ISBN | 1. Login as Admin<br>2. Try to add book with existing ISBN | ISBN: 978-existing | Error: ISBN already exists | | |
| TC55 | Add Book with Negative Copies | 1. Login as Admin<br>2. Try to add book with -5 copies | Copies: -5 | Validation error: Must be positive | | |
| TC56 | Issue Book with Past Due Date | 1. Login as Librarian<br>2. Try to issue book with past date | Due date: Yesterday | Error: Invalid due date | | |
| TC57 | Multiple Concurrent Requests | 1. Login as Member<br>2. Rapidly click Request multiple times | Same book, multiple clicks | Only one request created | | |
| TC58 | Return Already Returned Book | 1. Login as Librarian<br>2. Try to return already returned book | Returned transaction | Error: Already returned | | |
| TC59 | XSS Attack in Book Title | 1. Login as Admin<br>2. Add book with script in title | Title: `<script>alert('xss')</script>` | Input sanitized, no script execution | | |
| TC60 | SQL Injection in Search | 1. Login as any user<br>2. Enter SQL injection in search | Search: `' OR '1'='1` | No SQL error, safe handling | | |

---

## Performance & Usability Test Cases

| Test Case ID | Test Scenario | Test Steps | Test Data | Expected Results | Actual Results | Pass/Fail |
|-------------|---------------|------------|-----------|------------------|----------------|-----------|
| TC61 | Dashboard Load Time | 1. Login as any user<br>2. Measure dashboard load time | Any credentials | Page loads within 2 seconds | | |
| TC62 | Search Response Time | 1. Go to books page<br>2. Enter search term<br>3. Measure response time | Search: Any term | Results appear within 1 second | | |
| TC63 | Large Dataset Handling | 1. View books/transactions with 100+ records | Large dataset | Pagination or smooth scroll, no lag | | |
| TC64 | Mobile Responsiveness | 1. Open site on mobile<br>2. Test all features | Mobile device | All features work, UI is responsive | | |
| TC65 | Browser Compatibility | 1. Test on Chrome, Firefox, Safari | Different browsers | Consistent behavior across browsers | | |

---

## Notes

- All test cases should be executed after running the database migration for borrow_requests table
- Ensure test environment has sample books and users populated
- Document any bugs found with screenshots and error messages
- Retest failed cases after fixes
- Perform regression testing after major changes

---

## Test Execution Summary

**Total Test Cases:** 65  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___  
**Not Executed:** ___  

**Test Execution Date:** ___________  
**Tested By:** ___________  
**Environment:** ___________  

---

## Bug Report Template

If you find any bugs during testing, use this format:

**Bug ID:** BUG-XXX  
**Test Case ID:** TC-XX  
**Severity:** Critical / High / Medium / Low  
**Description:** Brief description of the bug  
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:** What should happen  
**Actual Result:** What actually happened  
**Screenshots:** Attach if applicable  
**Browser/Device:** Chrome 118 / Mobile Safari, etc.  
**Status:** Open / In Progress / Resolved / Closed
