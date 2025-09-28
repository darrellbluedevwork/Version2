import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Eye, Heart, TrendingUp, Award, Lightbulb, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const AboutPage = () => {
  const coreValues = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "We are stronger together. Every voice matters, and we strive to build an inclusive and supportive network.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Growth",
      description: "We are committed to continual learning and professional development, empowering our members to grow.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Integrity",
      description: "Transparency, honesty, and accountability are the foundations of everything we do.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We embrace forward-thinking ideas and technologies to better serve our community.",
      color: "bg-red-100 text-red-600"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Alumni" },
    { number: "15+", label: "Years of Impact" },
    { number: "50+", label: "Annual Events" },
    { number: "100%", label: "Community Driven" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'League Spartan' }}>
            About the iCAA
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            The i.c.stars |* Chicago Alumni Association is the official alumni network for i.c.stars |* graduates, 
            residents, and interns. We exist to build a thriving community of change agents dedicated to advancing 
            social and economic freedom.
          </p>
        </div>
      </section>

      {/* Organization Info */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-red-100 text-red-800">Official Alumni Network</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About the iCAA
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  The <strong>i.c.stars |* Chicago Alumni Association (iCAA)</strong> is the official alumni network 
                  for i.c.stars |* graduates, residents, and interns. With headquarters at the i.c.stars |* Chicago 
                  studio, we exist to build a thriving community of change agents dedicated to advancing social 
                  and economic freedom.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Organization Name:</strong> i.c.stars |* Chicago Alumni Association
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Abbreviation:</strong> iCAA*
                  </p>
                  <p className="text-xs text-gray-500">
                    *The 'i' in iCAA is intentionally lowercase as an abbreviation of 'i.c.stars |*'. 
                    The 'CAA' stands for Chicago Alumni Association.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Headquarters Location</h3>
                    <p className="text-gray-700">
                      i.c.stars |* Chicago Studio<br />
                      750 N Orleans<br />
                      Chicago, IL 60654
                    </p>
                  </div>
                </div>
              </div>
              
              <img 
                src="https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/8vmg9742_IMG_2965.jpeg" 
                alt="ICAA Community" 
                className="w-full h-64 object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Target className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Purpose</h2>
            </div>
            
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  The iCAA is dedicated to <strong>empowering our community</strong> by offering programs and resources 
                  that enrich, connect, and uplift. Through social events, skill-building workshops, professional 
                  development opportunities, and critical support services, we aim to foster lasting bonds that 
                  strengthen both personal and professional growth. By nurturing these connections, we create a 
                  resilient alumni network that continues to inspire, empower, and drive impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <Heart className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Mission Statement</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 leading-relaxed">
                  The iCAA is dedicated to <strong>activating our i.c.stars |* community of change agents</strong> to 
                  power social and economic freedom. We support alumni, residents, and interns with opportunities 
                  for employment, leadership, and advocacy — ensuring our community is prepared to lead change.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <Eye className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Vision Statement</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 leading-relaxed">
                  To build a <strong>thriving community of leaders</strong> who drive positive change. By empowering 
                  i.c.stars |* residents and alumni with the resources and support to excel, we cultivate a legacy 
                  of innovation that impacts our communities and beyond.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our values guide everything we do and shape the culture of our alumni community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${value.color} group-hover:scale-110 transition-transform duration-300`}>
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/33jxbg83_5.png" 
                alt="ICAA Community Impact" 
                className="w-full h-80 object-cover rounded-lg shadow-xl"
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Change Agents</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Our alumni community represents the next generation of leaders in technology, business, 
                  and social impact. Through the i.c.stars |* program and continued support from iCAA, 
                  we're creating lasting change in Chicago and beyond.
                </p>
                <p>
                  From professional development workshops to networking events, from mentorship programs 
                  to advocacy initiatives, we provide the foundation for our members to excel in their 
                  careers while driving meaningful social and economic progress.
                </p>
              </div>
              
              <div className="mt-8 space-y-4">
                <Link to="/board">
                  <Button className="bg-red-600 hover:bg-red-700 mr-4">
                    Meet Our Board <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/membership">
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Join Our Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Involved?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Whether you're an i.c.stars |* graduate, current resident, or intern, we invite you to join 
            our community of change agents making a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/membership">
              <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3">
                Become a Member
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-3">
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;