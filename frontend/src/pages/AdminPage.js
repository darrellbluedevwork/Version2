import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Mail, MessageSquare, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Data states
  const [newsArticles, setNewsArticles] = useState([]);
  const [members, setMembers] = useState([]);
  const [contactForms, setContactForms] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [newsRes, membersRes, contactRes, subscribersRes] = await Promise.all([
        axios.get(`${API}/news`).catch(() => ({ data: [] })),
        axios.get(`${API}/members`).catch(() => ({ data: [] })),
        axios.get(`${API}/contact`).catch(() => ({ data: [] })),
        axios.get(`${API}/newsletter/subscribers`).catch(() => ({ data: [] }))
      ]);

      setNewsArticles(newsRes.data);
      setMembers(membersRes.data);
      setContactForms(contactRes.data);
      setNewsletterSubscribers(subscribersRes.data);
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

  const handleInputChange = (field, value) => {
    setNewsForm({ ...newsForm, [field]: value });
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

  const stats = [
    {
      title: 'Total Members',
      value: members.length,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Newsletter Subscribers',
      value: newsletterSubscribers.length,
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Contact Messages',
      value: contactForms.length,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-purple-500'
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
          <p className="text-gray-600">Manage content, members, and community communications</p>
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
        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="news" data-testid="admin-tab-news">News Management</TabsTrigger>
            <TabsTrigger value="members" data-testid="admin-tab-members">Members</TabsTrigger>
            <TabsTrigger value="contact" data-testid="admin-tab-contact">Contact Forms</TabsTrigger>
            <TabsTrigger value="newsletter" data-testid="admin-tab-newsletter">Newsletter</TabsTrigger>
          </TabsList>

          {/* News Management */}
          <TabsContent value="news" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Create News Post */}
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

                    {submitStatus && (
                      <div className={`p-4 rounded-lg ${
                        submitStatus === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`} data-testid="news-submit-status">
                        {submitStatus === 'success' 
                          ? 'News article published successfully!' 
                          : 'Error publishing article. Please try again.'
                        }
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

              {/* Published Articles */}
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
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs text-red-600">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
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

          {/* Members Tab */}
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

          {/* Contact Forms Tab */}
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
                      <Button size="sm" variant="outline" className="mt-3 text-xs">
                        Reply
                      </Button>
                    </div>
                  ))}
                  {contactForms.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No contact forms submitted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter" className="space-y-6">
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
                      <div className="flex items-center gap-2">
                        <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                          {subscriber.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          Manage
                        </Button>
                      </div>
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