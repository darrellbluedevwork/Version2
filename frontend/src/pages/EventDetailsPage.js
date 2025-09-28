import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    member_name: '',
    member_email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API}/events/${eventId}`);
      setEvent(response.data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setRegistrationForm({ ...registrationForm, [field]: value });
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegistrationStatus(null);

    try {
      const response = await axios.post(`${API}/events/${eventId}/register`, registrationForm);
      setRegistrationStatus({
        type: 'success',
        message: response.data.message,
        status: response.data.registration_status
      });
      setRegistrationForm({ member_name: '', member_email: '', notes: '' });
      
      // Refresh event data to show updated counts
      fetchEvent();
    } catch (err) {
      console.error('Error registering for event:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to register for event. Please try again.';
      setRegistrationStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const isEventFull = () => {
    return event?.capacity && event.current_registrations >= event.capacity;
  };

  const isEventPast = () => {
    return new Date(event?.date) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for could not be found.'}</p>
          <Link to="/events">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <div className="container py-6">
        <Link to="/events" className="inline-flex items-center text-red-600 hover:text-red-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>

      {/* Event Details */}
      <section className="pb-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Event Information */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Badge className={getEventTypeColor(event.event_type)} data-testid="event-type-badge">
                  {getEventTypeLabel(event.event_type)}
                </Badge>
                {isEventPast() && (
                  <Badge variant="secondary" className="ml-2">Event Completed</Badge>
                )}
                {isEventFull() && !isEventPast() && (
                  <Badge variant="destructive" className="ml-2">Full - Waitlist Available</Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6" data-testid="event-title">
                {event.title}
              </h1>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                      <p className="text-sm text-gray-600">Date</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{formatTime(event.date)}</p>
                      <p className="text-sm text-gray-600">Time</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{event.location}</p>
                      <p className="text-sm text-gray-600">Location</p>
                    </div>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.current_registrations}/{event.capacity} registered
                        </p>
                        <p className="text-sm text-gray-600">Capacity</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Description</h3>
                <div className="text-gray-700 whitespace-pre-wrap" data-testid="event-description">
                  {event.description}
                </div>
              </div>

              {/* Waitlist Information */}
              {event.waitlist_count > 0 && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Waitlist Information</h4>
                  <p className="text-sm text-yellow-700">
                    {event.waitlist_count} people are currently on the waitlist for this event.
                  </p>
                </div>
              )}
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8" data-testid="registration-card">
                <CardHeader>
                  <CardTitle>
                    {isEventPast() 
                      ? 'Event Completed' 
                      : isEventFull() 
                        ? 'Join Waitlist' 
                        : 'Register for Event'
                    }
                  </CardTitle>
                  <CardDescription>
                    {isEventPast() 
                      ? 'This event has already taken place.'
                      : isEventFull() 
                        ? 'Event is full, but you can join the waitlist.'
                        : 'Fill out the form below to register for this event.'
                    }
                  </CardDescription>
                </CardHeader>

                {!isEventPast() && (
                  <CardContent>
                    <form onSubmit={handleRegistration} className="space-y-4">
                      <div>
                        <Label htmlFor="member_name">Full Name *</Label>
                        <Input
                          id="member_name"
                          type="text"
                          value={registrationForm.member_name}
                          onChange={(e) => handleInputChange('member_name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                          data-testid="registration-name-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="member_email">Email Address *</Label>
                        <Input
                          id="member_email"
                          type="email"
                          value={registrationForm.member_email}
                          onChange={(e) => handleInputChange('member_email', e.target.value)}
                          placeholder="Enter your email address"
                          required
                          data-testid="registration-email-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={registrationForm.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Any special requirements or notes..."
                          className="min-h-[80px]"
                          data-testid="registration-notes-input"
                        />
                      </div>

                      {registrationStatus && (
                        <div 
                          className={`p-4 rounded-lg flex items-center ${
                            registrationStatus.type === 'success' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                          data-testid="registration-status"
                        >
                          {registrationStatus.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                          )}
                          <span className="text-sm">{registrationStatus.message}</span>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={isSubmitting}
                        data-testid="registration-submit-btn"
                      >
                        {isSubmitting 
                          ? 'Submitting...' 
                          : isEventFull() 
                            ? 'Join Waitlist' 
                            : 'Register Now'
                        }
                      </Button>
                    </form>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 text-center">
                        Registration is free for all ICAA events. You will receive a confirmation email after registration.
                      </p>
                    </div>
                  </CardContent>
                )}

                {/* Event Stats */}
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Registered:</span>
                      <span className="font-medium">{event.current_registrations}</span>
                    </div>
                    {event.capacity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{event.capacity}</span>
                      </div>
                    )}
                    {event.waitlist_count > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Waitlisted:</span>
                        <span className="font-medium">{event.waitlist_count}</span>
                      </div>
                    )}
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

export default EventDetailsPage;