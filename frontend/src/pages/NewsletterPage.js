import React, { useState } from 'react';
import { Mail, Download, Calendar, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewsletterPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  const handleNewsletterSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      await axios.post(`${API}/newsletter/subscribe`, { email });
      setSubscriptionStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setSubscriptionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Newsletter archives - from November 2024 to current
  const newsletters = [
    {
      id: '2025-01',
      title: 'ICAA Newsletter - January 2025',
      date: '2025-01-15',
      description: 'New Year, New Opportunities: Kicking off 2025 with exciting member updates and upcoming events.',
      downloadUrl: '#',
      featured: true
    },
    {
      id: '2024-12',
      title: 'ICAA Newsletter - December 2024',
      date: '2024-12-15',
      description: 'Year-end celebration highlights and looking ahead to 2025 initiatives.',
      downloadUrl: '#'
    },
    {
      id: '2024-11',
      title: 'ICAA Newsletter - November 2024',
      date: '2024-11-15',
      description: 'Fall networking events recap and holiday season community activities.',
      downloadUrl: '#'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'League Spartan' }}>
            ICAA Newsletter
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Stay connected with monthly updates, member spotlights, and community news delivered straight to your inbox.
          </p>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-3xl">Subscribe to Our Newsletter</CardTitle>
              <CardDescription className="text-lg">
                Get the latest ICAA news, event announcements, and member spotlights delivered monthly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto">
                <div className="flex gap-4 mb-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                    data-testid="newsletter-email-input"
                  />
                  <Button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-700 px-8"
                    disabled={isSubmitting}
                    data-testid="newsletter-subscribe-btn"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>

                {subscriptionStatus && (
                  <div className={`p-4 rounded-lg text-center ${
                    subscriptionStatus === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`} data-testid="newsletter-subscription-status">
                    {subscriptionStatus === 'success' ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Successfully subscribed! Check your email for confirmation.
                      </div>
                    ) : (
                      'There was an error subscribing. Please try again.'
                    )}
                  </div>
                )}
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  By subscribing, you agree to receive monthly newsletters from ICAA. 
                  You can unsubscribe at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter Archives */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Newsletter Archive</h2>
            <p className="text-lg text-gray-600">
              Browse our past newsletters to stay caught up on ICAA community updates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {newsletters.map((newsletter, index) => (
              <Card 
                key={newsletter.id} 
                className={`hover:shadow-xl transition-all duration-300 ${
                  newsletter.featured ? 'ring-2 ring-red-500 shadow-lg' : ''
                }`}
                data-testid={`newsletter-${newsletter.id}`}
              >
                {newsletter.featured && (
                  <Badge className="absolute -top-3 left-4 bg-red-500 text-white">
                    Latest Issue
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Newsletter
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(newsletter.date)}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{newsletter.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {newsletter.description}
                  </p>

                  {/* PDF Preview Area */}
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">PDF Newsletter</p>
                    <p className="text-xs text-gray-500">Interactive page turning available</p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      data-testid={`view-newsletter-${newsletter.id}`}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View Newsletter
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      data-testid={`download-newsletter-${newsletter.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" className="px-8">
              Load More Issues
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Preview */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What to Expect</h2>
            <p className="text-lg text-gray-600">
              Each monthly newsletter includes these valuable sections:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Community Highlights</h3>
                  <p className="text-gray-600 text-sm">
                    Spotlights on member achievements, new initiatives, and community impact stories.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Upcoming Events</h3>
                  <p className="text-gray-600 text-sm">
                    Detailed information about networking events, workshops, and professional development opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Professional Development</h3>
                  <p className="text-gray-600 text-sm">
                    Career advice, industry insights, and resources to help you advance professionally.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Member Spotlights</h3>
                  <p className="text-gray-600 text-sm">
                    Featured interviews and success stories from our diverse alumni community.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Job Opportunities</h3>
                  <p className="text-gray-600 text-sm">
                    Exclusive job postings and career opportunities shared within our network.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Community Updates</h3>
                  <p className="text-gray-600 text-sm">
                    Organization news, policy updates, and important announcements for members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsletterPage;