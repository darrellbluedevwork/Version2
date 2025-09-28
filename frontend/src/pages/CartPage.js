import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: ''
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/cart/${sessionId}`);
      setCartItems(response.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    const sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) return;

    try {
      await axios.delete(`${API}/cart/${sessionId}/item/${itemId}`);
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item from cart');
    }
  };

  const clearCart = async () => {
    const sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) return;

    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      await axios.delete(`${API}/cart/${sessionId}`);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error clearing cart');
    }
  };

  const handleInputChange = (field, value) => {
    setCheckoutForm({ ...checkoutForm, [field]: value });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 50 ? 0 : 8.99; // Free shipping over $50
    return subtotal + shipping;
  };

  const handleCheckout = async () => {
    if (!checkoutForm.customer_name || !checkoutForm.customer_email || !checkoutForm.customer_address) {
      alert('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);

    try {
      const checkoutData = {
        customer_name: checkoutForm.customer_name,
        customer_email: checkoutForm.customer_email,
        customer_address: checkoutForm.customer_address,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.product_price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }))
      };

      const response = await axios.post(`${API}/shop/checkout`, checkoutData);
      
      if (response.data.checkout_url) {
        // Clear cart after successful checkout initiation
        const sessionId = localStorage.getItem('cart_session_id');
        if (sessionId) {
          await axios.delete(`${API}/cart/${sessionId}`);
        }
        
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error processing checkout. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <div className="container py-6">
        <Link to="/shop" className="inline-flex items-center text-red-600 hover:text-red-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>
      </div>

      {/* Cart Content */}
      <section className="pb-16">
        <div className="container">
          <h1 className="text-4xl font-bold text-gray-900 mb-8" data-testid="cart-title">
            Shopping Cart
          </h1>

          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Your Items ({cartItems.length})</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearCart}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cart
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {cartItems.map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-4 pb-6 border-b last:border-b-0" data-testid={`cart-item-${index}`}>
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              {item.size && <p>Size: {item.size}</p>}
                              {item.color && <p>Color: {item.color}</p>}
                              <p>Added: {formatDate(item.added_at)}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-lg">${(item.product_price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-600">
                              ${item.product_price.toFixed(2)} × {item.quantity}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                              data-testid={`remove-item-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Checkout Form */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Order Summary */}
                  <Card data-testid="order-summary">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          {calculateSubtotal() > 50 ? (
                            <Badge className="bg-green-600">Free</Badge>
                          ) : (
                            '$8.99'
                          )}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                      {calculateSubtotal() < 50 && (
                        <p className="text-sm text-gray-600">
                          Add ${(50 - calculateSubtotal()).toFixed(2)} more for free shipping!
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                      <CardDescription>
                        Please provide your information for order processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="customer_name">Full Name *</Label>
                          <Input
                            id="customer_name"
                            type="text"
                            value={checkoutForm.customer_name}
                            onChange={(e) => handleInputChange('customer_name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                            data-testid="checkout-name-input"
                          />
                        </div>

                        <div>
                          <Label htmlFor="customer_email">Email Address *</Label>
                          <Input
                            id="customer_email"
                            type="email"
                            value={checkoutForm.customer_email}
                            onChange={(e) => handleInputChange('customer_email', e.target.value)}
                            placeholder="Enter your email address"
                            required
                            data-testid="checkout-email-input"
                          />
                        </div>

                        <div>
                          <Label htmlFor="customer_address">Shipping Address *</Label>
                          <Textarea
                            id="customer_address"
                            value={checkoutForm.customer_address}
                            onChange={(e) => handleInputChange('customer_address', e.target.value)}
                            placeholder="Enter your complete shipping address"
                            className="min-h-[100px]"
                            required
                            data-testid="checkout-address-input"
                          />
                        </div>

                        <Button 
                          type="button"
                          onClick={handleCheckout}
                          className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                          disabled={isCheckingOut}
                          data-testid="checkout-btn"
                        >
                          {isCheckingOut ? (
                            'Processing...'
                          ) : (
                            <>
                              Proceed to Payment
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </form>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Secure checkout powered by Stripe. Your payment information is encrypted and secure.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16" data-testid="empty-cart">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Your Cart is Empty</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Explore our merchandise collection to find something you like.
              </p>
              <Link to="/shop">
                <Button className="bg-red-600 hover:bg-red-700 px-8 py-3">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Security and Shipping Info */}
      {cartItems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Secure Checkout</h3>
                <p className="text-sm text-gray-600">
                  Your payment information is protected with industry-standard encryption.
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Fast Shipping</h3>
                <p className="text-sm text-gray-600">
                  Free shipping on orders over $50. Standard shipping takes 5-7 business days.
                </p>
              </div>

              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Support ICAA</h3>
                <p className="text-sm text-gray-600">
                  Every purchase supports ICAA programs and alumni community initiatives.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CartPage;