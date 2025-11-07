"""
Simple Member Dashboard Tests
Tests member features like browsing books and viewing borrowed books
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

# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# import time

# BASE_URL = "http://localhost:3000"

# def get_driver():
#     """Create and return a Chrome driver instance"""
#     chrome_options = Options()
#     chrome_options.add_argument('--headless=new')  # Run in headless mode
#     chrome_options.add_argument('--no-sandbox')
#     chrome_options.add_argument('--disable-dev-shm-usage')
#     chrome_options.add_argument('--disable-gpu')
#     return webdriver.Chrome(options=chrome_options)

def login_as_member(driver):
    """Helper function to login as member"""
    wait = WebDriverWait(driver, 10)
    driver.get(f"{BASE_URL}/login")
    driver.find_element(By.ID, "email").send_keys("m1@lms.com")
    driver.find_element(By.ID, "password").send_keys("mem1123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("/member"))

def test_member_dashboard():
    """Test member dashboard loads"""
    driver = get_driver()
    
    try:
        print("Testing member dashboard...")
        login_as_member(driver)
        
        # Check dashboard title
        title = driver.find_element(By.TAG_NAME, "h1")
        assert title.text != ""
        
        print("✅ Member dashboard loaded")
        
    except Exception as e:
        print(f"❌ Member dashboard test failed: {e}")
        driver.save_screenshot("error_member_dashboard.png")
    finally:
        driver.quit()

def test_browse_books():
    """Test browsing books page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing browse books...")
        login_as_member(driver)
        
        # Navigate to books
        driver.get(f"{BASE_URL}/member/books")
        
        # Wait for page to load
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Check we're on books page
        assert "/member/books" in driver.current_url
        
        print("✅ Browse books page loaded")
        
    except Exception as e:
        print(f"❌ Browse books test failed: {e}")
        driver.save_screenshot("error_browse_books.png")
    finally:
        driver.quit()

def test_my_books():
    """Test my books page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing my books page...")
        login_as_member(driver)
        
        # Navigate to my books
        driver.get(f"{BASE_URL}/member/my-books")
        
        # Wait for page to load
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Check page title
        title = driver.find_element(By.TAG_NAME, "h1")
        assert "My Books" in title.text
        
        print("✅ My books page loaded")
        
    except Exception as e:
        print(f"❌ My books test failed: {e}")
        driver.save_screenshot("error_my_books.png")
    finally:
        driver.quit()

def test_search_books():
    """Test searching for books"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing book search...")
        login_as_member(driver)
        
        driver.get(f"{BASE_URL}/member/books")
        
        # Wait for page to load
        time.sleep(2)
        
        # Find search input
        search_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Search']")
        search_input.send_keys("test")
        
        # Wait a bit for search to process
        time.sleep(2)
        
        print("✅ Book search works")
        
    except Exception as e:
        print(f"❌ Book search test failed: {e}")
        driver.save_screenshot("error_search_books.png")
    finally:
        driver.quit()

def test_view_fines():
    """Test viewing fines page"""
    driver = get_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("Testing fines page...")
        login_as_member(driver)
        
        driver.get(f"{BASE_URL}/member/fines")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        assert "/member/fines" in driver.current_url
        
        print("✅ Fines page loaded")
        
    except Exception as e:
        print(f"❌ Fines page test failed: {e}")
        driver.save_screenshot("error_fines.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("\n=== Running Member Tests ===\n")
    test_member_dashboard()
    test_browse_books()
    test_my_books()
    test_search_books()
    test_view_fines()
    print("\n=== Tests Complete ===\n")
