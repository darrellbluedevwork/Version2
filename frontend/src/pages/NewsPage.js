import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewsPage = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setNewsData(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news articles');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Sample news data for demo if API fails
  const sampleNews = [
    {
      id: '1',
      title: 'ICAA Annual Networking Gala 2025',
      excerpt: 'Join us for our biggest networking event of the year featuring keynote speakers from top Chicago tech companies.',
      content: 'Full event details coming soon...',
      author: 'ICAA Events Team',
      published_date: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1590650046871-92c887180603'
    },
    {
      id: '2', 
      title: 'New Mentorship Program Launch',
      excerpt: 'Exciting news! We are launching our enhanced mentorship program to connect experienced alumni with recent graduates.',
      content: 'Program details coming soon...',
      author: 'ICAA Program Team',
      published_date: new Date(Date.now() - 86400000).toISOString(),
      image: 'https://images.unsplash.com/photo-1758520144420-3e5b22e9b9a4'
    },
    {
      id: '3',
      title: 'Professional Development Workshop Series',
      excerpt: 'Join our monthly workshop series covering topics from leadership development to technical skills enhancement.',
      content: 'Workshop details...',
      author: 'ICAA Education Team', 
      published_date: new Date(Date.now() - 172800000).toISOString(),
      image: 'https://images.unsplash.com/photo-1758519291037-db9ec86cda69'
    },
    {
      id: '4',
      title: 'Chicago Tech Community Spotlight',
      excerpt: 'Highlighting the amazing contributions of our alumni to the Chicago tech ecosystem and their career achievements.',
      content: 'Alumni spotlight...',
      author: 'ICAA Communications',
      published_date: new Date(Date.now() - 259200000).toISOString(), 
      image: 'https://images.unsplash.com/photo-1758599543132-ba9b306d715e'
    }
  ];

  const displayNews = newsData.length > 0 ? newsData : sampleNews;

  const upcomingEvents = [
    {
      title: 'Monthly Alumni Mixer',
      date: '2025-02-15',
      type: 'Networking',
      location: 'Downtown Chicago'
    },
    {
      title: 'Tech Leadership Workshop',
      date: '2025-02-22',
      type: 'Workshop',
      location: 'Virtual Event'
    },
    {
      title: 'Career Fair & Expo',
      date: '2025-03-01',
      type: 'Career',
      location: 'Chicago Convention Center'
    },
    {
      title: 'Spring Alumni Retreat',
      date: '2025-03-15',
      type: 'Retreat',
      location: 'Lake Geneva, WI'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'League Spartan' }}>
            News & Updates
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Stay connected with the latest happenings in the ICAA community, upcoming events, and alumni achievements.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* News Articles */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
                {error && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    Demo Content
                  </Badge>
                )}
              </div>

              <div className="space-y-8">
                {displayNews.map((article, index) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-all duration-300" data-testid={`news-article-${index}`}>
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Article Image */}
                      <div className="md:col-span-1">
                        <div 
                          className="h-48 md:h-full bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url('${article.image || 'https://images.unsplash.com/photo-1590650046871-92c887180603'}')` 
                          }}
                        ></div>
                      </div>

                      {/* Article Content */}
                      <div className="md:col-span-2">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              News
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(article.published_date)}
                            </div>
                          </div>
                          <CardTitle className="text-xl hover:text-red-600 transition-colors">
                            {article.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            {article.author}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {article.excerpt}
                          </p>
                          <Button 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            data-testid={`read-more-${index}`}
                          >
                            Read More 
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {displayNews.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No news articles available at the moment.</p>
                  <Button variant="outline" onClick={fetchNews}>
                    Refresh
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Events */}
              <Card data-testid="upcoming-events">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-red-600" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>
                    Don't miss these upcoming ICAA events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="border-l-4 border-l-red-500 pl-4 py-2" data-testid={`event-${index}`}>
                        <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {event.type}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700" data-testid="view-all-events">
                    View All Events
                  </Button>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card>
                <CardHeader>
                  <CardTitle>Stay Updated</CardTitle>
                  <CardDescription>
                    Subscribe to our newsletter for the latest updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Get monthly updates about ICAA events, member spotlights, and community news delivered to your inbox.
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700" data-testid="newsletter-signup-btn">
                    Subscribe to Newsletter
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <a href="/membership" className="block text-sm text-red-600 hover:text-red-700 font-medium">
                      → Become a Member
                    </a>
                    <a href="/contact" className="block text-sm text-red-600 hover:text-red-700 font-medium">
                      → Contact Us
                    </a>
                    <a href="/newsletter" className="block text-sm text-red-600 hover:text-red-700 font-medium">
                      → View Newsletters
                    </a>
                    <a href="#" className="block text-sm text-red-600 hover:text-red-700 font-medium">
                      → Event Calendar
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;