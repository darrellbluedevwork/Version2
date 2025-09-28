import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, User, Phone, Mail, Calendar, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const BoardPage = () => {
  const boardMembers = [
    {
      name: "Darrell Blue",
      title: "President",
      role: "Chief executive officer and official representative of the iCAA.",
      responsibilities: "Provides leadership and strategic direction, presides over meetings, represents the iCAA in community and alumni affairs, and ensures the sustainability and growth of the association.",
      keyDuties: [
        "Calls and presides over Executive Committee meetings",
        "Provides strategic direction and ensures sustainability",
        "Serves as primary representative of the iCAA",
        "Forms and dissolves committees as needed"
      ]
    },
    {
      name: "Jeremy Washington", 
      title: "Vice President (Interim)",
      role: "Supports the President and steps in when needed to ensure smooth operations.",
      responsibilities: "Oversees strategic initiatives, leads marketing and newsletter efforts, and fosters cross-committee collaboration to align programs with the iCAA's mission.",
      keyDuties: [
        "Assumes President duties when needed",
        "Oversees iCAA Marketing and Newsletter",
        "Leads cross-committee collaboration",
        "Manages unique initiatives and programs"
      ]
    },
    {
      name: "Jonathan Ramirez",
      title: "Secretary", 
      role: "Maintains the records and communications of the iCAA.",
      responsibilities: "Records minutes, manages the iCAA Newsletter, assists with official communications, and ensures transparency in decision-making.",
      keyDuties: [
        "Records and maintains meeting minutes",
        "Manages monthly iCAA Newsletter content",
        "Assists with official iCAA communications",
        "Ensures transparency in decision-making"
      ]
    },
    {
      name: "Jhordan Alexander Howard",
      title: "Treasurer",
      role: "Manages the financial affairs of the iCAA.",
      responsibilities: "Oversees all financial transactions, prepares budgets and reports, maintains accurate records, and ensures funding for programs through financial stewardship and fundraising efforts.",
      keyDuties: [
        "Manages all financial transactions",
        "Submits quarterly and annual financial reports",
        "Develops and maintains annual budget",
        "Secures grants and sponsorships"
      ]
    },
    {
      name: "Katherine Cooper",
      title: "Parliamentarian", 
      role: "Ensures adherence to bylaws and proper meeting conduct.",
      responsibilities: "Guides meetings according to Robert's Rules of Order, advises on governance, preserves historical records, and upholds the integrity of decision-making.",
      keyDuties: [
        "Ensures meetings follow Robert's Rules of Order",
        "Organizes and archives important documents",
        "Advises on governance protocols",
        "Maintains order and decision-making integrity"
      ]
    }
  ];

  const getTitleColor = (title) => {
    const colors = {
      'President': 'bg-red-600',
      'Vice President (Interim)': 'bg-blue-600', 
      'Secretary': 'bg-green-600',
      'Treasurer': 'bg-purple-600',
      'Parliamentarian': 'bg-orange-600'
    };
    return colors[title] || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <div className="container py-6">
        <Link to="/about" className="inline-flex items-center text-red-600 hover:text-red-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to About
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pb-16">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'League Spartan' }}>
              Leadership at the iCAA
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The Board Members of the iCAA serve as the guiding leadership body of our alumni community. 
              They ensure our mission is fulfilled, our programs thrive, and our members remain connected.
            </p>
          </div>

          {/* Board Members Image */}
          <div className="mb-16">
            <img 
              src="https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/a55ymhil_IMG_1252.jpeg" 
              alt="ICAA Board Members" 
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
            />
          </div>

          {/* Governance Note */}
          <div className="max-w-3xl mx-auto mb-16">
            <Card className="border-l-4 border-l-red-500 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Board Independence</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Board members may not concurrently serve as i.c.stars |* staff, either as employees 
                      or contractors, to preserve independence and accountability in governance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Board Members Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {boardMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300" data-testid={`board-member-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`${getTitleColor(member.title)} text-white`}>
                      {member.title}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{member.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-gray-700">
                    {member.role}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Responsibilities</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {member.responsibilities}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Duties</h4>
                    <ul className="space-y-2">
                      {member.keyDuties.map((duty, dutyIndex) => (
                        <li key={dutyIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{duty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Board Structure */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Users className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Board Structure</CardTitle>
                <CardDescription>
                  The iCAA Executive Committee consists of five key leadership positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Executive Leadership</h3>
                    <p className="text-sm text-gray-600">
                      President and Vice President provide strategic direction and organizational leadership.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Operations</h3>
                    <p className="text-sm text-gray-600">
                      Secretary and Treasurer manage communications, records, and financial operations.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Governance</h3>
                    <p className="text-sm text-gray-600">
                      Parliamentarian ensures proper procedures and adherence to organizational bylaws.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Commitment */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Committed to Excellence</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Our board members volunteer their time and expertise to ensure the iCAA continues to serve 
              as a powerful force for alumni engagement, professional development, and community impact. 
              Through their leadership, we maintain the high standards that make i.c.stars |* alumni 
              effective change agents in their communities and careers.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">5</div>
                <div className="text-gray-600 font-medium">Board Positions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Alumni-Led</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Community Focused</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Connect with Our Leadership</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Have questions about the iCAA or want to get more involved? Our board members are here 
            to support our alumni community and welcome your engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3">
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
            </Link>
            <Link to="/membership">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-3">
                <Users className="w-4 h-4 mr-2" />
                Join Our Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BoardPage;