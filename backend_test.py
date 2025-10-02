import requests
import sys
import json
from datetime import datetime

class ICAABackendTester:
    def __init__(self, base_url="https://alumni-community.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_ids = {}  # Store created resource IDs for cleanup/reference

    def log_test(self, name, success, status_code=None, error=None, response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - Status: {status_code}")
        else:
            print(f"❌ {name} - Status: {status_code}, Error: {error}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "status_code": status_code,
            "error": error,
            "response_data": response_data
        })

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/")
            success = response.status_code == 200
            self.log_test("Root API Endpoint", success, response.status_code, 
                         None if success else response.text, 
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Root API Endpoint", False, None, str(e))
            return False

    def test_create_news_post(self):
        """Test creating a news post"""
        try:
            test_news = {
                "title": "Test News Article",
                "excerpt": "This is a test news article excerpt",
                "content": "This is the full content of the test news article for ICAA testing.",
                "author": "Test Author"
            }
            
            response = requests.post(f"{self.api_url}/news", json=test_news)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.created_ids['news_id'] = data.get('id')
            
            self.log_test("Create News Post", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Create News Post", False, None, str(e))
            return False

    def test_get_news_posts(self):
        """Test getting news posts"""
        try:
            response = requests.get(f"{self.api_url}/news")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                print(f"   Found {len(data)} news articles")
            
            self.log_test("Get News Posts", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(data)} articles" if success else None)
            return success
        except Exception as e:
            self.log_test("Get News Posts", False, None, str(e))
            return False

    def test_get_specific_news_post(self):
        """Test getting a specific news post"""
        if 'news_id' not in self.created_ids:
            self.log_test("Get Specific News Post", False, None, "No news ID available")
            return False
            
        try:
            news_id = self.created_ids['news_id']
            response = requests.get(f"{self.api_url}/news/{news_id}")
            success = response.status_code == 200
            
            self.log_test("Get Specific News Post", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Get Specific News Post", False, None, str(e))
            return False

    def test_submit_contact_form(self):
        """Test submitting a contact form"""
        try:
            test_contact = {
                "name": "Test User",
                "email": "test@example.com",
                "subject": "Test Contact Form",
                "message": "This is a test message from the backend testing suite."
            }
            
            response = requests.post(f"{self.api_url}/contact", json=test_contact)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.created_ids['contact_id'] = data.get('id')
            
            self.log_test("Submit Contact Form", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Submit Contact Form", False, None, str(e))
            return False

    def test_get_contact_forms(self):
        """Test getting contact forms"""
        try:
            response = requests.get(f"{self.api_url}/contact")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                print(f"   Found {len(data)} contact forms")
            
            self.log_test("Get Contact Forms", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(data)} contact forms" if success else None)
            return success
        except Exception as e:
            self.log_test("Get Contact Forms", False, None, str(e))
            return False

    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        try:
            test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
            
            response = requests.post(f"{self.api_url}/newsletter/subscribe", 
                                   json={"email": test_email})
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.created_ids['subscriber_id'] = data.get('id')
            
            self.log_test("Newsletter Subscription", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Newsletter Subscription", False, None, str(e))
            return False

    def test_get_newsletter_subscribers(self):
        """Test getting newsletter subscribers"""
        try:
            response = requests.get(f"{self.api_url}/newsletter/subscribers")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                print(f"   Found {len(data)} newsletter subscribers")
            
            self.log_test("Get Newsletter Subscribers", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(data)} subscribers" if success else None)
            return success
        except Exception as e:
            self.log_test("Get Newsletter Subscribers", False, None, str(e))
            return False

    def test_create_free_member(self):
        """Test creating a free member"""
        try:
            test_member = {
                "name": "Test Free Member",
                "email": f"free_member_{datetime.now().strftime('%H%M%S')}@example.com",
                "membership_tier": "free"
            }
            
            response = requests.post(f"{self.api_url}/members", json=test_member)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.created_ids['member_id'] = data.get('id')
            
            self.log_test("Create Free Member", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Create Free Member", False, None, str(e))
            return False

    def test_get_members(self):
        """Test getting members"""
        try:
            response = requests.get(f"{self.api_url}/members")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                print(f"   Found {len(data)} members")
            
            self.log_test("Get Members", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(data)} members" if success else None)
            return success
        except Exception as e:
            self.log_test("Get Members", False, None, str(e))
            return False

    def test_get_specific_member(self):
        """Test getting a specific member"""
        if 'member_id' not in self.created_ids:
            self.log_test("Get Specific Member", False, None, "No member ID available")
            return False
            
        try:
            member_id = self.created_ids['member_id']
            response = requests.get(f"{self.api_url}/members/{member_id}")
            success = response.status_code == 200
            
            self.log_test("Get Specific Member", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Get Specific Member", False, None, str(e))
            return False

    def test_create_free_checkout_session(self):
        """Test creating a checkout session for free membership"""
        try:
            test_checkout = {
                "membership_tier": "free",
                "user_email": f"checkout_test_{datetime.now().strftime('%H%M%S')}@example.com",
                "user_name": "Test Checkout User"
            }
            
            response = requests.post(f"{self.api_url}/payments/create-checkout-session", 
                                   json=test_checkout)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                print(f"   Free membership response: {data.get('message', 'No message')}")
            
            self.log_test("Create Free Checkout Session", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Create Free Checkout Session", False, None, str(e))
            return False

    def test_create_paid_checkout_session(self):
        """Test creating a checkout session for paid membership"""
        try:
            test_checkout = {
                "membership_tier": "active_monthly",
                "user_email": f"paid_test_{datetime.now().strftime('%H%M%S')}@example.com",
                "user_name": "Test Paid User"
            }
            
            response = requests.post(f"{self.api_url}/payments/create-checkout-session", 
                                   json=test_checkout)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.created_ids['session_id'] = data.get('session_id')
                print(f"   Checkout URL created: {bool(data.get('checkout_url'))}")
            
            self.log_test("Create Paid Checkout Session", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Create Paid Checkout Session", False, None, str(e))
            return False

    def test_checkout_status(self):
        """Test getting checkout status"""
        if 'session_id' not in self.created_ids:
            self.log_test("Get Checkout Status", False, None, "No session ID available")
            return False
            
        try:
            session_id = self.created_ids['session_id']
            response = requests.get(f"{self.api_url}/payments/checkout-status/{session_id}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                print(f"   Payment status: {data.get('payment_status', 'Unknown')}")
            
            self.log_test("Get Checkout Status", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Get Checkout Status", False, None, str(e))
            return False

    def test_get_products(self):
        """Test getting all products and verify printful_url field"""
        try:
            response = requests.get(f"{self.api_url}/products")
            success = response.status_code == 200
            
            if success:
                products = response.json()
                print(f"   Found {len(products)} products")
                
                # Verify all products have printful_url field populated
                products_without_printful_url = []
                for product in products:
                    if not product.get('printful_url'):
                        products_without_printful_url.append(product.get('name', 'Unknown'))
                
                if products_without_printful_url:
                    error_msg = f"Products missing printful_url: {', '.join(products_without_printful_url)}"
                    self.log_test("Get Products - Printful URL Check", False, response.status_code, error_msg)
                    return False
                else:
                    print(f"   ✅ All products have printful_url field populated")
                    
                # Store product IDs for individual testing
                self.created_ids['product_ids'] = [p.get('id') for p in products]
                self.created_ids['products_data'] = products
            
            self.log_test("Get Products", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(products)} products, all with printful_url" if success else None)
            return success
        except Exception as e:
            self.log_test("Get Products", False, None, str(e))
            return False

    def test_get_specific_product(self):
        """Test getting specific products and verify printful_url is returned"""
        if 'product_ids' not in self.created_ids or not self.created_ids['product_ids']:
            self.log_test("Get Specific Product", False, None, "No product IDs available")
            return False
            
        try:
            # Test first product
            product_id = self.created_ids['product_ids'][0]
            response = requests.get(f"{self.api_url}/products/{product_id}")
            success = response.status_code == 200
            
            if success:
                product = response.json()
                if not product.get('printful_url'):
                    error_msg = f"Product {product.get('name', 'Unknown')} missing printful_url"
                    self.log_test("Get Specific Product - Printful URL Check", False, response.status_code, error_msg)
                    return False
                else:
                    print(f"   ✅ Product '{product.get('name')}' has printful_url: {product.get('printful_url')}")
            
            self.log_test("Get Specific Product", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Get Specific Product", False, None, str(e))
            return False

    def test_key_products_data_integrity(self):
        """Test specific key products for data integrity"""
        if 'products_data' not in self.created_ids:
            self.log_test("Key Products Data Integrity", False, None, "No products data available")
            return False
            
        try:
            products = self.created_ids['products_data']
            
            # Expected key products with their printful URLs
            expected_products = {
                "ICAA Logo Hat": "https://icaa-merch.printful.me/product/icaa-logo-hat-white",
                "Black Hoodie with ICAA Logo": "https://icaa-merch.printful.me/product/icaa-logo-eco-hoodie-black",
                "ICAA Water Bottle": "https://icaa-merch.printful.me/product/icaa-logo-wide-mouth-plastic-water-bottle"
            }
            
            found_products = {}
            missing_products = []
            incorrect_urls = []
            
            # Check each expected product
            for expected_name, expected_url in expected_products.items():
                found = False
                for product in products:
                    product_name = product.get('name', '')
                    if expected_name in product_name or product_name in expected_name:
                        found_products[expected_name] = product
                        found = True
                        
                        # Verify printful_url matches expected
                        actual_url = product.get('printful_url', '')
                        if actual_url != expected_url:
                            incorrect_urls.append(f"{product_name}: expected {expected_url}, got {actual_url}")
                        else:
                            print(f"   ✅ {product_name}: printful_url correct")
                        break
                
                if not found:
                    missing_products.append(expected_name)
            
            # Report results
            success = len(missing_products) == 0 and len(incorrect_urls) == 0
            
            if missing_products:
                error_msg = f"Missing products: {', '.join(missing_products)}"
                self.log_test("Key Products Data Integrity", False, 200, error_msg)
                return False
            
            if incorrect_urls:
                error_msg = f"Incorrect URLs: {'; '.join(incorrect_urls)}"
                self.log_test("Key Products Data Integrity", False, 200, error_msg)
                return False
            
            self.log_test("Key Products Data Integrity", success, 200, None,
                         f"All {len(expected_products)} key products found with correct printful_urls")
            return success
            
        except Exception as e:
            self.log_test("Key Products Data Integrity", False, None, str(e))
            return False

    def test_products_filtering(self):
        """Test products endpoint filtering functionality"""
        try:
            # Test category filtering
            response = requests.get(f"{self.api_url}/products?category=apparel")
            success = response.status_code == 200
            
            if success:
                products = response.json()
                print(f"   Found {len(products)} apparel products")
                
                # Verify all returned products are apparel category
                non_apparel = [p.get('name') for p in products if p.get('category') != 'apparel']
                if non_apparel:
                    error_msg = f"Non-apparel products in apparel filter: {', '.join(non_apparel)}"
                    self.log_test("Products Filtering - Category", False, response.status_code, error_msg)
                    return False
            
            # Test active_only filtering
            response2 = requests.get(f"{self.api_url}/products?active_only=false")
            success2 = response2.status_code == 200
            
            if success2:
                all_products = response2.json()
                print(f"   Found {len(all_products)} total products (including inactive)")
            
            overall_success = success and success2
            self.log_test("Products Filtering", overall_success, 
                         response.status_code if success else response2.status_code,
                         None if overall_success else "Filtering tests failed",
                         f"Category and active filtering working" if overall_success else None)
            return overall_success
            
        except Exception as e:
            self.log_test("Products Filtering", False, None, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting ICAA Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Test basic connectivity
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - stopping tests")
            return False
        
        # Test news endpoints
        self.test_create_news_post()
        self.test_get_news_posts()
        self.test_get_specific_news_post()
        
        # Test contact endpoints
        self.test_submit_contact_form()
        self.test_get_contact_forms()
        
        # Test newsletter endpoints
        self.test_newsletter_subscription()
        self.test_get_newsletter_subscribers()
        
        # Test member endpoints
        self.test_create_free_member()
        self.test_get_members()
        self.test_get_specific_member()
        
        # Test payment endpoints
        self.test_create_free_checkout_session()
        self.test_create_paid_checkout_session()
        self.test_checkout_status()
        
        # Test product endpoints (Printful integration focus)
        print("\n🛍️  Testing Product/Printful Integration:")
        self.test_get_products()
        self.test_get_specific_product()
        self.test_key_products_data_integrity()
        self.test_products_filtering()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check logs above")
            return False

def main():
    tester = ICAABackendTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0,
            'test_results': tester.test_results,
            'created_ids': tester.created_ids
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())