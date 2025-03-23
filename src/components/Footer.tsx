
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-10 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold text-parkongo-700">
                Park<span className="text-parkongo-500">ongo</span>
              </span>
            </Link>
            <p className="text-gray-600 max-w-xs">
              The simplest way to find and book monthly parking spaces in your city.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-parkongo-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-parkongo-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-parkongo-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-parkongo-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/search" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  Find Parking
                </Link>
              </li>
              <li>
                <Link to="/for-hosts" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  List Your Space
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-parkongo-600 mt-0.5" />
                <span className="text-gray-600">
                  123 Parking Avenue, Bangalore, 560001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-parkongo-600" />
                <a href="mailto:contact@parkongo.com" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  contact@parkongo.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-parkongo-600" />
                <a href="tel:+919876543210" className="text-gray-600 hover:text-parkongo-600 transition-colors">
                  +91 9876 543 210
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Parkongo. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/terms" className="text-gray-500 hover:text-parkongo-600 transition-colors text-sm">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-parkongo-600 transition-colors text-sm">
              Privacy
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-parkongo-600 transition-colors text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
