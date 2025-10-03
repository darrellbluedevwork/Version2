from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import shutil
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create SocketIO server for real-time messaging
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi'
)

# Create ASGI app that combines FastAPI and SocketIO
socket_app = socketio.ASGIApp(sio, app)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Stripe integration
stripe_api_key = os.environ.get('STRIPE_API_KEY')

# Ensure uploads directory exists
UPLOAD_DIR = ROOT_DIR / "uploads" / "newsletters"
DOCUMENTS_DIR = ROOT_DIR / "uploads" / "documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Define Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: Optional[str] = None  # For future auth implementation
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    birthday: Optional[str] = None  # ISO date string
    profile_photo_url: Optional[str] = None
    cohort: Optional[str] = None  # Graduation cycle/year
    program_track: Optional[str] = None  # Program track information
    is_verified_alumni: bool = False
    membership_tier: str = "free"  # "free", "active_monthly", "active_yearly", "lifetime"
    payment_status: str = "pending"  # "pending", "active", "expired"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    birthday: Optional[str] = None
    cohort: Optional[str] = None
    program_track: Optional[str] = None
    membership_tier: str = "free"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    birthday: Optional[str] = None
    cohort: Optional[str] = None
    program_track: Optional[str] = None
    profile_photo_url: Optional[str] = None

# Messaging Models
class ChatRoom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    room_type: str  # "cohort", "program_track", "custom", "direct"
    cohort: Optional[str] = None  # For cohort-based rooms
    program_track: Optional[str] = None  # For program track-based rooms
    participants: List[str] = Field(default_factory=list)  # User IDs
    admins: List[str] = Field(default_factory=list)  # User IDs who can moderate
    is_active: bool = True
    created_by: str  # User ID
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRoomCreate(BaseModel):
    name: str
    description: Optional[str] = None
    room_type: str
    cohort: Optional[str] = None
    program_track: Optional[str] = None
    participants: Optional[List[str]] = Field(default_factory=list)

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    sender_id: str
    sender_name: str
    message_type: str = "text"  # "text", "image", "file"
    content: str
    image_url: Optional[str] = None
    file_url: Optional[str] = None
    reply_to: Optional[str] = None  # Message ID if this is a reply
    is_edited: bool = False
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    room_id: str
    message_type: str = "text"
    content: str
    image_url: Optional[str] = None
    file_url: Optional[str] = None
    reply_to: Optional[str] = None

class DirectMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: str
    sender_name: str
    receiver_name: str
    message_type: str = "text"
    content: str
    image_url: Optional[str] = None
    file_url: Optional[str] = None
    is_read: bool = False
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DirectMessageCreate(BaseModel):
    receiver_id: str
    message_type: str = "text"
    content: str
    image_url: Optional[str] = None
    file_url: Optional[str] = None

class UserStatus(BaseModel):
    user_id: str
    status: str = "online"  # "online", "offline", "away"
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_room: Optional[str] = None

