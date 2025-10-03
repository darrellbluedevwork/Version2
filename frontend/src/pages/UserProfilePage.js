import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, MapPin, Users, Award, Edit3, Camera, Mail, Cake, Tag, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserEvents();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}/events`);
      setUserEvents(response.data);
    } catch (err) {
      console.error('Error fetching user events:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMembershipTierLabel = (tier) => {
    const tiers = {
      'free': 'Free Member',
      'active_monthly': 'Monthly Member',
      'active_yearly': 'Yearly Member',
      'lifetime': 'Lifetime Member'
    };
    return tiers[tier] || tier;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800 border-green-200';
      case 'waitlisted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The profile you are looking for could not be found.'}</p>
          <Link to="/users">
            <Button className="bg-red-600 hover:bg-red-700">
              Browse Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <section className="relative py-12 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage 
                src={user.profile_photo_url ? `${BACKEND_URL}${user.profile_photo_url}` : undefined} 
                alt={user.name} 
              />
              <AvatarFallback className="bg-white text-red-600 text-2xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <div className="flex items-center gap-4 text-red-100">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{getMembershipTierLabel(user.membership_tier)}</span>
                </div>
                {user.is_verified_alumni && (
                  <Badge className="bg-white text-red-600">
                    Verified Alumni
                  </Badge>
                )}
              </div>
            </div>
            
            <Link to={`/users/${user.id}/edit`}>
              <Button variant="outline" className="bg-white text-red-600 border-white hover:bg-red-50">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio ? (
                  <p className="text-gray-700">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio available</p>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  {user.birthday && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Cake className="w-4 h-4" />
                      <span>Birthday: {formatDate(user.birthday)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.cohort && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>Cohort: {user.cohort}</span>
                    </div>
                  )}
                  
                  {user.program_track && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>Track: {user.program_track}</span>
                    </div>
                  )}
                </div>

                {user.interests && user.interests.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <Badge key={index} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event History
                </CardTitle>
                <CardDescription>
                  Events this user has registered for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userEvents.length > 0 ? (
                  <div className="space-y-4">
                    {userEvents.map((eventData, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{eventData.event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(eventData.event.date)} • {eventData.event.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            Registered: {formatDate(eventData.registered_at)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(eventData.registration_status)}>
                          {eventData.registration_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No event registrations found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-medium">{formatDate(user.created_at)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Events Attended</span>
                  <span className="font-medium">
                    {userEvents.filter(e => e.registration_status === 'registered').length}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={user.is_verified_alumni ? "default" : "secondary"}>
                    {user.is_verified_alumni ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/chat">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Add to Group
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;