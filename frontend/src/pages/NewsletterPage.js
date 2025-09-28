import React, { useState } from 'react';
import { Mail, Download, Calendar, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const NewsletterPage = () => {
  // Newsletter archives - from November 2024 to current
  const newsletters = [
    {
      id: '2025-01',
      title: 'ICAA Newsletter - January 2025',
      date: '2025-01-15',
      description: 'New Year, New Opportunities: Kicking off 2025 with exciting member updates and upcoming events.',
      downloadUrl: '#',
      featured: true,
      image: 'https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/tlr7ww7g_IMG_3339.jpeg'
    },
    {
      id: '2024-12',
      title: 'ICAA Newsletter - December 2024',
      date: '2024-12-15',
      description: 'Year-end celebration highlights and looking ahead to 2025 initiatives.',
      downloadUrl: '#',
      image: 'https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/8vmg9742_IMG_2965.jpeg'
    },
    {
      id: '2024-11',
      title: 'ICAA Newsletter - November 2024',
      date: '2024-11-15',
      description: 'Fall networking events recap and holiday season community activities.',
      downloadUrl: '#',
      image: 'https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/33jxbg83_5.png'
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
            ICAA Newsletter Archive
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Browse our monthly newsletter archive featuring community updates, member spotlights, and event highlights - completely free to access!
          </p>
        </div>
      </section>

      {/* Newsletter Benefits */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Informed with ICAA</h2>
            <p className="text-lg text-gray-600">
              Our monthly newsletters keep you connected with the ICAA community, featuring the latest news, events, and member achievements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Monthly Updates</h3>
              <p className="text-gray-600">
                Get the latest ICAA news, upcoming events, and important announcements delivered monthly.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Member Spotlights</h3>
              <p className="text-gray-600">
                Read inspiring stories and achievements from our diverse alumni community.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Event Highlights</h3>
              <p className="text-gray-600">
                Catch up on past events and get early access to information about upcoming gatherings.
              </p>
            </div>
          </div>
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
                className={`relative transition-all duration-300 hover:shadow-xl ${
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
                  {/* Newsletter preview with actual ICAA photo */}
                  <div className="mb-4">
                    <img 
                      src={newsletter.image} 
                      alt={`Newsletter ${newsletter.id} preview`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>

                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {newsletter.description}
                  </p>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      data-testid={`view-newsletter-${newsletter.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Read Newsletter
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

          {/* Call to Action */}
          <div className="text-center mt-12 p-8 bg-red-50 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Want to Get Involved?</h3>
            <p className="text-gray-600 mb-6">
              If you have news, achievements, or stories to share in our newsletter, we'd love to hear from you!
            </p>
            <Button className="bg-red-600 hover:bg-red-700">
              Submit Your Story
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsletterPage;