import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Mail, MessageSquare, Eye, Upload, FileText, Download, Calendar, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const [newsForm, setNewsForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'ICAA Admin'
  });
  const [newsletterForm, setNewsletterForm] = useState({
    title: '',
    description: '',
    month: ''
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: '',
    date: '',
    location: '',
    capacity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(null);

  // Data states
  const [newsArticles, setNewsArticles] = useState([]);
  const [members, setMembers] = useState([]);
  const [contactForms, setContactForms] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [newsRes, membersRes, contactRes, subscribersRes, newslettersRes, eventsRes] = await Promise.all([
        axios.get(`${API}/news`).catch(() => ({ data: [] })),
        axios.get(`${API}/members`).catch(() => ({ data: [] })),
        axios.get(`${API}/contact`).catch(() => ({ data: [] })),
        axios.get(`${API}/newsletter/subscribers`).catch(() => ({ data: [] })),
        axios.get(`${API}/newsletters`).catch(() => ({ data: [] })),
        axios.get(`${API}/events`).catch(() => ({ data: [] }))
      ]);

      setNewsArticles(newsRes.data);
      setMembers(membersRes.data);
      setContactForms(contactRes.data);
      setNewsletterSubscribers(subscribersRes.data);
      setNewsletters(newslettersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await axios.post(`${API}/news`, newsForm);
      setSubmitStatus('success');
      setNewsForm({ title: '', excerpt: '', content: '', author: 'ICAA Admin' });
      fetchData(); // Refresh news list
    } catch (error) {
      console.error('Error creating news post:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await axios.post(`${API}/newsletters`, newsletterForm);
      setSubmitStatus('newsletter-success');
      setNewsletterForm({ title: '', description: '', month: '' });
      fetchData(); // Refresh newsletter list
    } catch (error) {
      console.error('Error creating newsletter:', error);
      setSubmitStatus('newsletter-error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const eventData = {
        ...eventForm,
        date: new Date(eventForm.date).toISOString(),
        capacity: eventForm.capacity ? parseInt(eventForm.capacity) : null
      };
      await axios.post(`${API}/events`, eventData);
      setSubmitStatus('event-success');
      setEventForm({ title: '', description: '', event_type: '', date: '', location: '', capacity: '' });
      fetchData(); // Refresh events list
    } catch (error) {
      console.error('Error creating event:', error);
      setSubmitStatus('event-error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfUpload = async (newsletterId, file) => {
    setUploadingPdf(newsletterId);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API}/newsletters/${newsletterId}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchData(); // Refresh to show updated newsletter with PDF
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Error uploading PDF. Please try again.');
    } finally {
      setUploadingPdf(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${API}/events/${eventId}`);
        fetchData(); // Refresh events list
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNewsForm({ ...newsForm, [field]: value });
  };

  const handleNewsletterInputChange = (field, value) => {
    setNewsletterForm({ ...newsletterForm, [field]: value });
  };

  const handleEventInputChange = (field, value) => {
    setEventForm({ ...eventForm, [field]: value });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEventDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  // Quick Third Thursday template
  const fillThirdThursdayTemplate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Find third Thursday of current month
    const firstDay = new Date(year, month, 1);
    const firstThursday = 1 + (4 - firstDay.getDay() + 7) % 7;
    const thirdThursday = firstThursday + 14;
    const thirdThursdayDate = new Date(year, month, thirdThursday, 18, 0); // 6 PM

    setEventForm({
      title: `Third Thursday Alumni Mixer - ${thirdThursdayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      description: `Join us for our monthly Third Thursday Alumni Mixer! Connect with fellow ICAA alumni over drinks and networking in a relaxed, professional environment. This is a great opportunity to expand your network, share experiences, and build lasting professional relationships.

Event includes:
• Welcome drinks and light appetizers
• Structured networking activities
• Updates from ICAA leadership
• Optional group photo

Dress code: Business casual
Cost: Free for all ICAA members and alumni`,
      event_type: 'third_thursday',
      date: thirdThursdayDate.toISOString().slice(0, 16), // Format for datetime-local input
      location: 'Chicago Downtown (Location TBD)',
      capacity: '50'
    });
  };

  const stats = [
    {
      title: 'Total Members',
      value: members.length,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Upcoming Events',
      value: events.filter(event => new Date(event.date) >= new Date()).length,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Newsletter Subscribers',
      value: newsletterSubscribers.length,
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Published Articles',
      value: newsArticles.length,
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ICAA Admin Dashboard</h1>
          <p className="text-gray-600">Manage content, events, members, newsletters, and community communications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="events" data-testid="admin-tab-events">Events</TabsTrigger>
            <TabsTrigger value="news" data-testid="admin-tab-news">News</TabsTrigger>
            <TabsTrigger value="newsletters" data-testid="admin-tab-newsletters">Newsletters</TabsTrigger>
            <TabsTrigger value="members" data-testid="admin-tab-members">Members</TabsTrigger>
            <TabsTrigger value="contact" data-testid="admin-tab-contact">Contact</TabsTrigger>
            <TabsTrigger value="subscribers" data-testid="admin-tab-subscribers">Subscribers</TabsTrigger>
          </TabsList>

          {/* Event Management */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Create Event */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Event</CardTitle>
                  <CardDescription>
                    Add a new event for the ICAA community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fillThirdThursdayTemplate}
                      className="w-full mb-4"
                      data-testid="third-thursday-template-btn"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Use Third Thursday Template
                    </Button>
                  </div>

                  <form onSubmit={handleEventSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="event-title">Event Title *</Label>
                      <Input
                        id="event-title"
                        value={eventForm.title}
                        onChange={(e) => handleEventInputChange('title', e.target.value)}
                        placeholder="Enter event title"
                        required
                        data-testid="event-title-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event-type">Event Type *</Label>
                      <Select value={eventForm.event_type} onValueChange={(value) => handleEventInputChange('event_type', value)}>
                        <SelectTrigger data-testid="event-type-select">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="third_thursday">Third Thursday</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="professional_development">Professional Development</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="event-date">Date & Time *</Label>
                        <Input
                          id="event-date"
                          type="datetime-local"
                          value={eventForm.date}
                          onChange={(e) => handleEventInputChange('date', e.target.value)}
                          required
                          data-testid="event-date-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-capacity">Capacity</Label>
                        <Input
                          id="event-capacity"
                          type="number"
                          value={eventForm.capacity}
                          onChange={(e) => handleEventInputChange('capacity', e.target.value)}
                          placeholder="Leave empty for unlimited"
                          data-testid="event-capacity-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="event-location">Location *</Label>
                      <Input
                        id="event-location"
                        value={eventForm.location}
                        onChange={(e) => handleEventInputChange('location', e.target.value)}
                        placeholder="Enter event location"
                        required
                        data-testid="event-location-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event-description">Description *</Label>
                      <Textarea
                        id="event-description"
                        value={eventForm.description}
                        onChange={(e) => handleEventInputChange('description', e.target.value)}
                        placeholder="Describe the event..."
                        className="min-h-[120px]"
                        required
                        data-testid="event-description-input"
                      />
                    </div>

                    {submitStatus === 'event-success' && (
                      <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
                        Event created successfully!
                      </div>
                    )}

                    {submitStatus === 'event-error' && (
                      <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                        Error creating event. Please try again.
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isSubmitting}
                      data-testid="create-event-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Creating...' : 'Create Event'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Event List */}
              <Card>
                <CardHeader>
                  <CardTitle>Manage Events</CardTitle>
                  <CardDescription>
                    View and manage all ICAA events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {events.map((event, index) => (
                      <div key={event.id} className="border rounded-lg p-4" data-testid={`event-item-${index}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{event.title}</h4>
                            <p className="text-xs text-gray-600 mb-1">{getEventTypeLabel(event.event_type)}</p>
                            <div className="flex items-center text-xs text-gray-600 mb-2">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatEventDate(event.date)}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={new Date(event.date) >= new Date() ? 'default' : 'secondary'} className="mb-1">
                              {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                            </Badge>
                            {event.capacity && (
                              <p className="text-xs text-gray-500">
                                {event.current_registrations}/{event.capacity} registered
                              </p>
                            )}
                            {event.waitlist_count > 0 && (
                              <p className="text-xs text-yellow-600">
                                {event.waitlist_count} waitlisted
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => window.open(`/events/${event.id}`, '_blank')}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No events created yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* News Management (keeping existing code) */}
          <TabsContent value="news" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Create News Post</CardTitle>
                  <CardDescription>
                    Add a new news article or announcement for the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewsSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newsForm.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter article title"
                        required
                        data-testid="news-title-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={newsForm.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        placeholder="Author name"
                        data-testid="news-author-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt *</Label>
                      <Textarea
                        id="excerpt"
                        value={newsForm.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        placeholder="Brief description of the article"
                        className="min-h-[80px]"
                        required
                        data-testid="news-excerpt-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={newsForm.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="Full article content"
                        className="min-h-[200px]"
                        required
                        data-testid="news-content-input"
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200" data-testid="news-submit-status">
                        News article published successfully!
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                        Error publishing article. Please try again.
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isSubmitting}
                      data-testid="publish-news-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Publishing...' : 'Publish Article'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Published Articles</CardTitle>
                  <CardDescription>
                    Recent news articles and announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {newsArticles.map((article, index) => (
                      <div key={article.id} className="border rounded-lg p-4" data-testid={`published-article-${index}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{article.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(article.published_date)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">By: {article.author}</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{article.excerpt}</p>
                      </div>
                    ))}
                    {newsArticles.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No articles published yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Newsletter Management (keeping existing code) */}
          <TabsContent value="newsletters" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Create Newsletter</CardTitle>
                  <CardDescription>
                    Add a new monthly newsletter entry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="newsletter-title">Title *</Label>
                      <Input
                        id="newsletter-title"
                        value={newsletterForm.title}
                        onChange={(e) => handleNewsletterInputChange('title', e.target.value)}
                        placeholder="e.g., ICAA Newsletter - January 2025"
                        required
                        data-testid="newsletter-title-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newsletter-month">Month *</Label>
                      <Input
                        id="newsletter-month"
                        type="month"
                        value={newsletterForm.month}
                        onChange={(e) => handleNewsletterInputChange('month', e.target.value)}
                        required
                        data-testid="newsletter-month-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newsletter-description">Description *</Label>
                      <Textarea
                        id="newsletter-description"
                        value={newsletterForm.description}
                        onChange={(e) => handleNewsletterInputChange('description', e.target.value)}
                        placeholder="Brief description of this newsletter issue"
                        className="min-h-[100px]"
                        required
                        data-testid="newsletter-description-input"
                      />
                    </div>

                    {submitStatus === 'newsletter-success' && (
                      <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
                        Newsletter created successfully! You can now upload a PDF.
                      </div>
                    )}

                    {submitStatus === 'newsletter-error' && (
                      <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                        Error creating newsletter. Please try again.
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isSubmitting}
                      data-testid="create-newsletter-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Creating...' : 'Create Newsletter'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Published Newsletters</CardTitle>
                  <CardDescription>
                    Manage newsletter issues and upload PDFs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {newsletters.map((newsletter, index) => (
                      <div key={newsletter.id} className="border rounded-lg p-4" data-testid={`newsletter-item-${index}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{newsletter.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">Month: {newsletter.month}</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{newsletter.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(newsletter.uploaded_at)}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-2">
                          {newsletter.pdf_filename ? (
                            <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-sm text-green-700">PDF Uploaded</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => window.open(`${API}/newsletters/${newsletter.id}/pdf`, '_blank')}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handlePdfUpload(newsletter.id, file);
                                  }
                                }}
                                className="hidden"
                                id={`pdf-${newsletter.id}`}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => document.getElementById(`pdf-${newsletter.id}`).click()}
                                disabled={uploadingPdf === newsletter.id}
                                data-testid={`upload-pdf-${newsletter.id}`}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                {uploadingPdf === newsletter.id ? 'Uploading...' : 'Upload PDF'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {newsletters.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No newsletters created yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab (keeping existing code) */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Member List</CardTitle>
                <CardDescription>
                  All registered ICAA members and their membership status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {members.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between border rounded-lg p-4" data-testid={`member-${index}`}>
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500">Joined: {formatDate(member.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={member.payment_status === 'active' ? 'default' : 'secondary'}
                          className="mb-1"
                        >
                          {member.membership_tier.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Status: {member.payment_status}
                        </p>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No members found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Forms Tab (keeping existing code) */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Form Submissions</CardTitle>
                <CardDescription>
                  Messages and inquiries from website visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {contactForms.map((form, index) => (
                    <div key={form.id} className="border rounded-lg p-4" data-testid={`contact-form-${index}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{form.name}</h4>
                          <p className="text-sm text-gray-600">{form.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(form.created_at)}
                        </Badge>
                      </div>
                      <h5 className="font-medium text-sm mb-1">{form.subject}</h5>
                      <p className="text-sm text-gray-700 line-clamp-3">{form.message}</p>
                    </div>
                  ))}
                  {contactForms.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No contact forms submitted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletter Subscribers Tab (keeping existing code) */}
          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
                <CardDescription>
                  Manage newsletter subscriptions and subscriber list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {newsletterSubscribers.map((subscriber, index) => (
                    <div key={subscriber.id} className="flex items-center justify-between border rounded-lg p-4" data-testid={`newsletter-subscriber-${index}`}>
                      <div>
                        <p className="font-semibold">{subscriber.email}</p>
                        <p className="text-xs text-gray-500">
                          Subscribed: {formatDate(subscriber.subscribed_at)}
                        </p>
                      </div>
                      <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                        {subscriber.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  {newsletterSubscribers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No newsletter subscribers yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;