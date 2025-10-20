import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  UserGroupIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  RocketLaunchIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const AboutUsPage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdyb2Nlcnl8ZW58MHx8MHx8fDA%3D')] bg-cover bg-center"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Our Story
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              From a single store to a nationwide presence, discover how E-Shop is transforming
              the shopping experience for millions of customers across the country.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Mission & Values */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <RocketLaunchIcon className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                At E-Shop, we research, identify and make available new products and categories that suit the everyday needs 
                of the Indian family. Our mission is to provide the best value possible for our customers, so that every 
                rupee they spend on shopping with us gives them more value for money than they would get anywhere else.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <HeartIcon className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Our Values</h3>
              <p className="text-gray-700 leading-relaxed">
                We believe in Action, Care, and Truth (ACT). These core values guide everything we do - from how we interact 
                with our customers to the quality of products we select. We're committed to excellence, integrity, and creating 
                a shopping experience that's both reliable and enjoyable for every customer who walks through our doors or visits us online.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-24">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">The E-Shop Journey</h2>
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-32 flex-shrink-0">
                  <div className="h-16 w-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2008
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Our Beginning</h3>
                  <p className="text-gray-700 leading-relaxed">
                    E-Shop was founded with a simple vision: to offer high-quality products at competitive prices that Indian families could trust. 
                    We opened our first store in Mumbai with a commitment to understanding and meeting the everyday needs of our customers.
                  </p>
                </div>
              </div>
              
              <div className="w-px h-10 bg-gray-300 ml-8 sm:ml-16 hidden sm:block"></div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-32 flex-shrink-0">
                  <div className="h-16 w-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2014
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nationwide Expansion</h3>
                  <p className="text-gray-700 leading-relaxed">
                    After establishing a strong presence in Maharashtra, we began our expansion across India. By focusing on the needs of local communities, 
                    we were able to tailor our offerings while maintaining our core values of quality and affordability.
                  </p>
                </div>
              </div>
              
              <div className="w-px h-10 bg-gray-300 ml-8 sm:ml-16 hidden sm:block"></div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-32 flex-shrink-0">
                  <div className="h-16 w-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2020
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Digital Transformation</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Recognizing the changing shopping habits of our customers, we launched our e-commerce platform, bringing the E-Shop experience online. 
                    This allowed us to reach more customers and provide even more convenience while maintaining our commitment to value.
                  </p>
                </div>
              </div>
              
              <div className="w-px h-10 bg-gray-300 ml-8 sm:ml-16 hidden sm:block"></div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-32 flex-shrink-0">
                  <div className="h-16 w-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2023
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Today & Beyond</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Today, E-Shop continues to grow with over 500 stores nationwide. We've embraced sustainability initiatives, expanded our product range, 
                    and enhanced our digital experience. Our focus remains on innovation that benefits our customers, employees, and communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What Sets Us Apart */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Same-day and next-day delivery options across most locations
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Quality Assurance</h3>
              <p className="text-gray-600 text-sm">
                Rigorous quality controls for all products across our stores
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Customer Focus</h3>
              <p className="text-gray-600 text-sm">
                Dedicated support teams to assist with all your shopping needs
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Sustainability</h3>
              <p className="text-gray-600 text-sm">
                Committed to eco-friendly practices across our operations
              </p>
            </div>
          </div>
        </div>

        {/* Our Presence */}
        <div className="max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Our Presence</h2>
            <p className="text-gray-700 mb-8">
              From humble beginnings, E-Shop has grown to serve customers across India. With over 500 stores spanning 11 states, 
              we're proud to be part of communities nationwide. Our growth continues as we open new stores while enhancing our 
              online shopping experience.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">Maharashtra</p>
                <p className="text-sm text-gray-600">127 Stores</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">Gujarat</p>
                <p className="text-sm text-gray-600">83 Stores</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">Karnataka</p>
                <p className="text-sm text-gray-600">67 Stores</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">Telangana</p>
                <p className="text-sm text-gray-600">54 Stores</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">Andhra Pradesh</p>
                <p className="text-sm text-gray-600">42 Stores</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">Madhya Pradesh</p>
                <p className="text-sm text-gray-600">21 Stores</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">NCR</p>
                <p className="text-sm text-gray-600">52 Stores</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="font-semibold text-gray-900">Tamil Nadu</p>
                <p className="text-sm text-gray-600">39 Stores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Leadership</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-4"></div>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Meet the team driving E-Shop's vision of making quality products accessible to everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200">
                {/* Placeholder for leader image */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-200">
                  <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900">Rajesh Kumar</h3>
                <p className="text-green-600 text-sm mb-3">Chief Executive Officer</p>
                <p className="text-gray-600 text-sm">
                  Leading E-Shop with over 20 years of retail experience and a passion for customer-focused innovation.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200">
                {/* Placeholder for leader image */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-200">
                  <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900">Priya Sharma</h3>
                <p className="text-green-600 text-sm mb-3">Chief Operations Officer</p>
                <p className="text-gray-600 text-sm">
                  Overseeing our nationwide operations with expertise in supply chain management and operational excellence.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200">
                {/* Placeholder for leader image */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-200">
                  <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900">Vikram Mehta</h3>
                <p className="text-green-600 text-sm mb-3">Chief Technology Officer</p>
                <p className="text-gray-600 text-sm">
                  Driving E-Shop's digital transformation and creating seamless omnichannel shopping experiences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 sm:p-10 shadow-xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Join the E-Shop Family</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're shopping with us, joining our team, or partnering with our business,
              we welcome you to be part of our journey to make quality products accessible to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/category/all" className="bg-white hover:bg-gray-100 text-green-700 font-medium px-6 py-3 rounded-lg shadow transition-colors">
                Start Shopping
              </Link>
              <a href="#" className="border border-white/60 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Careers
              </a>
              <a href="#" className="border border-white/60 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;