import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/dc4k6qfd_New%20-%20iCAA%20Logo.zip%20-%203.jpeg" 
                alt="ICAA Logo" 
                className="h-8 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 mb-4">
              i.c.stars |* Chicago Alumni Association - Connecting alumni to professional development, networking, and growth opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/news">News & Updates</Link></li>
              <li><Link to="/newsletter">Newsletter</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Membership */}
          <div className="footer-section">
            <h4>Membership</h4>
            <ul>
              <li><a href="/membership#free">Free Membership</a></li>
              <li><a href="/membership#monthly">Active Monthly</a></li>
              <li><a href="/membership#yearly">Active Yearly</a></li>
              <li><a href="/membership#lifetime">Lifetime</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul>
              <li>
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>info@icaa-chicago.org</span>
                </div>
              </li>
              <li>
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>(312) 555-0123</span>
                </div>
              </li>
              <li>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Chicago, IL</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 i.c.stars |* Chicago Alumni Association. All Rights Reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;