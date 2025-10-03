import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, Award, MapPin, GraduationCap, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCohort, setFilterCohort] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterCohort, filterTrack]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.interests && user.interests.some(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Filter by cohort
    if (filterCohort !== 'all') {
      filtered = filtered.filter(user => user.cohort === filterCohort);
    }

    // Filter by program track
    if (filterTrack !== 'all') {
      filtered = filtered.filter(user => user.program_track === filterTrack);
    }

    setFilteredUsers(filtered);
  };

  const getMembershipTierLabel = (tier) => {
    const tiers = {
      'free': 'Free',
      'active_monthly': 'Monthly',
      'active_yearly': 'Yearly',
      'lifetime': 'Lifetime'
    };
    return tiers[tier] || tier;
  };

  const getMembershipTierColor = (tier) => {
    switch (tier) {
      case 'lifetime': return 'bg-gold-100 text-gold-800 border-gold-200';
      case 'active_yearly': return 'bg-green-100 text-green-800 border-green-200';
      case 'active_monthly': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get unique cohorts and tracks for filtering
  const uniqueCohorts = [...new Set(users.map(user => user.cohort).filter(Boolean))].sort();
  const uniqueTracks = [...new Set(users.map(user => user.program_track).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
            ICAA Community
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Connect with fellow alumni, discover shared interests, and build lasting professional relationships within the i.c.stars community.
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
                placeholder="Search by name, email, interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCohort} onValueChange={setFilterCohort}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                {uniqueCohorts.map((cohort) => (
                  <SelectItem key={cohort} value={cohort}>
                    {cohort}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTrack} onValueChange={setFilterTrack}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                {uniqueTracks.map((track) => (
                  <SelectItem key={track} value={track}>
                    {track}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Users Grid */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alumni Directory ({filteredUsers.length} members)
            </h2>
            <p className="text-lg text-gray-600">
              Connect with alumni from your cohort and across different program tracks.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {filteredUsers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="group hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage 
                        src={user.profile_photo_url ? `${BACKEND_URL}${user.profile_photo_url}` : undefined} 
                        alt={user.name} 
                      />
                      <AvatarFallback className="text-lg font-bold">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <CardTitle className="text-lg mb-1">{user.name}</CardTitle>
                      <CardDescription className="text-sm">{user.email}</CardDescription>
                    </div>
                    
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge className={getMembershipTierColor(user.membership_tier)}>
                        {getMembershipTierLabel(user.membership_tier)}
                      </Badge>
                      {user.is_verified_alumni && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {user.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    <div className="space-y-2">
                      {user.cohort && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <GraduationCap className="w-3 h-3" />
                          <span>Cohort {user.cohort}</span>
                        </div>
                      )}
                      
                      {user.program_track && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Tag className="w-3 h-3" />
                          <span>{user.program_track}</span>
                        </div>
                      )}
                    </div>

                    {user.interests && user.interests.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Interests:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.interests.slice(0, 3).map((interest, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {user.interests.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.interests.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3">
                      <Link to={`/users/${user.id}`} className="block">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Users Found</h3>
              <p className="text-gray-500">
                {users.length === 0 
                  ? "No users have registered yet. Be the first to join!"
                  : "No users match your current search criteria. Try adjusting your filters."
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Community</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete your profile to connect with fellow alumni and unlock the full potential of the ICAA network.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/membership">
              <Button className="bg-red-600 hover:bg-red-700 px-8 py-3 text-lg">
                <Award className="w-5 h-5 mr-2" />
                Become a Member
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;