"""
Run all tests
Simple test runner that executes all test files
"""

import test_auth
import test_member
import test_admin
import test_librarian

def main():
    print("\n" + "="*50)
    print("    RUNNING ALL LMS SELENIUM TESTS")
    print("="*50 + "\n")
    
    # Authentication tests
    print("\n" + "-"*50)
    print("  AUTHENTICATION TESTS")
    print("-"*50)
    test_auth.test_login_admin()
    test_auth.test_login_librarian()
    test_auth.test_login_member()
    test_auth.test_login_invalid()
    
    # Member tests
    print("\n" + "-"*50)
    print("  MEMBER TESTS")
    print("-"*50)
    test_member.test_member_dashboard()
    test_member.test_browse_books()
    test_member.test_my_books()
    test_member.test_search_books()
    test_member.test_view_fines()
    
    # Admin tests
    print("\n" + "-"*50)
    print("  ADMIN TESTS")
    print("-"*50)
    test_admin.test_admin_dashboard()
    test_admin.test_view_books()
    test_admin.test_view_users()
    test_admin.test_view_transactions()
    test_admin.test_view_fines()
    
    # Librarian tests
    print("\n" + "-"*50)
    print("  LIBRARIAN TESTS")
    print("-"*50)
    test_librarian.test_librarian_dashboard()
    test_librarian.test_view_requests()
    test_librarian.test_view_issue_page()
    test_librarian.test_view_return_page()
    test_librarian.test_view_overdue_page()
    
    print("\n" + "="*50)
    print("    ALL TESTS COMPLETE")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
