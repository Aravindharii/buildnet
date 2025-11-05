import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductsList from '@/components/ProductsList';

const StorePage = () => {
  return (
    <>
      <Helmet>
        <title>Store - BuildNetAI</title>
        <meta name="description" content="Browse and purchase amazing products from our online store." />
      </Helmet>
      <div className="min-h-screen bg-gray-900 text-white">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden py-24"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-gray-900 to-blue-900/50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
            >
              Our Store
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 max-w-3xl mx-auto text-xl text-gray-300"
            >
              Discover exclusive products and materials for your next big project.
            </motion.p>
          </div>
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductsList />
        </div>
      </div>
    </>
  );
};

export default StorePage;