# Legacy Member models for backward compatibility
class Member(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    membership_tier: str  # "free", "active_monthly", "active_yearly", "lifetime"
    payment_status: str = "pending"  # "pending", "active", "expired"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    membership_tier: str

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    event_type: str  # "networking", "professional_development", "social", "third_thursday", "other"
    date: datetime
    location: str
    capacity: Optional[int] = None  # None means unlimited
    current_registrations: int = 0
    waitlist_count: int = 0
    created_by: str = "ICAA Admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str
    date: datetime
    location: str
    capacity: Optional[int] = None
    created_by: Optional[str] = "ICAA Admin"

class EventRegistration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    member_id: str
    member_name: str
    member_email: EmailStr
    registration_status: str = "registered"  # "registered", "waitlisted", "cancelled"
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class EventRegistrationCreate(BaseModel):
    event_id: str
    member_name: str
    member_email: EmailStr
    notes: Optional[str] = None

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str  # "bylaws", "policies", "forms", "reports", "other"
    version: str
    filename: str
    file_url: str
    access_level: str = "public"  # "public", "members", "admin"
    uploaded_by: str = "ICAA Admin"
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_current_version: bool = True
    file_size: Optional[int] = None

class DocumentCreate(BaseModel):
    title: str
    description: str
    category: str
    version: str
    access_level: Optional[str] = "public"
    uploaded_by: Optional[str] = "ICAA Admin"

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # "apparel", "accessories", "other"
    price: float
    image_url: Optional[str] = None
    sizes_available: Optional[List[str]] = None  # For apparel
    colors_available: Optional[List[str]] = None
    stock_quantity: int = 0
    printful_url: Optional[str] = None  # Link to Printful product page
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    image_url: Optional[str] = None
    sizes_available: Optional[List[str]] = None
    colors_available: Optional[List[str]] = None
    stock_quantity: Optional[int] = 0
    printful_url: Optional[str] = None

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str  # For anonymous carts
    product_id: str
    product_name: str
    product_price: float
    quantity: int = 1
    size: Optional[str] = None
    color: Optional[str] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemCreate(BaseModel):
    session_id: str
    product_id: str
    quantity: Optional[int] = 1
    size: Optional[str] = None
    color: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    customer_name: str
    customer_email: EmailStr
    customer_address: str
    items: List[Dict]
    total_amount: float
    payment_status: str = "pending"  # "pending", "paid", "shipped", "delivered", "cancelled"
    stripe_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_address: str
    items: List[Dict]

class NewsPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    excerpt: str
    author: str = "ICAA Admin"
    published_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_published: bool = True

class NewsPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    author: Optional[str] = "ICAA Admin"

class ContactForm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactFormCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class NewsletterSubscriber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class NewsletterSubscriberCreate(BaseModel):
    email: EmailStr

class Newsletter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    month: str  # Format: "2025-01"
    pdf_filename: Optional[str] = None
    pdf_url: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_published: bool = True

class NewsletterCreate(BaseModel):
    title: str
    description: str
    month: str

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    payment_id: Optional[str] = None
    user_email: str
    membership_tier: str
    amount: float
    currency: str = "usd"
    payment_status: str = "initiated"  # "initiated", "paid", "failed", "expired"
    metadata: Optional[Dict[str, str]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentTransactionCreate(BaseModel):
    session_id: str
    user_email: str
    membership_tier: str
    amount: float
    currency: str = "usd"
    metadata: Optional[Dict[str, str]] = None

class CheckoutRequest(BaseModel):
    membership_tier: str
    user_email: str
    user_name: str

class ShopCheckoutRequest(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_address: str
    items: List[Dict]

# Membership pricing
MEMBERSHIP_PRICES = {
    "free": 0.0,
    "active_monthly": 10.0,
    "active_yearly": 120.0, 
    "lifetime": 1200.0
}

# Helper function to prepare data for MongoDB
def prepare_for_mongo(data):
    if isinstance(data, dict):
        prepared = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                prepared[key] = value.isoformat()
            else:
                prepared[key] = value
        return prepared
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        parsed = {}
        for key, value in item.items():
            if key.endswith('_at') or key.endswith('_date') or key == 'date':
                try:
                    if isinstance(value, str):
                        parsed[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    else:
                        parsed[key] = value
                except:
                    parsed[key] = value
            else:
                parsed[key] = value
        return parsed
    return item

def generate_order_number():
    """Generate a unique order number"""
    import time
    return f"ICAA-{int(time.time())}-{str(uuid.uuid4())[:8].upper()}"

# Routes
@api_router.get("/")
async def root():
    return {"message": "ICAA Alumni Portal API"}

# Document Repository endpoints
@api_router.post("/documents", response_model=Document)
async def create_document(doc: DocumentCreate):
    doc_dict = doc.dict()
    doc_obj = Document(**doc_dict, filename="", file_url="")
    prepared_data = prepare_for_mongo(doc_obj.dict())
    await db.documents.insert_one(prepared_data)
    return doc_obj

@api_router.post("/documents/{document_id}/upload")
async def upload_document(document_id: str, file: UploadFile = File(...)):
    # Validate file type
    allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
    file_extension = '.' + file.filename.split('.')[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Find document
    document = await db.documents.find_one({"id": document_id})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Generate unique filename
    unique_filename = f"{document_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
    file_path = DOCUMENTS_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update document in database
        file_url = f"/api/documents/{document_id}/file"
        file_size = file_path.stat().st_size
        update_data = {
            "filename": unique_filename,
            "file_url": file_url,
            "file_size": file_size,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.documents.update_one(
            {"id": document_id},
            {"$set": update_data}
        )
        
        return {"message": "Document uploaded successfully", "file_url": file_url}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")

@api_router.get("/documents", response_model=List[Document])
async def get_documents(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    
    documents = await db.documents.find(query).sort("uploaded_at", -1).to_list(1000)
    return [Document(**parse_from_mongo(doc)) for doc in documents]

@api_router.get("/documents/{document_id}/file")
async def get_document_file(document_id: str):
    document = await db.documents.find_one({"id": document_id})
    if not document or not document.get('filename'):
        raise HTTPException(status_code=404, detail="Document file not found")
    
    file_path = DOCUMENTS_DIR / document['filename']
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document file not found on server")
    
    return FileResponse(
        path=file_path,
        media_type='application/octet-stream',
        filename=document.get('title', 'document') + Path(document['filename']).suffix
    )

# Product/Shop endpoints
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    prepared_data = prepare_for_mongo(product_obj.dict())
    await db.products.insert_one(prepared_data)
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, active_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["is_active"] = True
    
    products = await db.products.find(query).sort("created_at", -1).to_list(1000)
    return [Product(**parse_from_mongo(product)) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**parse_from_mongo(product))

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductCreate):
    update_data = product_update.dict()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": prepare_for_mongo(update_data)}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**parse_from_mongo(updated_product))

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Cart endpoints
@api_router.post("/cart/add")
async def add_to_cart(item: CartItemCreate):
    # Get product details
    product = await db.products.find_one({"id": item.product_id, "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = await db.cart_items.find_one({
        "session_id": item.session_id,
        "product_id": item.product_id,
        "size": item.size,
        "color": item.color
    })
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item["quantity"] + item.quantity
        await db.cart_items.update_one(
            {"id": existing_item["id"]},
            {"$set": {"quantity": new_quantity}}
        )
        return {"message": "Cart updated successfully"}
    else:
        # Add new item
        cart_item_dict = item.dict()
        cart_item_obj = CartItem(
            **cart_item_dict,
            product_name=product["name"],
            product_price=product["price"]
        )
        prepared_data = prepare_for_mongo(cart_item_obj.dict())
        await db.cart_items.insert_one(prepared_data)
        return {"message": "Item added to cart successfully", "item_id": cart_item_obj.id}

@api_router.get("/cart/{session_id}")
async def get_cart(session_id: str):
    cart_items = await db.cart_items.find({"session_id": session_id}).to_list(1000)
    return [CartItem(**parse_from_mongo(item)) for item in cart_items]

@api_router.delete("/cart/{session_id}/item/{item_id}")
async def remove_from_cart(session_id: str, item_id: str):
    result = await db.cart_items.delete_one({"id": item_id, "session_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/{session_id}")
async def clear_cart(session_id: str):
    await db.cart_items.delete_many({"session_id": session_id})
    return {"message": "Cart cleared successfully"}

# Shop checkout endpoint
@api_router.post("/shop/checkout")
async def create_shop_checkout(request: ShopCheckoutRequest, http_request: Request):
    try:
        # Calculate total amount
        total_amount = sum(item["price"] * item["quantity"] for item in request.items)
        
        # Generate order number
        order_number = generate_order_number()
        
        # Create Stripe checkout session
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        success_url = f"{host_url}/shop/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{host_url}/shop/cart"
        
        checkout_request = CheckoutSessionRequest(
            amount=total_amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "order_number": order_number,
                "customer_email": request.customer_email,
                "customer_name": request.customer_name,
                "order_type": "merchandise"
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create order record
        order_create = OrderCreate(
            customer_name=request.customer_name,
            customer_email=request.customer_email,
            customer_address=request.customer_address,
            items=request.items
        )
        
        order_dict = order_create.dict()
        order_obj = Order(
            **order_dict,
            order_number=order_number,
            total_amount=total_amount,
            stripe_session_id=session.session_id
        )
        prepared_data = prepare_for_mongo(order_obj.dict())
        await db.orders.insert_one(prepared_data)
        
        return {"checkout_url": session.url, "session_id": session.session_id, "order_number": order_number}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

# Event endpoints (existing code)
@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate):
    event_dict = event.dict()
    event_obj = Event(**event_dict)
    prepared_data = prepare_for_mongo(event_obj.dict())
    await db.events.insert_one(prepared_data)
    return event_obj

@api_router.get("/events", response_model=List[Event])
async def get_events(limit: int = 50, skip: int = 0):
    events = await db.events.find({"is_active": True}).sort("date", 1).skip(skip).limit(limit).to_list(limit)
    return [Event(**parse_from_mongo(event)) for event in events]

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id, "is_active": True})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**parse_from_mongo(event))

@api_router.post("/events/{event_id}/register")
async def register_for_event(event_id: str, registration: EventRegistrationCreate):
    # Get event details
    event = await db.events.find_one({"id": event_id, "is_active": True})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already registered
    existing_registration = await db.event_registrations.find_one({
        "event_id": event_id,
        "member_email": registration.member_email,
        "registration_status": {"$in": ["registered", "waitlisted"]}
    })
    if existing_registration:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Check capacity and determine registration status
    current_registrations = await db.event_registrations.count_documents({
        "event_id": event_id,
        "registration_status": "registered"
    })
    
    registration_status = "registered"
    if event.get('capacity') is not None and current_registrations >= event['capacity']:
        registration_status = "waitlisted"
    
    # Create registration
    registration_dict = registration.dict()
    registration_obj = EventRegistration(
        **registration_dict,
        member_id=str(uuid.uuid4()),  # Generate temp ID for non-members
        registration_status=registration_status
    )
    prepared_data = prepare_for_mongo(registration_obj.dict())
    await db.event_registrations.insert_one(prepared_data)
    
    # Update event counters
    if registration_status == "registered":
        await db.events.update_one(
            {"id": event_id},
            {"$inc": {"current_registrations": 1}}
        )
    else:
        await db.events.update_one(
            {"id": event_id},
            {"$inc": {"waitlist_count": 1}}
        )
    
    return {
        "message": f"Successfully {'registered' if registration_status == 'registered' else 'added to waitlist'} for event",
        "registration_status": registration_status,
        "registration_id": registration_obj.id
    }

@api_router.get("/events/{event_id}/registrations", response_model=List[EventRegistration])
async def get_event_registrations(event_id: str):
    registrations = await db.event_registrations.find({"event_id": event_id}).sort("registered_at", 1).to_list(1000)
    return [EventRegistration(**parse_from_mongo(reg)) for reg in registrations]

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    result = await db.events.update_one(
        {"id": event_id},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# News & Updates endpoints (existing code)
@api_router.post("/news", response_model=NewsPost)
async def create_news_post(post: NewsPostCreate):
    news_dict = post.dict()
    news_obj = NewsPost(**news_dict)
    prepared_data = prepare_for_mongo(news_obj.dict())
    await db.news_posts.insert_one(prepared_data)
    return news_obj

@api_router.get("/news", response_model=List[NewsPost])
async def get_news_posts(limit: int = 10, skip: int = 0):
    posts = await db.news_posts.find({"is_published": True}).sort("published_date", -1).skip(skip).limit(limit).to_list(limit)
    return [NewsPost(**parse_from_mongo(post)) for post in posts]

@api_router.get("/news/{post_id}", response_model=NewsPost)
async def get_news_post(post_id: str):
    post = await db.news_posts.find_one({"id": post_id, "is_published": True})
    if not post:
        raise HTTPException(status_code=404, detail="News post not found")
    return NewsPost(**parse_from_mongo(post))

# Newsletter endpoints (existing code)
@api_router.post("/newsletters", response_model=Newsletter)
async def create_newsletter(newsletter: NewsletterCreate):
    newsletter_dict = newsletter.dict()
    newsletter_obj = Newsletter(**newsletter_dict)
    prepared_data = prepare_for_mongo(newsletter_obj.dict())
    await db.newsletters.insert_one(prepared_data)
    return newsletter_obj

@api_router.get("/newsletters", response_model=List[Newsletter])
async def get_newsletters():
    newsletters = await db.newsletters.find({"is_published": True}).sort("month", -1).to_list(1000)
    return [Newsletter(**parse_from_mongo(newsletter)) for newsletter in newsletters]

@api_router.post("/newsletters/{newsletter_id}/upload-pdf")
async def upload_newsletter_pdf(newsletter_id: str, file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Find newsletter
    newsletter = await db.newsletters.find_one({"id": newsletter_id})
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{newsletter_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update newsletter in database
        pdf_url = f"/api/newsletters/{newsletter_id}/pdf"
        update_data = {
            "pdf_filename": unique_filename,
            "pdf_url": pdf_url,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.newsletters.update_one(
            {"id": newsletter_id},
            {"$set": update_data}
        )
        
        return {"message": "PDF uploaded successfully", "pdf_url": pdf_url}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {str(e)}")

@api_router.get("/newsletters/{newsletter_id}/pdf")
async def get_newsletter_pdf(newsletter_id: str):
    newsletter = await db.newsletters.find_one({"id": newsletter_id})
    if not newsletter or not newsletter.get('pdf_filename'):
        raise HTTPException(status_code=404, detail="PDF not found")
    
    file_path = UPLOAD_DIR / newsletter['pdf_filename']
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="PDF file not found on server")
    
    return FileResponse(
        path=file_path,
        media_type='application/pdf',
        filename=newsletter.get('title', 'newsletter') + '.pdf'
    )

# Contact form endpoints (existing code)
@api_router.post("/contact")
async def submit_contact_form(form: ContactFormCreate):
    contact_dict = form.dict()
    contact_obj = ContactForm(**contact_dict)
    prepared_data = prepare_for_mongo(contact_obj.dict())
    await db.contact_forms.insert_one(prepared_data)
    return {"message": "Contact form submitted successfully", "id": contact_obj.id}

@api_router.get("/contact", response_model=List[ContactForm])
async def get_contact_forms():
    forms = await db.contact_forms.find().sort("created_at", -1).to_list(1000)
    return [ContactForm(**parse_from_mongo(form)) for form in forms]

# Newsletter subscription endpoints (existing code)
@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(subscriber: NewsletterSubscriberCreate):
    # Check if already subscribed
    existing = await db.newsletter_subscribers.find_one({"email": subscriber.email})
    if existing:
        return {"message": "Already subscribed to newsletter"}
    
    subscriber_dict = subscriber.dict()
    subscriber_obj = NewsletterSubscriber(**subscriber_dict)
    prepared_data = prepare_for_mongo(subscriber_obj.dict())
    await db.newsletter_subscribers.insert_one(prepared_data)
    return {"message": "Successfully subscribed to newsletter", "id": subscriber_obj.id}

@api_router.get("/newsletter/subscribers", response_model=List[NewsletterSubscriber])
async def get_newsletter_subscribers():
    subscribers = await db.newsletter_subscribers.find({"is_active": True}).to_list(1000)
    return [NewsletterSubscriber(**parse_from_mongo(sub)) for sub in subscribers]

# Member endpoints (existing code)
@api_router.post("/members", response_model=Member)
async def create_member(member: MemberCreate):
    # Check if member already exists
    existing = await db.members.find_one({"email": member.email})
    if existing:
        raise HTTPException(status_code=400, detail="Member with this email already exists")
    
    member_dict = member.dict()
    member_obj = Member(**member_dict)
    prepared_data = prepare_for_mongo(member_obj.dict())
    await db.members.insert_one(prepared_data)
    return member_obj

@api_router.get("/members", response_model=List[Member])
async def get_members():
    members = await db.members.find().to_list(1000)
    return [Member(**parse_from_mongo(member)) for member in members]

@api_router.get("/members/{member_id}", response_model=Member)
async def get_member(member_id: str):
    member = await db.members.find_one({"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return Member(**parse_from_mongo(member))

# User Profile endpoints
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    # Check if user already exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user_dict = user.dict()
    # For now, skip password hashing - will implement proper auth later
    if 'password' in user_dict:
        user_dict.pop('password')
    
    user_obj = User(**user_dict)
    prepared_data = prepare_for_mongo(user_obj.dict())
    await db.users.insert_one(prepared_data)
    return user_obj

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(1000)
    return [User(**parse_from_mongo(user)) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**parse_from_mongo(user))

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserUpdate):
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": prepare_for_mongo(update_data)}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"id": user_id})
    return User(**parse_from_mongo(updated_user))

@api_router.get("/users/{user_id}/events", response_model=List[Dict])
async def get_user_events(user_id: str):
    # Get user's event registrations
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find events where user is registered
    registrations = await db.event_registrations.find({"member_email": user["email"]}).to_list(1000)
    
    events_with_status = []
    for registration in registrations:
        event = await db.events.find_one({"id": registration["event_id"]})
        if event:
            event_data = Event(**parse_from_mongo(event))
            events_with_status.append({
                "event": event_data.dict(),
                "registration_status": registration["registration_status"],
                "registered_at": registration["registered_at"]
            })
    
    return events_with_status

@api_router.post("/users/{user_id}/upload-photo")
async def upload_profile_photo(user_id: str, file: UploadFile = File(...)):
    # Validate file type
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {file_extension} not allowed")
    
    # Create profile photos directory
    PROFILE_PHOTOS_DIR = ROOT_DIR / "uploads" / "profile_photos"
    PROFILE_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    filename = f"{user_id}_{uuid.uuid4()}{file_extension}"
    file_path = PROFILE_PHOTOS_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user profile with photo URL
    photo_url = f"/uploads/profile_photos/{filename}"
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"profile_photo_url": photo_url, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Profile photo uploaded successfully", "photo_url": photo_url}

# Chat Room endpoints
@api_router.get("/chat-rooms", response_model=List[ChatRoom])
async def get_user_chat_rooms(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.get('is_verified_alumni', False):
        raise HTTPException(status_code=403, detail="Access denied. Verified alumni only.")
    
    # Get rooms user can access
    rooms = []
    
    # Cohort room
    if user.get('cohort'):
        cohort_room = await db.chat_rooms.find_one({
            "room_type": "cohort",
            "cohort": user['cohort'],
            "is_active": True
        })
        if cohort_room:
            rooms.append(ChatRoom(**parse_from_mongo(cohort_room)))
    
    # Program track room  
    if user.get('program_track'):
        track_room = await db.chat_rooms.find_one({
            "room_type": "program_track", 
            "program_track": user['program_track'],
            "is_active": True
        })
        if track_room:
            rooms.append(ChatRoom(**parse_from_mongo(track_room)))
    
    # Custom rooms where user is participant
    custom_rooms = await db.chat_rooms.find({
        "room_type": "custom",
        "participants": user_id,
        "is_active": True
    }).to_list(100)
    
    for room in custom_rooms:
        rooms.append(ChatRoom(**parse_from_mongo(room)))
    
    return rooms

@api_router.post("/chat-rooms", response_model=ChatRoom)
async def create_chat_room(room: ChatRoomCreate, creator_id: str):
    # Verify creator exists and is verified alumni
    creator = await db.users.find_one({"id": creator_id})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    if not creator.get('is_verified_alumni', False):
        raise HTTPException(status_code=403, detail="Access denied. Verified alumni only.")
    
    # Create room
    room_dict = room.dict()
    room_obj = ChatRoom(**room_dict, created_by=creator_id, admins=[creator_id])
    
    # Add creator to participants if not already included
    if creator_id not in room_obj.participants:
        room_obj.participants.append(creator_id)
    
    prepared_data = prepare_for_mongo(room_obj.dict())
    await db.chat_rooms.insert_one(prepared_data)
    return room_obj

@api_router.get("/chat-rooms/{room_id}/messages", response_model=List[Message])
async def get_room_messages(room_id: str, user_id: str, limit: int = 50, skip: int = 0):
    # Verify user has access to room
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get('is_verified_alumni', False):
        raise HTTPException(status_code=403, detail="Access denied")
    
    room = await db.chat_rooms.find_one({"id": room_id, "is_active": True})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check access
    user_info = {
        'user_id': user_id,
        'cohort': user.get('cohort'),
        'program_track': user.get('program_track')
    }
    
    if not can_access_room(user_info, room):
        raise HTTPException(status_code=403, detail="Access denied to this room")
    
    # Get messages
    messages = await db.messages.find({
        "room_id": room_id,
        "is_deleted": False
    }).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Reverse to show oldest first
    messages.reverse()
    
    return [Message(**parse_from_mongo(msg)) for msg in messages]

@api_router.get("/direct-messages", response_model=List[DirectMessage])
async def get_direct_messages(user_id: str, other_user_id: str, limit: int = 50, skip: int = 0):
    # Verify user exists and is verified alumni
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get('is_verified_alumni', False):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get direct messages between two users
    messages = await db.direct_messages.find({
        "$or": [
            {"sender_id": user_id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": user_id}
        ],
        "is_deleted": False
    }).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Mark messages as read for the requesting user
    await db.direct_messages.update_many(
        {
            "sender_id": other_user_id,
            "receiver_id": user_id,
            "is_read": False
        },
        {"$set": {"is_read": True}}
    )
    
    # Reverse to show oldest first
    messages.reverse()
    
    return [DirectMessage(**parse_from_mongo(msg)) for msg in messages]

@api_router.get("/direct-messages/conversations", response_model=List[Dict])
async def get_user_conversations(user_id: str):
    # Get list of users this user has had conversations with
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get('is_verified_alumni', False):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Aggregate to get unique conversation partners and latest message
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"sender_id": user_id},
                    {"receiver_id": user_id}
                ],
                "is_deleted": False
            }
        },
        {
            "$addFields": {
                "other_user_id": {
                    "$cond": {
                        "if": {"$eq": ["$sender_id", user_id]},
                        "then": "$receiver_id",
                        "else": "$sender_id"
                    }
                },
                "other_user_name": {
                    "$cond": {
                        "if": {"$eq": ["$sender_id", user_id]},
                        "then": "$receiver_name", 
                        "else": "$sender_name"
                    }
                }
            }
        },
        {
            "$sort": {"created_at": -1}
        },
        {
            "$group": {
                "_id": "$other_user_id",
                "other_user_name": {"$first": "$other_user_name"},
                "latest_message": {"$first": "$$ROOT"},
                "unread_count": {
                    "$sum": {
                        "$cond": {
                            "if": {
                                "$and": [
                                    {"$eq": ["$receiver_id", user_id]},
                                    {"$eq": ["$is_read", False]}
                                ]
                            },
                            "then": 1,
                            "else": 0
                        }
                    }
                }
            }
        }
    ]
    
    conversations = await db.direct_messages.aggregate(pipeline).to_list(100)
    
    return [
        {
            "other_user_id": conv["_id"],
            "other_user_name": conv["other_user_name"],
            "latest_message": conv["latest_message"],
            "unread_count": conv["unread_count"]
        }
        for conv in conversations
    ]

@api_router.post("/chat-images/upload")
async def upload_chat_image(user_id: str, file: UploadFile = File(...)):
    # Verify user exists and is verified alumni
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get('is_verified_alumni', False):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Validate file type
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {file_extension} not allowed")
    
    # Create chat images directory
    CHAT_IMAGES_DIR = ROOT_DIR / "uploads" / "chat_images"
    CHAT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    filename = f"{user_id}_{uuid.uuid4()}{file_extension}"
    file_path = CHAT_IMAGES_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return image URL
    image_url = f"/uploads/chat_images/{filename}"
    return {"message": "Image uploaded successfully", "image_url": image_url}

@api_router.get("/users/{user_id}/online-status")
async def get_user_online_status(user_id: str):
    status = await db.user_status.find_one({"user_id": user_id})
    if status:
        return {
            "user_id": user_id,
            "status": status["status"],
            "last_seen": status["last_seen"],
            "current_room": status.get("current_room")
        }
    return {
        "user_id": user_id,
        "status": "offline",
        "last_seen": None,
        "current_room": None
    }

# WebSocket event handlers for real-time messaging
connected_users = {}  # {session_id: user_info}
user_sessions = {}    # {user_id: session_id}

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")
    await sio.emit('connected', {'status': 'Connected to ICAA Chat'}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    # Remove user from connected users and update status
    if sid in connected_users:
        user_info = connected_users[sid]
        user_id = user_info['user_id']
        
        # Update user status to offline
        await db.user_status.update_one(
            {"user_id": user_id},
            {"$set": {
                "status": "offline",
                "last_seen": datetime.now(timezone.utc).isoformat(),
                "current_room": None
            }},
            upsert=True
        )
        
        # Clean up tracking dictionaries
        del connected_users[sid]
        if user_id in user_sessions:
            del user_sessions[user_id]

@sio.event
async def join_user(sid, data):
    user_id = data.get('user_id')
    user_name = data.get('user_name')
    
    if not user_id:
        await sio.emit('error', {'message': 'User ID required'}, to=sid)
        return
    
    # Verify user exists and is verified alumni
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get('is_verified_alumni', False):
        await sio.emit('error', {'message': 'Access denied. Verified alumni only.'}, to=sid)
        return
    
    # Store user connection info
    connected_users[sid] = {
        'user_id': user_id,
        'user_name': user_name or user['name'],
        'cohort': user.get('cohort'),
        'program_track': user.get('program_track')
    }
    user_sessions[user_id] = sid
    
    # Update user status to online
    await db.user_status.update_one(
        {"user_id": user_id},
        {"$set": {
            "status": "online",
            "last_seen": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    # Auto-join cohort and program track rooms
    await auto_join_default_rooms(sid, user)
    
    await sio.emit('user_joined', {
        'user_id': user_id,
        'user_name': connected_users[sid]['user_name'],
        'status': 'online'
    }, to=sid)

@sio.event
async def join_room(sid, data):
    room_id = data.get('room_id')
    if not room_id:
        await sio.emit('error', {'message': 'Room ID required'}, to=sid)
        return
    
    user_info = connected_users.get(sid)
    if not user_info:
        await sio.emit('error', {'message': 'User not authenticated'}, to=sid)
        return
    
    # Verify room exists and user has access
    room = await db.chat_rooms.find_one({"id": room_id, "is_active": True})
    if not room:
        await sio.emit('error', {'message': 'Room not found'}, to=sid)
        return
    
    # Check if user has access to room
    if not can_access_room(user_info, room):
        await sio.emit('error', {'message': 'Access denied to this room'}, to=sid)
        return
    
    await sio.enter_room(sid, room_id)
    
    # Update user's current room
    await db.user_status.update_one(
        {"user_id": user_info['user_id']},
        {"$set": {"current_room": room_id}},
        upsert=True
    )
    
    await sio.emit('joined_room', {'room_id': room_id, 'room_name': room['name']}, to=sid)

@sio.event
async def send_message(sid, data):
    user_info = connected_users.get(sid)
    if not user_info:
        await sio.emit('error', {'message': 'User not authenticated'}, to=sid)
        return
    
    room_id = data.get('room_id')
    content = data.get('content', '').strip()
    message_type = data.get('message_type', 'text')
    
    if not room_id or not content:
        await sio.emit('error', {'message': 'Room ID and content required'}, to=sid)
        return
    
    # Create message
    message = Message(
        room_id=room_id,
        sender_id=user_info['user_id'],
        sender_name=user_info['user_name'],
        message_type=message_type,
        content=content,
        image_url=data.get('image_url'),
        file_url=data.get('file_url'),
        reply_to=data.get('reply_to')
    )
    
    # Save to database
    prepared_data = prepare_for_mongo(message.dict())
    await db.messages.insert_one(prepared_data)
    
    # Emit to all users in the room
    message_data = {
        'id': message.id,
        'room_id': room_id,
        'sender_id': user_info['user_id'],
        'sender_name': user_info['user_name'],
        'content': content,
        'message_type': message_type,
        'image_url': message.image_url,
        'created_at': message.created_at.isoformat(),
        'reply_to': message.reply_to
    }
    
    await sio.emit('new_message', message_data, room=room_id)

@sio.event
async def send_direct_message(sid, data):
    user_info = connected_users.get(sid)
    if not user_info:
        await sio.emit('error', {'message': 'User not authenticated'}, to=sid)
        return
    
    receiver_id = data.get('receiver_id')
    content = data.get('content', '').strip()
    message_type = data.get('message_type', 'text')
    
    if not receiver_id or not content:
        await sio.emit('error', {'message': 'Receiver ID and content required'}, to=sid)
        return
    
    # Get receiver info
    receiver = await db.users.find_one({"id": receiver_id})
    if not receiver:
        await sio.emit('error', {'message': 'Receiver not found'}, to=sid)
        return
    
    # Create direct message
    dm = DirectMessage(
        sender_id=user_info['user_id'],
        receiver_id=receiver_id,
        sender_name=user_info['user_name'],
        receiver_name=receiver['name'],
        message_type=message_type,
        content=content,
        image_url=data.get('image_url'),
        file_url=data.get('file_url')
    )
    
    # Save to database
    prepared_data = prepare_for_mongo(dm.dict())
    await db.direct_messages.insert_one(prepared_data)
    
    # Send to both users if they're online
    dm_data = {
        'id': dm.id,
        'sender_id': user_info['user_id'],
        'sender_name': user_info['user_name'],
        'receiver_id': receiver_id,
        'receiver_name': receiver['name'],
        'content': content,
        'message_type': message_type,
        'image_url': dm.image_url,
        'created_at': dm.created_at.isoformat()
    }
    
    # Send to sender
    await sio.emit('new_direct_message', dm_data, to=sid)
    
    # Send to receiver if online
    if receiver_id in user_sessions:
        receiver_sid = user_sessions[receiver_id]
        await sio.emit('new_direct_message', dm_data, to=receiver_sid)

async def auto_join_default_rooms(sid, user):
    """Auto-join user to cohort and program track rooms"""
    cohort = user.get('cohort')
    program_track = user.get('program_track')
    
    # Join cohort room
    if cohort:
        cohort_room = await get_or_create_cohort_room(cohort)
        await sio.enter_room(sid, cohort_room['id'])
    
    # Join program track room
    if program_track:
        track_room = await get_or_create_program_track_room(program_track)
        await sio.enter_room(sid, track_room['id'])

async def get_or_create_cohort_room(cohort):
    """Get or create a room for a specific cohort"""
    room = await db.chat_rooms.find_one({
        "room_type": "cohort",
        "cohort": cohort,
        "is_active": True
    })
    
    if not room:
        # Create new cohort room
        new_room = ChatRoom(
            name=f"Cohort {cohort}",
            description=f"Chat room for {cohort} cohort alumni",
            room_type="cohort",
            cohort=cohort,
            created_by="system"
        )
        prepared_data = prepare_for_mongo(new_room.dict())
        await db.chat_rooms.insert_one(prepared_data)
        room = new_room.dict()
    
    return room

async def get_or_create_program_track_room(program_track):
    """Get or create a room for a specific program track"""
    room = await db.chat_rooms.find_one({
        "room_type": "program_track",
        "program_track": program_track,
        "is_active": True
    })
    
    if not room:
        # Create new program track room
        new_room = ChatRoom(
            name=f"{program_track} Alumni",
            description=f"Chat room for {program_track} program alumni",
            room_type="program_track",
            program_track=program_track,
            created_by="system"
        )
        prepared_data = prepare_for_mongo(new_room.dict())
        await db.chat_rooms.insert_one(prepared_data)
        room = new_room.dict()
    
    return room

def can_access_room(user_info, room):
    """Check if user can access a specific room"""
    room_type = room['room_type']
    
    if room_type == "cohort":
        return user_info.get('cohort') == room.get('cohort')
    elif room_type == "program_track":
        return user_info.get('program_track') == room.get('program_track')
    elif room_type == "custom":
        return user_info['user_id'] in room.get('participants', [])
    elif room_type == "direct":
        return user_info['user_id'] in room.get('participants', [])
    
    return False

# File serving endpoints
@app.get("/uploads/profile_photos/{filename}")
async def serve_profile_photo(filename: str):
    file_path = ROOT_DIR / "uploads" / "profile_photos" / filename
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/uploads/chat_images/{filename}")
async def serve_chat_image(filename: str):
    file_path = ROOT_DIR / "uploads" / "chat_images" / filename
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

# Payment endpoints (existing code)
@api_router.post("/payments/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    # Validate membership tier
    if request.membership_tier not in MEMBERSHIP_PRICES:
        raise HTTPException(status_code=400, detail="Invalid membership tier")
    
    amount = MEMBERSHIP_PRICES[request.membership_tier]
    
    # Skip payment for free membership
    if amount == 0:
        # Create member directly for free tier
        member_create = MemberCreate(
            name=request.user_name,
            email=request.user_email,
            membership_tier=request.membership_tier
        )
        member_dict = member_create.dict()
        member_obj = Member(**member_dict, payment_status="active")
        prepared_data = prepare_for_mongo(member_obj.dict())
        await db.members.insert_one(prepared_data)
        return {"message": "Free membership created successfully", "member_id": member_obj.id}
    
    # Create Stripe checkout session for paid memberships
    try:
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        success_url = f"{host_url}/membership-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{host_url}/membership"
        
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "membership_tier": request.membership_tier,
                "user_email": request.user_email,
                "user_name": request.user_name
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction_create = PaymentTransactionCreate(
            session_id=session.session_id,
            user_email=request.user_email,
            membership_tier=request.membership_tier,
            amount=amount,
            currency="usd",
            metadata=checkout_request.metadata
        )
        
        transaction_dict = transaction_create.dict()
        transaction_obj = PaymentTransaction(**transaction_dict)
        prepared_data = prepare_for_mongo(transaction_obj.dict())
        await db.payment_transactions.insert_one(prepared_data)
        
        return {"checkout_url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@api_router.get("/payments/checkout-status/{session_id}")
async def get_checkout_status(session_id: str):
    try:
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment transaction
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction:
            update_data = {
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": update_data}
            )
            
            # Create member if payment successful and not already created
            if status.payment_status == "paid":
                existing_member = await db.members.find_one({"email": transaction["user_email"]})
                if not existing_member:
                    member_create = MemberCreate(
                        name=status.metadata.get("user_name", "Unknown"),
                        email=transaction["user_email"],
                        membership_tier=transaction["membership_tier"]
                    )
                    member_dict = member_create.dict()
                    member_obj = Member(**member_dict, payment_status="active")
                    prepared_data = prepare_for_mongo(member_obj.dict())
                    await db.members.insert_one(prepared_data)
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get checkout status: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        stripe_signature = request.headers.get("Stripe-Signature")
        
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Update payment transaction based on webhook
        if webhook_response.session_id:
            update_data = {
                "payment_status": webhook_response.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": update_data}
            )
        
        return {"status": "ok"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Export the combined app for uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8001)