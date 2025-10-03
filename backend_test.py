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

    # USER PROFILE MANAGEMENT TESTS
    def test_create_user(self):
        """Test creating a new user with comprehensive profile data"""
        try:
            test_user = {
                "name": "Alice Thompson",
                "email": f"alice.thompson_{datetime.now().strftime('%H%M%S')}@example.com",
                "bio": "Software engineer passionate about community building and technology innovation.",
                "interests": ["Web Development", "Machine Learning", "Community Building", "Mentorship"],
                "birthday": "1995-03-15",
                "cohort": "2024",
                "program_track": "Full Stack Development",
                "membership_tier": "active_monthly"
            }
            
            response = requests.post(f"{self.api_url}/users", json=test_user)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.created_ids['new_user_id'] = data.get('id')
                print(f"   Created user: {data.get('name')} (ID: {data.get('id')})")
                
                # Verify all fields are properly set
                required_fields = ['name', 'email', 'bio', 'interests', 'birthday', 'cohort', 'program_track']
                missing_fields = [field for field in required_fields if not data.get(field)]
                if missing_fields:
                    error_msg = f"Missing fields in created user: {', '.join(missing_fields)}"
                    self.log_test("Create User - Field Validation", False, response.status_code, error_msg)
                    return False
            
            self.log_test("Create User", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Create User", False, None, str(e))
            return False

    def test_get_all_users(self):
        """Test getting all users"""
        try:
            response = requests.get(f"{self.api_url}/users")
            success = response.status_code == 200
            
            if success:
                users = response.json()
                print(f"   Found {len(users)} users in system")
                
                # Store existing user IDs for further testing
                self.created_ids['existing_user_ids'] = [user.get('id') for user in users]
                
                # Verify expected test users exist
                expected_users = {
                    "54bee40c-826f-4aa5-b770-2242e397086f": "John Smith",
                    "bea1e00c-fcba-4b26-9a1d-9692aaebd841": "Sarah Johnson", 
                    "09fee5f9-2ad1-4c96-a756-75501616a704": "Marcus Williams"
                }
                
                found_users = {}
                for user in users:
                    user_id = user.get('id')
                    if user_id in expected_users:
                        found_users[user_id] = user.get('name')
                        print(f"   ✅ Found expected user: {user.get('name')} (ID: {user_id})")
                
                missing_users = set(expected_users.keys()) - set(found_users.keys())
                if missing_users:
                    print(f"   ⚠️  Missing expected users: {[expected_users[uid] for uid in missing_users]}")
            
            self.log_test("Get All Users", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(users)} users" if success else None)
            return success
        except Exception as e:
            self.log_test("Get All Users", False, None, str(e))
            return False

    def test_get_specific_users(self):
        """Test getting specific users by ID"""
        test_user_ids = [
            "54bee40c-826f-4aa5-b770-2242e397086f",  # John Smith
            "bea1e00c-fcba-4b26-9a1d-9692aaebd841",  # Sarah Johnson
            "09fee5f9-2ad1-4c96-a756-75501616a704"   # Marcus Williams
        ]
        
        expected_data = {
            "54bee40c-826f-4aa5-b770-2242e397086f": {
                "name": "John Smith",
                "cohort": "2023",
                "program_track": "Web Development"
            },
            "bea1e00c-fcba-4b26-9a1d-9692aaebd841": {
                "name": "Sarah Johnson", 
                "cohort": "2022",
                "program_track": "Data Analytics"
            },
            "09fee5f9-2ad1-4c96-a756-75501616a704": {
                "name": "Marcus Williams",
                "cohort": "2021", 
                "program_track": "UX/UI Design"
            }
        }
        
        all_success = True
        for user_id in test_user_ids:
            try:
                response = requests.get(f"{self.api_url}/users/{user_id}")
                success = response.status_code == 200
                
                if success:
                    user_data = response.json()
                    expected = expected_data.get(user_id, {})
                    
                    # Verify key profile data
                    name_match = user_data.get('name') == expected.get('name')
                    cohort_match = user_data.get('cohort') == expected.get('cohort')
                    track_match = user_data.get('program_track') == expected.get('program_track')
                    
                    if name_match and cohort_match and track_match:
                        print(f"   ✅ {user_data.get('name')}: Profile data verified")
                    else:
                        print(f"   ⚠️  {user_data.get('name')}: Profile data mismatch")
                        print(f"      Expected: {expected}")
                        print(f"      Got: name={user_data.get('name')}, cohort={user_data.get('cohort')}, track={user_data.get('program_track')}")
                else:
                    print(f"   ❌ Failed to get user {user_id}: {response.status_code}")
                    all_success = False
                
                self.log_test(f"Get User {user_id}", success, response.status_code,
                             None if success else response.text,
                             user_data.get('name') if success else None)
                
                if not success:
                    all_success = False
                    
            except Exception as e:
                self.log_test(f"Get User {user_id}", False, None, str(e))
                all_success = False
        
        return all_success

    def test_update_user_profile(self):
        """Test updating user profile data"""
        if 'new_user_id' not in self.created_ids:
            self.log_test("Update User Profile", False, None, "No user ID available for update")
            return False
            
        try:
            user_id = self.created_ids['new_user_id']
            update_data = {
                "bio": "Updated bio: Senior software engineer with expertise in full-stack development and team leadership.",
                "interests": ["Advanced Web Development", "Team Leadership", "Open Source", "AI/ML"],
                "cohort": "2024",
                "program_track": "Advanced Full Stack Development"
            }
            
            response = requests.put(f"{self.api_url}/users/{user_id}", json=update_data)
            success = response.status_code == 200
            
            if success:
                updated_user = response.json()
                print(f"   Updated user: {updated_user.get('name')}")
                
                # Verify updates were applied
                bio_updated = update_data['bio'] in updated_user.get('bio', '')
                interests_updated = set(update_data['interests']).issubset(set(updated_user.get('interests', [])))
                
                if not (bio_updated and interests_updated):
                    error_msg = "Profile updates not properly applied"
                    self.log_test("Update User Profile - Verification", False, response.status_code, error_msg)
                    return False
                else:
                    print(f"   ✅ Profile updates verified successfully")
            
            self.log_test("Update User Profile", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Update User Profile", False, None, str(e))
            return False

    def test_user_event_history(self):
        """Test getting user event registration history"""
        test_user_ids = [
            "54bee40c-826f-4aa5-b770-2242e397086f",  # John Smith
            "bea1e00c-fcba-4b26-9a1d-9692aaebd841",  # Sarah Johnson
        ]
        
        all_success = True
        for user_id in test_user_ids:
            try:
                response = requests.get(f"{self.api_url}/users/{user_id}/events")
                success = response.status_code == 200
                
                if success:
                    events = response.json()
                    print(f"   User {user_id}: Found {len(events)} event registrations")
                    
                    # Verify event data structure
                    for event_data in events:
                        required_fields = ['event', 'registration_status', 'registered_at']
                        missing_fields = [field for field in required_fields if field not in event_data]
                        if missing_fields:
                            error_msg = f"Missing fields in event data: {', '.join(missing_fields)}"
                            self.log_test(f"User Events Structure - {user_id}", False, response.status_code, error_msg)
                            all_success = False
                            break
                        
                        # Verify registration status is valid
                        valid_statuses = ['registered', 'waitlisted', 'cancelled']
                        if event_data.get('registration_status') not in valid_statuses:
                            error_msg = f"Invalid registration status: {event_data.get('registration_status')}"
                            self.log_test(f"User Events Status - {user_id}", False, response.status_code, error_msg)
                            all_success = False
                            break
                else:
                    print(f"   ❌ Failed to get events for user {user_id}: {response.status_code}")
                    all_success = False
                
                self.log_test(f"Get User Events - {user_id}", success, response.status_code,
                             None if success else response.text,
                             f"Found {len(events)} events" if success else None)
                
                if not success:
                    all_success = False
                    
            except Exception as e:
                self.log_test(f"Get User Events - {user_id}", False, None, str(e))
                all_success = False
        
        return all_success

    def test_profile_photo_upload(self):
        """Test profile photo upload functionality"""
        if 'new_user_id' not in self.created_ids:
            self.log_test("Profile Photo Upload", False, None, "No user ID available for photo upload")
            return False
            
        try:
            user_id = self.created_ids['new_user_id']
            
            # Create a simple test image file (1x1 pixel PNG)
            import base64
            import io
            
            # Minimal PNG data (1x1 transparent pixel)
            png_data = base64.b64decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=='
            )
            
            files = {
                'file': ('test_profile.png', io.BytesIO(png_data), 'image/png')
            }
            
            response = requests.post(f"{self.api_url}/users/{user_id}/upload-photo", files=files)
            success = response.status_code == 200
            
            if success:
                result = response.json()
                photo_url = result.get('photo_url')
                print(f"   Photo uploaded successfully: {photo_url}")
                
                # Verify the user profile was updated with photo URL
                user_response = requests.get(f"{self.api_url}/users/{user_id}")
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    if user_data.get('profile_photo_url') == photo_url:
                        print(f"   ✅ User profile updated with photo URL")
                    else:
                        error_msg = "User profile not updated with photo URL"
                        self.log_test("Profile Photo Upload - Profile Update", False, response.status_code, error_msg)
                        return False
            
            self.log_test("Profile Photo Upload", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Profile Photo Upload", False, None, str(e))
            return False

    def test_profile_data_integrity(self):
        """Test comprehensive profile data integrity across all fields"""
        try:
            # Test with comprehensive profile data
            test_user = {
                "name": "Emma Rodriguez",
                "email": f"emma.rodriguez_{datetime.now().strftime('%H%M%S')}@example.com",
                "bio": "Product manager with 8 years experience in tech startups. Passionate about user experience and data-driven decision making.",
                "interests": ["Product Management", "UX Research", "Data Analytics", "Startup Ecosystem", "Mentorship"],
                "birthday": "1990-07-22",
                "cohort": "2019",
                "program_track": "Product Management",
                "membership_tier": "lifetime"
            }
            
            # Create user
            response = requests.post(f"{self.api_url}/users", json=test_user)
            success = response.status_code == 200
            
            if not success:
                self.log_test("Profile Data Integrity - Create", False, response.status_code, response.text)
                return False
            
            created_user = response.json()
            user_id = created_user.get('id')
            
            # Verify all profile fields are correctly stored and retrieved
            get_response = requests.get(f"{self.api_url}/users/{user_id}")
            if get_response.status_code != 200:
                self.log_test("Profile Data Integrity - Retrieve", False, get_response.status_code, get_response.text)
                return False
            
            retrieved_user = get_response.json()
            
            # Check each field for integrity
            field_checks = {
                'name': test_user['name'] == retrieved_user.get('name'),
                'email': test_user['email'] == retrieved_user.get('email'),
                'bio': test_user['bio'] == retrieved_user.get('bio'),
                'interests': set(test_user['interests']) == set(retrieved_user.get('interests', [])),
                'birthday': test_user['birthday'] == retrieved_user.get('birthday'),
                'cohort': test_user['cohort'] == retrieved_user.get('cohort'),
                'program_track': test_user['program_track'] == retrieved_user.get('program_track'),
                'membership_tier': test_user['membership_tier'] == retrieved_user.get('membership_tier')
            }
            
            failed_fields = [field for field, passed in field_checks.items() if not passed]
            
            if failed_fields:
                error_msg = f"Data integrity failed for fields: {', '.join(failed_fields)}"
                print(f"   ❌ {error_msg}")
                for field in failed_fields:
                    print(f"      {field}: expected '{test_user.get(field)}', got '{retrieved_user.get(field)}'")
                self.log_test("Profile Data Integrity", False, 200, error_msg)
                return False
            else:
                print(f"   ✅ All profile fields maintain data integrity")
                
            # Test interest arrays specifically
            if len(retrieved_user.get('interests', [])) != len(test_user['interests']):
                error_msg = f"Interest array length mismatch: expected {len(test_user['interests'])}, got {len(retrieved_user.get('interests', []))}"
                self.log_test("Profile Data Integrity - Interests", False, 200, error_msg)
                return False
            
            # Test cohort/program track filtering potential
            print(f"   ✅ Cohort: {retrieved_user.get('cohort')}, Program Track: {retrieved_user.get('program_track')}")
            
            self.log_test("Profile Data Integrity", True, 200, None,
                         "All profile fields maintain data integrity")
            return True
            
        except Exception as e:
            self.log_test("Profile Data Integrity", False, None, str(e))
            return False

    # GROUP MESSAGING SYSTEM TESTS
    def test_get_user_chat_rooms(self):
        """Test getting user's accessible chat rooms (verified alumni only)"""
        # Test users (all verified alumni)
        test_users = [
            {"id": "54bee40c-826f-4aa5-b770-2242e397086f", "name": "John Smith", "cohort": "2023", "track": "Web Development"},
            {"id": "bea1e00c-fcba-4b26-9a1d-9692aaebd841", "name": "Sarah Johnson", "cohort": "2022", "track": "Data Analytics"},
            {"id": "09fee5f9-2ad1-4c96-a756-75501616a704", "name": "Marcus Williams", "cohort": "2021", "track": "UX/UI Design"}
        ]
        
        all_success = True
        for user in test_users:
            try:
                response = requests.get(f"{self.api_url}/chat-rooms?user_id={user['id']}")
                success = response.status_code == 200
                
                if success:
                    rooms = response.json()
                    print(f"   {user['name']}: Found {len(rooms)} accessible chat rooms")
                    
                    # Verify room types and access control
                    room_types = [room.get('room_type') for room in rooms]
                    expected_types = ['cohort', 'program_track']  # Should have access to these
                    
                    cohort_rooms = [r for r in rooms if r.get('room_type') == 'cohort' and r.get('cohort') == user['cohort']]
                    track_rooms = [r for r in rooms if r.get('room_type') == 'program_track' and r.get('program_track') == user['track']]
                    
                    print(f"      Cohort rooms: {len(cohort_rooms)}, Program track rooms: {len(track_rooms)}")
                    
                    # Store room IDs for message testing
                    if rooms:
                        self.created_ids[f'user_{user["id"]}_rooms'] = [r.get('id') for r in rooms]
                else:
                    print(f"   ❌ Failed to get chat rooms for {user['name']}: {response.status_code}")
                    if response.status_code == 403:
                        print(f"      Access denied - user may not be verified alumni")
                    all_success = False
                
                self.log_test(f"Get Chat Rooms - {user['name']}", success, response.status_code,
                             None if success else response.text,
                             f"Found {len(rooms)} rooms" if success else None)
                
                if not success:
                    all_success = False
                    
            except Exception as e:
                self.log_test(f"Get Chat Rooms - {user['name']}", False, None, str(e))
                all_success = False
        
        return all_success

    def test_create_custom_chat_room(self):
        """Test creating custom chat rooms (verified alumni only)"""
        try:
            # Use John Smith as creator (verified alumni)
            creator_id = "54bee40c-826f-4aa5-b770-2242e397086f"
            
            test_room = {
                "name": "Alumni Networking Hub",
                "description": "A space for alumni to network and share opportunities",
                "room_type": "custom",
                "participants": [
                    "54bee40c-826f-4aa5-b770-2242e397086f",  # John Smith
                    "bea1e00c-fcba-4b26-9a1d-9692aaebd841"   # Sarah Johnson
                ]
            }
            
            response = requests.post(f"{self.api_url}/chat-rooms?creator_id={creator_id}", json=test_room)
            success = response.status_code == 200
            
            if success:
                room_data = response.json()
                self.created_ids['custom_room_id'] = room_data.get('id')
                print(f"   Created custom room: {room_data.get('name')} (ID: {room_data.get('id')})")
                
                # Verify room properties
                required_fields = ['id', 'name', 'room_type', 'participants', 'created_by']
                missing_fields = [field for field in required_fields if not room_data.get(field)]
                if missing_fields:
                    error_msg = f"Missing fields in created room: {', '.join(missing_fields)}"
                    self.log_test("Create Custom Room - Field Validation", False, response.status_code, error_msg)
                    return False
                
                # Verify creator is in participants and admins
                if creator_id not in room_data.get('participants', []):
                    error_msg = "Creator not added to participants"
                    self.log_test("Create Custom Room - Creator Participation", False, response.status_code, error_msg)
                    return False
            
            self.log_test("Create Custom Chat Room", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Create Custom Chat Room", False, None, str(e))
            return False

    def test_get_room_messages(self):
        """Test getting messages from rooms with access control"""
        # Test with John Smith accessing his rooms
        user_id = "54bee40c-826f-4aa5-b770-2242e397086f"
        user_rooms_key = f'user_{user_id}_rooms'
        
        if user_rooms_key not in self.created_ids or not self.created_ids[user_rooms_key]:
            self.log_test("Get Room Messages", False, None, "No room IDs available for testing")
            return False
        
        try:
            room_id = self.created_ids[user_rooms_key][0]  # Test first available room
            
            response = requests.get(f"{self.api_url}/chat-rooms/{room_id}/messages?user_id={user_id}&limit=50")
            success = response.status_code == 200
            
            if success:
                messages = response.json()
                print(f"   Found {len(messages)} messages in room {room_id}")
                
                # Verify message structure if messages exist
                if messages:
                    first_message = messages[0]
                    required_fields = ['id', 'room_id', 'sender_id', 'sender_name', 'content', 'created_at']
                    missing_fields = [field for field in required_fields if field not in first_message]
                    if missing_fields:
                        error_msg = f"Missing fields in message: {', '.join(missing_fields)}"
                        self.log_test("Get Room Messages - Structure", False, response.status_code, error_msg)
                        return False
                    
                    # Verify messages are ordered (oldest first as per spec)
                    if len(messages) > 1:
                        first_time = messages[0].get('created_at')
                        last_time = messages[-1].get('created_at')
                        print(f"      Message ordering: {first_time} to {last_time}")
                
                # Test pagination
                if len(messages) >= 10:  # Test skip parameter if enough messages
                    page_response = requests.get(f"{self.api_url}/chat-rooms/{room_id}/messages?user_id={user_id}&limit=5&skip=5")
                    if page_response.status_code == 200:
                        page_messages = page_response.json()
                        print(f"      Pagination test: Got {len(page_messages)} messages with skip=5")
            
            self.log_test("Get Room Messages", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(messages)} messages" if success else None)
            return success
        except Exception as e:
            self.log_test("Get Room Messages", False, None, str(e))
            return False

    def test_get_direct_messages(self):
        """Test getting direct messages between users"""
        try:
            # Test direct messages between John Smith and Sarah Johnson
            user1_id = "54bee40c-826f-4aa5-b770-2242e397086f"  # John Smith
            user2_id = "bea1e00c-fcba-4b26-9a1d-9692aaebd841"  # Sarah Johnson
            
            response = requests.get(f"{self.api_url}/direct-messages?user_id={user1_id}&other_user_id={user2_id}&limit=50")
            success = response.status_code == 200
            
            if success:
                messages = response.json()
                print(f"   Found {len(messages)} direct messages between users")
                
                # Verify message structure if messages exist
                if messages:
                    first_message = messages[0]
                    required_fields = ['id', 'sender_id', 'receiver_id', 'sender_name', 'receiver_name', 'content', 'created_at']
                    missing_fields = [field for field in required_fields if field not in first_message]
                    if missing_fields:
                        error_msg = f"Missing fields in direct message: {', '.join(missing_fields)}"
                        self.log_test("Get Direct Messages - Structure", False, response.status_code, error_msg)
                        return False
                    
                    # Verify message participants are correct
                    for msg in messages:
                        sender = msg.get('sender_id')
                        receiver = msg.get('receiver_id')
                        if not ((sender == user1_id and receiver == user2_id) or (sender == user2_id and receiver == user1_id)):
                            error_msg = f"Invalid message participants: {sender} -> {receiver}"
                            self.log_test("Get Direct Messages - Participants", False, response.status_code, error_msg)
                            return False
                    
                    print(f"      ✅ All messages have correct participants")
            
            self.log_test("Get Direct Messages", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(messages)} direct messages" if success else None)
            return success
        except Exception as e:
            self.log_test("Get Direct Messages", False, None, str(e))
            return False

    def test_get_user_conversations(self):
        """Test getting conversation list with unread counts"""
        try:
            # Test with John Smith
            user_id = "54bee40c-826f-4aa5-b770-2242e397086f"
            
            response = requests.get(f"{self.api_url}/direct-messages/conversations?user_id={user_id}")
            success = response.status_code == 200
            
            if success:
                conversations = response.json()
                print(f"   Found {len(conversations)} conversations for user")
                
                # Verify conversation structure
                if conversations:
                    first_conv = conversations[0]
                    required_fields = ['other_user_id', 'other_user_name', 'latest_message', 'unread_count']
                    missing_fields = [field for field in required_fields if field not in first_conv]
                    if missing_fields:
                        error_msg = f"Missing fields in conversation: {', '.join(missing_fields)}"
                        self.log_test("Get Conversations - Structure", False, response.status_code, error_msg)
                        return False
                    
                    # Verify unread count is a number
                    for conv in conversations:
                        unread_count = conv.get('unread_count')
                        if not isinstance(unread_count, int) or unread_count < 0:
                            error_msg = f"Invalid unread count: {unread_count}"
                            self.log_test("Get Conversations - Unread Count", False, response.status_code, error_msg)
                            return False
                    
                    print(f"      ✅ All conversations have valid structure and unread counts")
            
            self.log_test("Get User Conversations", success, response.status_code,
                         None if success else response.text,
                         f"Found {len(conversations)} conversations" if success else None)
            return success
        except Exception as e:
            self.log_test("Get User Conversations", False, None, str(e))
            return False

    def test_user_online_status(self):
        """Test getting user online status"""
        test_user_ids = [
            "54bee40c-826f-4aa5-b770-2242e397086f",  # John Smith
            "bea1e00c-fcba-4b26-9a1d-9692aaebd841",  # Sarah Johnson
            "09fee5f9-2ad1-4c96-a756-75501616a704"   # Marcus Williams
        ]
        
        all_success = True
        for user_id in test_user_ids:
            try:
                response = requests.get(f"{self.api_url}/users/{user_id}/online-status")
                success = response.status_code == 200
                
                if success:
                    status_data = response.json()
                    print(f"   User {user_id}: Status = {status_data.get('status')}")
                    
                    # Verify status structure
                    required_fields = ['user_id', 'status']
                    missing_fields = [field for field in required_fields if field not in status_data]
                    if missing_fields:
                        error_msg = f"Missing fields in status: {', '.join(missing_fields)}"
                        self.log_test(f"User Status Structure - {user_id}", False, response.status_code, error_msg)
                        all_success = False
                        continue
                    
                    # Verify status value is valid
                    valid_statuses = ['online', 'offline', 'away']
                    if status_data.get('status') not in valid_statuses:
                        error_msg = f"Invalid status: {status_data.get('status')}"
                        self.log_test(f"User Status Value - {user_id}", False, response.status_code, error_msg)
                        all_success = False
                        continue
                else:
                    print(f"   ❌ Failed to get status for user {user_id}: {response.status_code}")
                    all_success = False
                
                self.log_test(f"Get User Status - {user_id}", success, response.status_code,
                             None if success else response.text,
                             status_data.get('status') if success else None)
                
                if not success:
                    all_success = False
                    
            except Exception as e:
                self.log_test(f"Get User Status - {user_id}", False, None, str(e))
                all_success = False
        
        return all_success

    def test_chat_image_upload(self):
        """Test image upload for chat"""
        try:
            # Test with John Smith (verified alumni)
            user_id = "54bee40c-826f-4aa5-b770-2242e397086f"
            
            # Create a simple test image file (1x1 pixel PNG)
            import base64
            import io
            
            # Minimal PNG data (1x1 transparent pixel)
            png_data = base64.b64decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=='
            )
            
            files = {
                'file': ('test_chat_image.png', io.BytesIO(png_data), 'image/png')
            }
            
            response = requests.post(f"{self.api_url}/chat-images/upload?user_id={user_id}", files=files)
            success = response.status_code == 200
            
            if success:
                result = response.json()
                image_url = result.get('image_url')
                print(f"   Chat image uploaded successfully: {image_url}")
                
                # Verify image URL format
                if not image_url or not image_url.startswith('/uploads/chat_images/'):
                    error_msg = f"Invalid image URL format: {image_url}"
                    self.log_test("Chat Image Upload - URL Format", False, response.status_code, error_msg)
                    return False
                
                self.created_ids['chat_image_url'] = image_url
            
            self.log_test("Chat Image Upload", success, response.status_code,
                         None if success else response.text,
                         response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Chat Image Upload", False, None, str(e))
            return False

    def test_access_control_non_verified_user(self):
        """Test access control - non-verified users should be denied"""
        try:
            # Create a non-verified user for testing
            test_user = {
                "name": "Non Verified User",
                "email": f"nonverified_{datetime.now().strftime('%H%M%S')}@example.com",
                "cohort": "2023",
                "program_track": "Web Development",
                "is_verified_alumni": False  # Not verified
            }
            
            # Create the user first
            create_response = requests.post(f"{self.api_url}/users", json=test_user)
            if create_response.status_code != 200:
                self.log_test("Access Control Test - User Creation", False, create_response.status_code, create_response.text)
                return False
            
            user_data = create_response.json()
            non_verified_user_id = user_data.get('id')
            
            # Test chat rooms access (should be denied)
            response = requests.get(f"{self.api_url}/chat-rooms?user_id={non_verified_user_id}")
            access_denied = response.status_code == 403
            
            if access_denied:
                print(f"   ✅ Non-verified user correctly denied access to chat rooms")
            else:
                error_msg = f"Non-verified user was granted access (status: {response.status_code})"
                self.log_test("Access Control - Chat Rooms", False, response.status_code, error_msg)
                return False
            
            # Test chat image upload (should be denied)
            import base64
            import io
            png_data = base64.b64decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=='
            )
            files = {
                'file': ('test.png', io.BytesIO(png_data), 'image/png')
            }
            
            upload_response = requests.post(f"{self.api_url}/chat-images/upload?user_id={non_verified_user_id}", files=files)
            upload_denied = upload_response.status_code == 403
            
            if upload_denied:
                print(f"   ✅ Non-verified user correctly denied chat image upload")
            else:
                error_msg = f"Non-verified user was granted upload access (status: {upload_response.status_code})"
                self.log_test("Access Control - Image Upload", False, upload_response.status_code, error_msg)
                return False
            
            self.log_test("Access Control - Non-Verified User", True, 403, None,
                         "Non-verified user correctly denied access to messaging features")
            return True
            
        except Exception as e:
            self.log_test("Access Control - Non-Verified User", False, None, str(e))
            return False

    def test_cohort_based_room_access(self):
        """Test cohort-based room access control"""
        try:
            # Test users from different cohorts
            test_users = [
                {"id": "54bee40c-826f-4aa5-b770-2242e397086f", "name": "John Smith", "cohort": "2023"},
                {"id": "bea1e00c-fcba-4b26-9a1d-9692aaebd841", "name": "Sarah Johnson", "cohort": "2022"},
                {"id": "09fee5f9-2ad1-4c96-a756-75501616a704", "name": "Marcus Williams", "cohort": "2021"}
            ]
            
            all_success = True
            for user in test_users:
                # Get user's accessible rooms
                response = requests.get(f"{self.api_url}/chat-rooms?user_id={user['id']}")
                if response.status_code != 200:
                    print(f"   ❌ Failed to get rooms for {user['name']}")
                    all_success = False
                    continue
                
                rooms = response.json()
                cohort_rooms = [r for r in rooms if r.get('room_type') == 'cohort']
                
                # Verify user only has access to their cohort room
                user_cohort_rooms = [r for r in cohort_rooms if r.get('cohort') == user['cohort']]
                other_cohort_rooms = [r for r in cohort_rooms if r.get('cohort') != user['cohort']]
                
                if other_cohort_rooms:
                    error_msg = f"{user['name']} has access to other cohort rooms: {[r.get('cohort') for r in other_cohort_rooms]}"
                    self.log_test(f"Cohort Access Control - {user['name']}", False, 200, error_msg)
                    all_success = False
                else:
                    print(f"   ✅ {user['name']} (cohort {user['cohort']}): Correct cohort access")
            
            self.log_test("Cohort-Based Room Access", all_success, 200, None,
                         "Users have correct cohort-based room access")
            return all_success
            
        except Exception as e:
            self.log_test("Cohort-Based Room Access", False, None, str(e))
            return False

    def test_program_track_based_room_access(self):
        """Test program track-based room access control"""
        try:
            # Test users from different program tracks
            test_users = [
                {"id": "54bee40c-826f-4aa5-b770-2242e397086f", "name": "John Smith", "track": "Web Development"},
                {"id": "bea1e00c-fcba-4b26-9a1d-9692aaebd841", "name": "Sarah Johnson", "track": "Data Analytics"},
                {"id": "09fee5f9-2ad1-4c96-a756-75501616a704", "name": "Marcus Williams", "track": "UX/UI Design"}
            ]
            
            all_success = True
            for user in test_users:
                # Get user's accessible rooms
                response = requests.get(f"{self.api_url}/chat-rooms?user_id={user['id']}")
                if response.status_code != 200:
                    print(f"   ❌ Failed to get rooms for {user['name']}")
                    all_success = False
                    continue
                
                rooms = response.json()
                track_rooms = [r for r in rooms if r.get('room_type') == 'program_track']
                
                # Verify user only has access to their program track room
                user_track_rooms = [r for r in track_rooms if r.get('program_track') == user['track']]
                other_track_rooms = [r for r in track_rooms if r.get('program_track') != user['track']]
                
                if other_track_rooms:
                    error_msg = f"{user['name']} has access to other program track rooms: {[r.get('program_track') for r in other_track_rooms]}"
                    self.log_test(f"Program Track Access Control - {user['name']}", False, 200, error_msg)
                    all_success = False
                else:
                    print(f"   ✅ {user['name']} (track {user['track']}): Correct program track access")
            
            self.log_test("Program Track-Based Room Access", all_success, 200, None,
                         "Users have correct program track-based room access")
            return all_success
            
        except Exception as e:
            self.log_test("Program Track-Based Room Access", False, None, str(e))
            return False

    def run_messaging_system_tests(self):
        """Run comprehensive Group Messaging System tests"""
        print("💬 Testing Group Messaging System:")
        print("=" * 50)
        
        # Test basic connectivity first
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - stopping tests")
            return False
        
        # Chat Room Management
        print("\n🏠 Testing Chat Room Management:")
        self.test_get_user_chat_rooms()
        self.test_create_custom_chat_room()
        
        # Message Operations
        print("\n💬 Testing Message Operations:")
        self.test_get_room_messages()
        
        # Direct Messaging
        print("\n📨 Testing Direct Messaging:")
        self.test_get_direct_messages()
        self.test_get_user_conversations()
        
        # User Status & File Upload
        print("\n👤 Testing User Status & File Upload:")
        self.test_user_online_status()
        self.test_chat_image_upload()
        
        # Access Control & Security
        print("\n🔒 Testing Access Control & Security:")
        self.test_access_control_non_verified_user()
        self.test_cohort_based_room_access()
        self.test_program_track_based_room_access()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Messaging System Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All Messaging System tests passed!")
            return True
        else:
            print("⚠️  Some Messaging System tests failed - check logs above")
            return False

    def run_user_profile_tests(self):
        """Run comprehensive User Profile Management tests"""
        print("👤 Testing User Profile Management System:")
        print("=" * 50)
        
        # Test basic connectivity first
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - stopping tests")
            return False
        
        # User CRUD Operations
        print("\n📝 Testing User CRUD Operations:")
        self.test_create_user()
        self.test_get_all_users()
        self.test_get_specific_users()
        self.test_update_user_profile()
        
        # Profile Data Integrity
        print("\n🔍 Testing Profile Data Integrity:")
        self.test_profile_data_integrity()
        
        # User Event History
        print("\n📅 Testing User Event History:")
        self.test_user_event_history()
        
        # Profile Photo Upload
        print("\n📸 Testing Profile Photo Upload:")
        self.test_profile_photo_upload()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 User Profile Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All User Profile tests passed!")
            return True
        else:
            print("⚠️  Some User Profile tests failed - check logs above")
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
    
    # Check if we should run specific test suites
    if len(sys.argv) > 1:
        if sys.argv[1] == "user_profile":
            success = tester.run_user_profile_tests()
        elif sys.argv[1] == "messaging":
            success = tester.run_messaging_system_tests()
        else:
            success = tester.run_all_tests()
    else:
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