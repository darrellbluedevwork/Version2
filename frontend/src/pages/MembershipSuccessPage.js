import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MembershipSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async (attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    if (attempts >= maxAttempts) {
      setPaymentStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/checkout-status/${sessionId}`);
      const data = response.data;
      
      setPaymentDetails(data);

      if (data.payment_status === 'paid') {
        setPaymentStatus('success');
        return;
      } else if (data.status === 'expired') {
        setPaymentStatus('expired');
        return;
      }

      // If payment is still pending, continue polling
      setPaymentStatus('processing');
      setTimeout(() => checkPaymentStatus(attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-600 mb-6">No payment session found.</p>
          <Link to="/membership" className="btn btn-primary">
            Return to Membership
          </Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (paymentStatus) {
      case 'checking':
      case 'processing':
        return (
          <div className="text-center" data-testid="payment-processing">
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentStatus === 'checking' ? 'Checking Payment Status...' : 'Processing Payment...'}
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your membership payment.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center" data-testid="payment-success">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ICAA!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your membership payment was successful. Thank you for joining the i.c.stars Chicago Alumni Association!
            </p>
            {paymentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Amount: ${(paymentDetails.amount_total / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}</p>
                  <p>Status: {paymentDetails.payment_status}</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <Link to="/" className="btn btn-primary">
                Explore Our Community <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <div className="text-center">
                <Link to="/news" className="text-red-600 hover:text-red-700 font-medium">
                  View Upcoming Events
                </Link>
              </div>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center" data-testid="payment-expired">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Session Expired</h1>
            <p className="text-gray-600 mb-6">
              Your payment session has expired. Please try again to complete your membership registration.
            </p>
            <Link to="/membership" className="btn btn-primary">
              Try Again
            </Link>
          </div>
        );

      case 'timeout':
        return (
          <div className="text-center" data-testid="payment-timeout">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Status Check Timed Out</h1>
            <p className="text-gray-600 mb-6">
              We couldn't confirm your payment status. Please check your email for confirmation or contact support.
            </p>
            <div className="space-y-4">
              <button onClick={() => checkPaymentStatus()} className="btn btn-primary">
                Check Again
              </button>
              <div>
                <Link to="/contact" className="text-red-600 hover:text-red-700 font-medium">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center" data-testid="payment-error">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">
              There was an error processing your payment. Please try again or contact support.
            </p>
            <div className="space-y-4">
              <Link to="/membership" className="btn btn-primary">
                Try Again
              </Link>
              <div>
                <Link to="/contact" className="text-red-600 hover:text-red-700 font-medium">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderContent()}
        </div>

        {/* Next Steps */}
        {paymentStatus === 'success' && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Next?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Check Your Email</h3>
                <p className="text-sm text-gray-600">
                  You'll receive a welcome email with your membership details and next steps.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Join Events</h3>
                <p className="text-sm text-gray-600">
                  Browse our upcoming events and register for those that interest you.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Connect</h3>
                <p className="text-sm text-gray-600">
                  Start networking with fellow alumni and take advantage of member benefits.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipSuccessPage;