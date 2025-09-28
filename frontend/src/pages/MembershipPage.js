import React, { useState } from 'react';
import { Check, Star, ArrowRight, Loader } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MembershipPage = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [message, setMessage] = useState('');

  const membershipTiers = [
    {
      id: 'free',
      name: 'Free Membership',
      price: 0,
      period: 'Forever',
      description: 'Basic access to our community',
      features: [
        'Access to community forums',
        'Basic networking opportunities',
        'Monthly newsletter',
        'Event notifications'
      ],
      buttonText: 'Join Free',
      popular: false
    },
    {
      id: 'active_monthly',
      name: 'Active Member',
      price: 10,
      period: 'per month',
      description: 'Full access with monthly flexibility',
      features: [
        'All Free membership benefits',
        'Exclusive events access',
        'Voting rights in alumni elections',
        'Priority event registration',
        'Mentor matching program',
        'Professional development resources'
      ],
      buttonText: 'Start Monthly',
      popular: true
    },
    {
      id: 'active_yearly',
      name: 'Active Member',
      price: 120,
      period: 'per year',
      description: 'Best value for committed members',
      features: [
        'All Active Member benefits',
        '2 months free (vs monthly)',
        'Annual member appreciation gift',
        'Exclusive yearly retreat access',
        'Advanced networking tools',
        'Career coaching sessions'
      ],
      buttonText: 'Join Yearly',
      popular: false,
      savings: 'Save $24/year'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Member',
      price: 1200,
      period: 'one-time',
      description: 'Lifetime access and recognition',
      features: [
        'All Active Member benefits for life',
        'Exclusive merchandise discounts',
        'Special recognition on website',
        'Legacy member directory listing',
        'Annual board meeting invitation',
        'Exclusive lifetime member events'
      ],
      buttonText: 'Join for Life',
      popular: false,
      exclusive: true
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMembershipSelection = async (tier) => {
    if (!formData.name || !formData.email) {
      setMessage('Please fill in your name and email before selecting a membership.');
      return;
    }

    setSelectedTier(tier);
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API}/payments/create-checkout-session`, {
        membership_tier: tier.id,
        user_email: formData.email,
        user_name: formData.name
      });

      if (tier.id === 'free') {
        setMessage('Free membership created successfully! Welcome to ICAA!');
      } else if (response.data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url;
      } else {
        setMessage('Membership created successfully!');
      }
    } catch (error) {
      console.error('Error creating membership:', error);
      setMessage('Error creating membership. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'League Spartan' }}>
            Choose Your Membership
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join the ICAA community and unlock opportunities for professional growth, networking, and lifelong connections.
          </p>
        </div>
      </section>

      {/* Member Information Form */}
      <section className="py-12 bg-white">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Please provide your information to proceed with membership registration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  data-testid="member-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  data-testid="member-email-input"
                />
              </div>
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('Error') || message.includes('Please fill') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`} data-testid="membership-message">
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Membership Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Membership Options</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the membership level that best fits your needs and commitment to the ICAA community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {membershipTiers.map((tier, index) => (
              <Card 
                key={tier.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  tier.popular ? 'ring-2 ring-red-500 shadow-lg' : ''
                } ${tier.exclusive ? 'bg-gradient-to-br from-gray-900 to-black text-white' : ''}`}
                data-testid={`membership-card-${tier.id}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                )}
                {tier.savings && (
                  <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
                    {tier.savings}
                  </Badge>
                )}
                {tier.exclusive && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gold-500 text-black">
                    Exclusive
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <CardTitle className={`text-xl ${tier.exclusive ? 'text-white' : ''}`}>
                    {tier.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className={`text-4xl font-bold ${tier.exclusive ? 'text-white' : 'text-red-600'}`}>
                      ${tier.price}
                    </span>
                    <span className={`text-sm ${tier.exclusive ? 'text-gray-300' : 'text-gray-600'} ml-1`}>
                      {tier.period}
                    </span>
                  </div>
                  <CardDescription className={tier.exclusive ? 'text-gray-300' : ''}>
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                          tier.exclusive ? 'text-green-400' : 'text-green-500'
                        }`} />
                        <span className={`text-sm ${tier.exclusive ? 'text-gray-100' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${
                      tier.exclusive 
                        ? 'bg-white text-black hover:bg-gray-100' 
                        : tier.popular 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    onClick={() => handleMembershipSelection(tier)}
                    disabled={isLoading}
                    data-testid={`select-membership-${tier.id}`}
                  >
                    {isLoading && selectedTier?.id === tier.id ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {tier.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Become a Member?</h2>
            <p className="text-lg text-gray-600">
              Join a community of like-minded professionals and unlock your potential.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exclusive Access</h3>
              <p className="text-gray-600">
                Get access to member-only events, resources, and networking opportunities.
              </p>
            </div>
            <div className="text-center p-6">
              <img 
                src="https://images.unsplash.com/photo-1758599543132-ba9b306d715e" 
                alt="Professional networking" 
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-3">Professional Growth</h3>
              <p className="text-gray-600">
                Advance your career with mentorship, coaching, and development programs.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Impact</h3>
              <p className="text-gray-600">
                Make a difference in the Chicago tech community and support future generations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;