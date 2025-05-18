import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, TrendingUp, Award } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import SectionHeader from '../components/ui/SectionHeader';

const OurStory: React.FC = () => {
  return (
    <AnimatedContainer>
      <div className="py-6">
        <SectionHeader title="Our Story" showBackButton={true} />
        
        {/* Hero Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-64 bg-krosh-lavender/20 relative">
            <img
              src="https://images.pexels.com/photos/6684372/pexels-photo-6684372.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Yarn and crochet hooks"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold">The Yarn by Krosh Journey</h1>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">How It All Began</h2>
            <p className="text-gray-600 mb-4">
              Yarn by Krosh started with a simple passion for crocheting. Our founder, Aanya, discovered 
              the joy of creating handmade items during her college years. What began as a hobby quickly 
              turned into a deep love for the craft and a desire to share it with others.
            </p>
            <p className="text-gray-600">
              After struggling to find high-quality, affordable yarn and supplies locally, Aanya realized 
              there was an opportunity to create a space where crafters could find everything they needed 
              for their projects, along with guidance and inspiration. In 2020, Yarn by Krosh was born.
            </p>
          </div>
        </motion.div>
        
        {/* Timeline Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Our Journey</h2>
          
          <div className="space-y-8">
            {/* Timeline Item 1 */}
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-10 h-10 bg-krosh-lavender rounded-full flex items-center justify-center text-white">
                  <Calendar size={20} />
                </div>
                <div className="h-full w-0.5 bg-krosh-lavender/30 mt-2"></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 flex-1">
                <div className="text-sm text-krosh-lavender font-medium mb-2">2020</div>
                <h3 className="text-lg font-semibold mb-2">The Beginning</h3>
                <p className="text-gray-600">
                  Yarn by Krosh started as an Instagram page sharing crocheting tips and showcasing 
                  handmade projects. The positive response from the community encouraged us to take 
                  the next step.
                </p>
              </div>
            </div>
            
            {/* Timeline Item 2 */}
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-10 h-10 bg-krosh-lavender rounded-full flex items-center justify-center text-white">
                  <Star size={20} />
                </div>
                <div className="h-full w-0.5 bg-krosh-lavender/30 mt-2"></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 flex-1">
                <div className="text-sm text-krosh-lavender font-medium mb-2">2021</div>
                <h3 className="text-lg font-semibold mb-2">First Collection</h3>
                <p className="text-gray-600">
                  We launched our first collection of carefully curated yarns and essential tools. 
                  Our focus was on quality, sustainability, and beginner-friendly options that would 
                  make crocheting accessible to everyone.
                </p>
              </div>
            </div>
            
            {/* Timeline Item 3 */}
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-10 h-10 bg-krosh-lavender rounded-full flex items-center justify-center text-white">
                  <TrendingUp size={20} />
                </div>
                <div className="h-full w-0.5 bg-krosh-lavender/30 mt-2"></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 flex-1">
                <div className="text-sm text-krosh-lavender font-medium mb-2">2022</div>
                <h3 className="text-lg font-semibold mb-2">Growing Community</h3>
                <p className="text-gray-600">
                  As our community grew, we expanded our product range and started offering workshops 
                  and tutorials. We were thrilled to see so many people discovering the joy of crocheting 
                  through Yarn by Krosh.
                </p>
              </div>
            </div>
            
            {/* Timeline Item 4 */}
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-10 h-10 bg-krosh-lavender rounded-full flex items-center justify-center text-white">
                  <Award size={20} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 flex-1">
                <div className="text-sm text-krosh-lavender font-medium mb-2">2023</div>
                <h3 className="text-lg font-semibold mb-2">Where We Are Today</h3>
                <p className="text-gray-600">
                  Today, Yarn by Krosh is more than just a shop—it's a community of passionate crafters. 
                  We continue to grow, learn, and evolve, always staying true to our mission of making 
                  crocheting accessible, enjoyable, and sustainable.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Vision Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Our Vision for the Future</h2>
          
          <p className="text-gray-600 mb-6">
            As we look to the future, we're excited to continue growing the Yarn by Krosh community 
            and expanding our offerings. Our vision includes:
          </p>
          
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-start">
              <div className="w-6 h-6 bg-krosh-lavender/20 rounded-full flex items-center justify-center text-krosh-lavender mr-3 mt-0.5">
                <span className="text-sm">1</span>
              </div>
              <span>
                <strong>Expanding our sustainable yarn collection</strong> with more eco-friendly options
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-krosh-lavender/20 rounded-full flex items-center justify-center text-krosh-lavender mr-3 mt-0.5">
                <span className="text-sm">2</span>
              </div>
              <span>
                <strong>Creating a comprehensive learning platform</strong> with tutorials for all skill levels
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-krosh-lavender/20 rounded-full flex items-center justify-center text-krosh-lavender mr-3 mt-0.5">
                <span className="text-sm">3</span>
              </div>
              <span>
                <strong>Collaborating with artisans and designers</strong> to bring unique, exclusive products to our community
              </span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-krosh-lavender/20 rounded-full flex items-center justify-center text-krosh-lavender mr-3 mt-0.5">
                <span className="text-sm">4</span>
              </div>
              <span>
                <strong>Hosting in-person workshops and events</strong> to bring our community together
              </span>
            </li>
          </ul>
          
          <div className="mt-8 text-center">
            <p className="text-lg font-medium text-krosh-text">
              Thank you for being part of our story. We can't wait to see what we'll create together!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedContainer>
  );
};

export default OurStory;
