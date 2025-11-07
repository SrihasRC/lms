"""
Simple Authentication Tests
Tests login and registration functionality
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

# Configuration
BASE_URL = "http://localhost:3000"
CHROME_BINARY = "/home/srihasrc/Music/lms/chrome-linux64/chrome"
CHROMEDRIVER_PATH = "/home/srihasrc/Music/lms/tests/drivers/chromedriver"

def get_driver():
    """Create and return a Chrome driver instance"""
    chrome_options = Options()
    chrome_options.binary_location = CHROME_BINARY
    service = Service(CHROMEDRIVER_PATH)
    return webdriver.Chrome(service=service, options=chrome_options)

def test_login_admin():
    """Test admin login"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing admin login...")
        
        # Navigate to login
        driver.get(f"{BASE_URL}/login")
        
        # Fill credentials
        driver.find_element(By.ID, "email").send_keys("admin@lms.com")
        driver.find_element(By.ID, "password").send_keys("admin123")
        
        # Submit
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        # Wait for redirect to admin dashboard
        wait.until(EC.url_contains("/admin"))
        
        # Verify we're on admin page
        assert "/admin" in driver.current_url
        print("✅ Admin login successful")
        
    except Exception as e:
        print(f"❌ Admin login failed: {e}")
        driver.save_screenshot("error_admin_login.png")
    finally:
        driver.quit()

def test_login_librarian():
    """Test librarian login"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing librarian login...")
        
        driver.get(f"{BASE_URL}/login")
        
        driver.find_element(By.ID, "email").send_keys("librarian@lms.com")
        driver.find_element(By.ID, "password").send_keys("lib123")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        wait.until(EC.url_contains("/librarian"))
        
        assert "/librarian" in driver.current_url
        print("✅ Librarian login successful")
        
    except Exception as e:
        print(f"❌ Librarian login failed: {e}")
        driver.save_screenshot("error_librarian_login.png")
    finally:
        driver.quit()

def test_login_member():
    """Test member login"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing member login...")
        
        driver.get(f"{BASE_URL}/login")
        
        driver.find_element(By.ID, "email").send_keys("m1@lms.com")
        driver.find_element(By.ID, "password").send_keys("mem1123")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        wait.until(EC.url_contains("/member"))
        
        assert "/member" in driver.current_url
        print("✅ Member login successful")
        
    except Exception as e:
        print(f"❌ Member login failed: {e}")
        driver.save_screenshot("error_member_login.png")
    finally:
        driver.quit()

def test_login_invalid():
    """Test login with invalid credentials"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing invalid login...")
        
        driver.get(f"{BASE_URL}/login")
        
        driver.find_element(By.ID, "email").send_keys("invalid@test.com")
        driver.find_element(By.ID, "password").send_keys("wrongpassword")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        # Wait a bit for error message
        time.sleep(2)
        
        # Should still be on login page
        assert "/login" in driver.current_url
        print("✅ Invalid login correctly rejected")
        
    except Exception as e:
        print(f"❌ Invalid login test failed: {e}")
        driver.save_screenshot("error_invalid_login.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("\n=== Running Authentication Tests ===\n")
    test_login_admin()
    test_login_librarian()
    test_login_member()
    test_login_invalid()
    print("\n=== Tests Complete ===\n")
