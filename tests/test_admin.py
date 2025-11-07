"""
Simple Admin Dashboard Tests
Tests admin features like viewing books and users
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

def login_as_admin(driver):
    """Helper function to login as admin"""
    wait = WebDriverWait(driver, 15)
    driver.get(f"{BASE_URL}/login")
    driver.find_element(By.ID, "email").send_keys("admin@lms.com")
    driver.find_element(By.ID, "password").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("/admin"))

def test_admin_dashboard():
    """Test admin dashboard loads"""
    driver = get_driver()
    wait = WebDriverWait(driver, 15)
    
    try:
        print("Testing admin dashboard...")
        login_as_admin(driver)
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        title = driver.find_element(By.TAG_NAME, "h1")
        print(f"  Found title: '{title.text}'")
        
        print("✅ Admin dashboard loaded")
        
    except Exception as e:
        print(f"❌ Admin dashboard test failed: {e}")
        driver.save_screenshot("error_admin_dashboard.png")
        print(f"  Screenshot saved to error_admin_dashboard.png")
    finally:
        driver.quit()

def test_view_books():
    """Test viewing books page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 15)
    
    try:
        print("Testing admin books page...")
        login_as_admin(driver)
        
        driver.get(f"{BASE_URL}/admin/books")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/admin/books" in driver.current_url
        print(f"  On correct page: {driver.current_url}")
        
        print("✅ Admin books page loaded")
        
    except Exception as e:
        print(f"❌ Admin books test failed: {e}")
        driver.save_screenshot("error_admin_books.png")
        print(f"  Screenshot saved to error_admin_books.png")
    finally:
        driver.quit()

def test_view_users():
    """Test viewing users page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 15)
    
    try:
        print("Testing admin users page...")
        login_as_admin(driver)
        
        driver.get(f"{BASE_URL}/admin/users")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/admin/users" in driver.current_url
        print(f"  On correct page: {driver.current_url}")
        
        print("✅ Admin users page loaded")
        
    except Exception as e:
        print(f"❌ Admin users test failed: {e}")
        driver.save_screenshot("error_admin_users.png")
        print(f"  Screenshot saved to error_admin_users.png")
    finally:
        driver.quit()

def test_view_transactions():
    """Test viewing transactions page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 15)
    
    try:
        print("Testing admin transactions page...")
        login_as_admin(driver)
        
        driver.get(f"{BASE_URL}/admin/transactions")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/admin/transactions" in driver.current_url
        print(f"  On correct page: {driver.current_url}")
        
        print("✅ Admin transactions page loaded")
        
    except Exception as e:
        print(f"❌ Admin transactions test failed: {e}")
        driver.save_screenshot("error_admin_transactions.png")
        print(f"  Screenshot saved to error_admin_transactions.png")
    finally:
        driver.quit()

def test_view_fines():
    """Test viewing fines page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 15)
    
    try:
        print("Testing admin fines page...")
        login_as_admin(driver)
        
        driver.get(f"{BASE_URL}/admin/fines")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/admin/fines" in driver.current_url
        print(f"  On correct page: {driver.current_url}")
        
        print("✅ Admin fines page loaded")
        
    except Exception as e:
        print(f"❌ Admin fines test failed: {e}")
        driver.save_screenshot("error_admin_fines.png")
        print(f"  Screenshot saved to error_admin_fines.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("\n=== Running Admin Tests ===\n")
    test_admin_dashboard()
    test_view_books()
    test_view_users()
    test_view_transactions()
    test_view_fines()
    print("\n=== Tests Complete ===\n")
