import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterType]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by event type
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.event_type === filterType);
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventTypeLabel = (type) => {
    const typeLabels = {
      'networking': 'Networking',
      'professional_development': 'Professional Development',
      'social': 'Social',
      'third_thursday': 'Third Thursday',
      'other': 'Other'
    };
    return typeLabels[type] || type;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'networking': 'bg-blue-100 text-blue-800',
      'professional_development': 'bg-green-100 text-green-800',
      'social': 'bg-purple-100 text-purple-800',
      'third_thursday': 'bg-red-100 text-red-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const isEventFull = (event) => {
    return event.capacity && event.current_registrations >= event.capacity;
  };

  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = filteredEvents.filter(event => new Date(event.date) < new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
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
            ICAA Events
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Connect, learn, and grow with fellow ICAA alumni through our engaging events and networking opportunities.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="events-search"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="third_thursday">Third Thursday</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="professional_development">Professional Development</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-lg text-gray-600">
              Register for upcoming ICAA events and networking opportunities.
            </p>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <Card key={event.id} className="hover:shadow-xl transition-all duration-300" data-testid={`upcoming-event-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {getEventTypeLabel(event.event_type)}
                      </Badge>
                      {isEventFull(event) && (
                        <Badge variant="destructive">Full</Badge>
                      )}
                      {event.waitlist_count > 0 && !isEventFull(event) && (
                        <Badge variant="outline">{event.waitlist_count} on waitlist</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-red-600" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-red-600" />
                        {formatTime(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        {event.location}
                      </div>
                      {event.capacity && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-red-600" />
                          {event.current_registrations}/{event.capacity} registered
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm mb-6 line-clamp-3">
                      {event.description}
                    </p>

                    <Link to={`/events/${event.id}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700" data-testid={`view-event-${event.id}`}>
                        {isEventFull(event) ? 'Join Waitlist' : 'Register Now'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Events</h3>
              <p className="text-gray-500">
                {events.length === 0 
                  ? "No events have been scheduled yet. Check back soon!"
                  : "No events match your current search criteria."
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Past Events</h2>
              <p className="text-lg text-gray-600">
                Look back at recent ICAA events and community gatherings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event, index) => (
                <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity duration-300" data-testid={`past-event-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getEventTypeColor(event.event_type)} variant="outline">
                        {getEventTypeLabel(event.event_type)}
                      </Badge>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-red-600" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        {event.location}
                      </div>
                      {event.capacity && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-red-600" />
                          {event.current_registrations} attended
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated on Events</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Don't miss out on upcoming ICAA events. Join our community to get notified about new events and opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/membership">
              <Button className="bg-white text-red-600 hover:bg-gray-100">
                Become a Member
              </Button>
            </Link>
            <Link to="/newsletter">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
                View Newsletter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;