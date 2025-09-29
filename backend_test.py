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