import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { 
      name: 'About', 
      href: '/about',
      dropdown: [
        { name: 'About iCAA', href: '/about' },
        { name: 'Board Members', href: '/board' }
      ]
    },
    { name: 'Membership', href: '/membership' },
    { name: 'Events', href: '/events' },
    { name: 'Community', href: '/users' },
    { name: 'Chat', href: '/chat' },
    { name: 'Documents', href: '/documents' },
    { name: 'Shop', href: '/shop' },
    { name: 'News & Updates', href: '/news' },
    { name: 'Newsletter', href: '/newsletter' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;
  const isAboutActive = () => location.pathname === '/about' || location.pathname === '/board';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/dc4k6qfd_New%20-%20iCAA%20Logo.zip%20-%203.jpeg" 
                alt="ICAA Logo" 
                className="h-10 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsAboutDropdownOpen(true)}
                    onMouseLeave={() => setIsAboutDropdownOpen(false)}
                  >
                    <button
                      className={`flex items-center text-sm font-medium transition-colors hover:text-red-600 ${
                        isAboutActive()
                          ? 'text-red-600 border-b-2 border-red-600 pb-1' 
                          : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                    
                    {isAboutDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className={`block px-4 py-2 text-sm transition-colors hover:bg-red-50 hover:text-red-600 ${
                              isActive(dropdownItem.href) ? 'text-red-600 bg-red-50' : 'text-gray-700'
                            }`}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`text-sm font-medium transition-colors hover:text-red-600 ${
                      isActive(item.href) 
                        ? 'text-red-600 border-b-2 border-red-600 pb-1' 
                        : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Cart Icon */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/shop/cart" 
              className="relative text-gray-700 hover:text-red-600 transition-colors"
            >
              <ShoppingCart size={24} />
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-red-600 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          to={dropdownItem.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block pl-4 text-sm font-medium transition-colors hover:text-red-600 ${
                            isActive(dropdownItem.href) ? 'text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-sm font-medium transition-colors hover:text-red-600 ${
                        isActive(item.href) ? 'text-red-600' : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <Link
                to="/shop/cart"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-red-600"
              >
                Shopping Cart
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;