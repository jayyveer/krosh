import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Youtube, Mail, Phone, MapPin, Send, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  // Function to handle navigation with scroll to top
  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');

        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSubscribeLoading(false);
      setSubscribeSuccess(true);
      setEmail('');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubscribeSuccess(false);
      }, 3000);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Shop Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-krosh-text">Shop</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleNavigation(`/shop?category=${category.slug}`)}
                    className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNavigation('/categories')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors font-medium text-left w-full"
                >
                  All Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-krosh-text">Information</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/about')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/our-story')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/faq')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/about')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-krosh-text">Policies</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/terms')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/privacy')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/shipping')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/returns')}
                  className="text-gray-600 hover:text-krosh-lavender transition-colors text-left w-full"
                >
                  Return Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-krosh-text">Connect With Us</h3>

            {/* Newsletter Subscription */}
            <div className="mb-6">
              <p className="text-gray-600 mb-2 text-sm">Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-krosh-lavender"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribeLoading}
                  className="bg-krosh-lavender text-white px-3 py-2 rounded-r-md hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center"
                >
                  {subscribeLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
              {subscribeSuccess && (
                <p className="text-green-600 text-sm mt-1">Thank you for subscribing!</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-gray-500" />
                <a
                  href="mailto:kroshenquiry@gmail.com"
                  className="text-gray-600 hover:text-krosh-lavender transition-colors"
                >
                  kroshenquiry@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-500" />
                <a
                  href="tel:+919876543210"
                  className="text-gray-600 hover:text-krosh-lavender transition-colors"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-krosh-lavender/10 flex items-center justify-center text-krosh-lavender hover:bg-krosh-lavender hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-krosh-lavender/10 flex items-center justify-center text-krosh-lavender hover:bg-krosh-lavender hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Yarn by Krosh. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleNavigation('/terms')}
              className="text-gray-500 text-sm hover:text-krosh-lavender transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => handleNavigation('/privacy')}
              className="text-gray-500 text-sm hover:text-krosh-lavender transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
