import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Award, Clock } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import SectionHeader from '../components/ui/SectionHeader';

const About: React.FC = () => {
  return (
    <AnimatedContainer>
      <div className="py-6">
        <SectionHeader title="About Us" showBackButton={true} />
        
        {/* Hero Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-64 bg-krosh-lavender/20 relative">
            <img
              src="https://images.pexels.com/photos/6850602/pexels-photo-6850602.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Yarn by Krosh Team"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              At Yarn by Krosh, we're passionate about bringing the joy of crocheting to everyone. 
              Our mission is to provide high-quality yarns and supplies that inspire creativity and 
              make crocheting accessible to crafters of all skill levels.
            </p>
            <p className="text-gray-600">
              We believe that crocheting is not just a craft, but a form of self-expression and a 
              way to create meaningful, handmade items that bring warmth and comfort to our lives 
              and the lives of those around us.
            </p>
          </div>
        </motion.div>
        
        {/* Values Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-krosh-lavender/20 rounded-full flex items-center justify-center mb-4">
                <Heart size={24} className="text-krosh-lavender" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality</h3>
              <p className="text-gray-600">
                We carefully select every product in our collection to ensure the highest quality 
                materials that will make your crocheting experience enjoyable and your finished 
                projects beautiful and long-lasting.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-krosh-lavender/20 rounded-full flex items-center justify-center mb-4">
                <Users size={24} className="text-krosh-lavender" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                We believe in the power of the crocheting community. We strive to create a 
                welcoming space where crafters can connect, share ideas, and inspire each other.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-krosh-lavender/20 rounded-full flex items-center justify-center mb-4">
                <Award size={24} className="text-krosh-lavender" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sustainability</h3>
              <p className="text-gray-600">
                We are committed to sustainable practices and environmentally friendly products. 
                We prioritize yarns from responsible sources and minimize waste in our operations.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-krosh-lavender/20 rounded-full flex items-center justify-center mb-4">
                <Clock size={24} className="text-krosh-lavender" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Education</h3>
              <p className="text-gray-600">
                We're dedicated to helping crafters of all levels improve their skills. Through 
                tutorials, patterns, and resources, we support your crocheting journey every step 
                of the way.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Team Section - Placeholder */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Our Team</h2>
          
          <p className="text-gray-600 mb-6">
            Yarn by Krosh is made possible by a passionate team of crafting enthusiasts who are 
            dedicated to sharing the joy of crocheting with the world.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Team Member Placeholders */}
            {[
              { name: 'Aanya Sharma', role: 'Founder & Creative Director' },
              { name: 'Vikram Patel', role: 'Operations Manager' },
              { name: 'Priya Desai', role: 'Product Specialist' }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-krosh-lavender/20 rounded-full mx-auto mb-4 overflow-hidden">
                  {/* Placeholder for team member photos */}
                  <div className="w-full h-full flex items-center justify-center text-krosh-lavender">
                    <Users size={40} />
                  </div>
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Contact Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          
          <p className="text-gray-600 mb-6">
            We'd love to hear from you! Whether you have questions about our products, need help 
            with an order, or just want to share your latest project, we're here for you.
          </p>
          
          <div className="bg-krosh-lavender/10 p-6 rounded-lg">
            <p className="mb-4">
              <strong>Email:</strong>{' '}
              <a href="mailto:kroshenquiry@gmail.com" className="text-krosh-lavender hover:underline">
                kroshenquiry@gmail.com
              </a>
            </p>
            <p>
              <strong>Follow us:</strong>{' '}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-krosh-lavender hover:underline">
                Instagram
              </a>
              {' | '}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-krosh-lavender hover:underline">
                YouTube
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedContainer>
  );
};

export default About;
