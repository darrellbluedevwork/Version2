import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";

// Import pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import BoardPage from "./pages/BoardPage";
import MembershipPage from "./pages/MembershipPage";
import ContactPage from "./pages/ContactPage";
import NewsPage from "./pages/NewsPage";
import NewsletterPage from "./pages/NewsletterPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import DocumentsPage from "./pages/DocumentsPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import MembershipSuccessPage from "./pages/MembershipSuccessPage";
import AdminPage from "./pages/AdminPage";
import UsersPage from "./pages/UsersPage";
import UserProfilePage from "./pages/UserProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ChatPage from "./pages/ChatPage";

// Import components
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/membership-success" element={<MembershipSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/product/:productId" element={<ProductDetailsPage />} />
            <Route path="/shop/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/users/:userId/edit" element={<EditProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;