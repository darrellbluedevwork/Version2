import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";

// Import pages
import HomePage from "./pages/HomePage";
import MembershipPage from "./pages/MembershipPage";
import ContactPage from "./pages/ContactPage";
import NewsPage from "./pages/NewsPage";
import NewsletterPage from "./pages/NewsletterPage";
import MembershipSuccessPage from "./pages/MembershipSuccessPage";
import AdminPage from "./pages/AdminPage";

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
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/membership-success" element={<MembershipSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;