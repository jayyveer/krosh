import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Package, CreditCard, ShoppingBag, HelpCircle, User } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import SectionHeader from '../components/ui/SectionHeader';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    // Product Information
    {
      question: 'What types of yarn do you offer?',
      answer: 'We offer a wide variety of yarns including cotton, acrylic, wool, and blends. Our collection includes options for all skill levels and project types, from lightweight yarns for delicate items to bulky yarns for quick projects.',
      category: 'product'
    },
    {
      question: 'Are your yarns suitable for beginners?',
      answer: 'Yes! We have many yarns that are perfect for beginners. We recommend starting with medium-weight acrylic or cotton yarns, which are easy to work with and forgiving for new crafters. Check out our "Beginner\'s Kit" section for curated options.',
      category: 'product'
    },
    {
      question: 'Do you sell crochet hooks and other accessories?',
      answer: 'Yes, we offer a range of crochet hooks in various sizes, as well as accessories like stitch markers, row counters, yarn needles, and project bags. Everything you need for your crocheting projects!',
      category: 'product'
    },
    
    // Ordering & Payment
    {
      question: 'How do I place an order?',
      answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. You\'ll need to create an account or log in, provide shipping information, and select your payment method.',
      category: 'ordering'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'Currently, we accept payments through WhatsApp after order placement. We\'re working on adding more payment options in the future.',
      category: 'ordering'
    },
    {
      question: 'Can I modify or cancel my order after it\'s placed?',
      answer: 'You can request modifications or cancellations by contacting us at kroshenquiry@gmail.com within 24 hours of placing your order. After that, we may have already processed your order for shipping.',
      category: 'ordering'
    },
    
    // Shipping & Delivery
    {
      question: 'How long will it take to receive my order?',
      answer: 'Domestic orders typically take 3-7 business days to arrive, depending on your location. We process orders within 1-2 business days, and then shipping time varies based on the delivery address.',
      category: 'shipping'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within India. We\'re working on expanding our shipping options to include international destinations in the future.',
      category: 'shipping'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also view your order status and tracking information in your account under "My Orders".',
      category: 'shipping'
    },
    
    // Returns & Exchanges
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery for unused items in their original packaging. Please contact us at kroshenquiry@gmail.com to initiate a return.',
      category: 'returns'
    },
    {
      question: 'How do I exchange an item?',
      answer: 'To exchange an item, please contact us at kroshenquiry@gmail.com with your order number and the item you\'d like to exchange. We\'ll guide you through the process.',
      category: 'returns'
    },
    {
      question: 'Do you refund shipping costs for returns?',
      answer: 'Shipping costs are non-refundable unless the return is due to our error (damaged item, wrong item sent, etc.).',
      category: 'returns'
    },
    
    // Account Management
    {
      question: 'How do I create an account?',
      answer: 'You can create an account by clicking on the "Sign Up" button in the top right corner of our website. You\'ll need to provide your email address and create a password.',
      category: 'account'
    },
    {
      question: 'How can I reset my password?',
      answer: 'You can reset your password by clicking on "Login" and then "Forgot Password". Follow the instructions sent to your email to create a new password.',
      category: 'account'
    },
    {
      question: 'Can I update my shipping address?',
      answer: 'Yes, you can update your shipping address in your account settings under the "Addresses" section. You can also add multiple addresses and set a default address for faster checkout.',
      category: 'account'
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActiveCategory(null); // Reset category filter when searching
  };

  const handleCategoryFilter = (category: string | null) => {
    setActiveCategory(category);
    setSearchQuery(''); // Reset search when filtering by category
  };

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === null || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'product', name: 'Product Information', icon: <ShoppingBag size={16} /> },
    { id: 'ordering', name: 'Ordering & Payment', icon: <CreditCard size={16} /> },
    { id: 'shipping', name: 'Shipping & Delivery', icon: <Package size={16} /> },
    { id: 'returns', name: 'Returns & Exchanges', icon: <HelpCircle size={16} /> },
    { id: 'account', name: 'Account Management', icon: <User size={16} /> }
  ];

  return (
    <AnimatedContainer>
      <div className="py-6">
        <SectionHeader title="Frequently Asked Questions" showBackButton={true} />
        
        {/* Search and Filter Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === null
                  ? 'bg-krosh-lavender text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                  activeCategory === category.id
                    ? 'bg-krosh-lavender text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* FAQ Items */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="font-medium">{faq.question}</span>
                  {activeIndex === index ? (
                    <ChevronUp size={18} className="text-krosh-lavender" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>
                
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No FAQs Found</h3>
              <p className="text-gray-500">
                We couldn't find any FAQs matching your search. Please try different keywords or browse by category.
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Contact Section */}
        <motion.div
          className="mt-10 bg-krosh-lavender/10 rounded-lg p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">
            If you couldn't find the answer you were looking for, please feel free to contact us.
          </p>
          <a
            href="mailto:kroshenquiry@gmail.com"
            className="inline-flex items-center bg-krosh-lavender text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </AnimatedContainer>
  );
};

export default FAQ;
