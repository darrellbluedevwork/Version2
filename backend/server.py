from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
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

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Stripe integration
stripe_api_key = os.environ.get('STRIPE_API_KEY')

# Ensure uploads directory exists
UPLOAD_DIR = ROOT_DIR / "uploads" / "newsletters"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Define Models
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

# Routes
@api_router.get("/")
async def root():
    return {"message": "ICAA Alumni Portal API"}

# Event endpoints
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

# News & Updates endpoints
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

# Newsletter endpoints
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

# Contact form endpoints
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

# Newsletter subscription endpoints
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

# Member endpoints
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

# Payment endpoints
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