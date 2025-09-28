import React from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, ShoppingBag, ArrowRight, Star, Heart, Award } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Engage & Connect",
      description: "Connect with fellow alumni through our volunteer and event opportunities. Build lasting professional relationships.",
      image: "https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/33jxbg83_5.png"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Grow & Develop", 
      description: "Access exclusive resources, news, and updates for ICAA members. Advance your career with our professional development programs.",
      image: "https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/dbw9b0fo_6.jpeg"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Shop & Support",
      description: "Get your ICAA-branded merchandise and show your alumni pride while supporting our community initiatives.",
      image: "https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/tlr7ww7g_IMG_3339.jpeg"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Alumni" },
    { number: "50+", label: "Annual Events" },
    { number: "15+", label: "Years Strong" },
    { number: "100%", label: "Committed" }
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero" style={{
        backgroundImage: `linear-gradient(rgba(40, 40, 39, 0.8), rgba(56, 56, 56, 0.8)), url('https://images.unsplash.com/photo-1575380591643-b2c92368dc6d')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="hero-content">
          <div className="container">
            <h1 className="fade-in">Welcome to the ICAA Alumni Portal</h1>
            <p className="fade-in" style={{ animationDelay: '0.2s' }}>
              Connecting, Engaging, and Empowering Our Alumni Community
            </p>
            <div className="hero-buttons fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/membership" className="btn btn-primary">
                Join Us Today <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/news" className="btn btn-secondary">
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-gradient-red">About ICAA</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              ICAA fosters lifelong connections, supporting alumni through events, volunteering, and resources. 
              Join us to stay connected with our vibrant community and unlock opportunities for professional growth.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-16">
            <h2>Why Join ICAA?</h2>
            <p className="text-lg text-gray-700">
              Discover the benefits of being part of our alumni community
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card slide-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div 
                  className="h-48 bg-cover bg-center mb-6 rounded-lg"
                  style={{ backgroundImage: `url('${feature.image}')` }}
                ></div>
                <div className="feature-icon mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/membership" className="btn btn-primary">
              Get Started Today <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2>Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                Our mission is to facilitate networking opportunities among alumni, residents, and current interns 
                of the i.c.stars program. We aim to do this by hosting academic, professional, and social activities 
                that serve as a platform for exchanging career information and other pertinent resources.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Heart className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Community</h4>
                    <p className="text-gray-600">We are stronger together. Every voice matters in our inclusive network.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Growth</h4>
                    <p className="text-gray-600">Committed to continual learning and professional development.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Integrity</h4>
                    <p className="text-gray-600">Transparency, honesty, and accountability in everything we do.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/8vmg9742_IMG_2965.jpeg" 
                alt="ICAA Community" 
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h2 className="text-white mb-4">Ready to Join Our Community?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Take the next step in your professional journey. Connect with fellow alumni, 
            access exclusive resources, and be part of something bigger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/membership" className="btn bg-white text-red-600 hover:bg-gray-100">
              View Membership Options
            </Link>
            <Link to="/contact" className="btn btn-outline border-white text-white hover:bg-white hover:text-red-600">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;