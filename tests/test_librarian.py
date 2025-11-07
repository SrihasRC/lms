"""
Simple Librarian Dashboard Tests
Tests librarian features like viewing requests and transactions
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

BASE_URL = "http://localhost:3000"
CHROME_BINARY = "/home/srihasrc/Music/lms/chrome-linux64/chrome"
CHROMEDRIVER_PATH = "/home/srihasrc/Music/lms/tests/drivers/chromedriver"

def get_driver():
    """Create and return a Chrome driver instance"""
    chrome_options = Options()
    chrome_options.binary_location = CHROME_BINARY
    service = Service(CHROMEDRIVER_PATH)
    return webdriver.Chrome(service=service, options=chrome_options)

def login_as_librarian(driver):
    """Helper function to login as librarian"""
    wait = WebDriverWait(driver, 10)
    driver.get(f"{BASE_URL}/login")
    driver.find_element(By.ID, "email").send_keys("librarian@lms.com")
    driver.find_element(By.ID, "password").send_keys("lib123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("/librarian"))

def test_librarian_dashboard():
    """Test librarian dashboard loads"""
    driver = get_driver()
    
    try:
        print("Testing librarian dashboard...")
        login_as_librarian(driver)
        
        # Check dashboard loaded
        title = driver.find_element(By.TAG_NAME, "h1")
        assert title.text != ""
        
        print("✅ Librarian dashboard loaded")
        
    except Exception as e:
        print(f"❌ Librarian dashboard test failed: {e}")
        driver.save_screenshot("error_librarian_dashboard.png")
    finally:
        driver.quit()

def test_view_requests():
    """Test viewing borrow requests page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing librarian requests page...")
        login_as_librarian(driver)
        
        driver.get(f"{BASE_URL}/librarian/requests")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/librarian/requests" in driver.current_url
        
        print("✅ Librarian requests page loaded")
        
    except Exception as e:
        print(f"❌ Librarian requests test failed: {e}")
        driver.save_screenshot("error_librarian_requests.png")
    finally:
        driver.quit()

def test_view_issue_page():
    """Test viewing issue books page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing librarian issue page...")
        login_as_librarian(driver)
        
        driver.get(f"{BASE_URL}/librarian/issue")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/librarian/issue" in driver.current_url
        
        print("✅ Librarian issue page loaded")
        
    except Exception as e:
        print(f"❌ Librarian issue test failed: {e}")
        driver.save_screenshot("error_librarian_issue.png")
    finally:
        driver.quit()

def test_view_return_page():
    """Test viewing return books page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing librarian return page...")
        login_as_librarian(driver)
        
        driver.get(f"{BASE_URL}/librarian/return")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/librarian/return" in driver.current_url
        
        print("✅ Librarian return page loaded")
        
    except Exception as e:
        print(f"❌ Librarian return test failed: {e}")
        driver.save_screenshot("error_librarian_return.png")
    finally:
        driver.quit()

def test_view_overdue_page():
    """Test viewing overdue books page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing librarian overdue page...")
        login_as_librarian(driver)
        
        driver.get(f"{BASE_URL}/librarian/overdue")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/librarian/overdue" in driver.current_url
        
        print("✅ Librarian overdue page loaded")
        
    except Exception as e:
        print(f"❌ Librarian overdue test failed: {e}")
        driver.save_screenshot("error_librarian_overdue.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("\n=== Running Librarian Tests ===\n")
    test_librarian_dashboard()
    test_view_requests()
    test_view_issue_page()
    test_view_return_page()
    test_view_overdue_page()
    print("\n=== Tests Complete ===\n")
