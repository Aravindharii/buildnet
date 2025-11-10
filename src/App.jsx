
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import RFQPage from '@/pages/RFQPage';
import ChatBotPage from '@/pages/ChatBotPage';
import AdminPage from '@/pages/AdminPage';
import ProductsPage from '@/pages/ProductsPage';
import AccountPage from '@/pages/AccountPage';
import DashboardPage from '@/pages/DashboardPage';
import StorePage from '@/pages/StorePage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import SuccessPage from '@/pages/SuccessPage';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import { Instagram as Whatsapp } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/account" replace />;
  }

  return children;
};


function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const phoneNumber = '918547735518';
    const message = encodeURIComponent("Hello! I'm interested in your construction services.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header onCartClick={() => setIsCartOpen(true)} />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/assistant" element={<ChatBotPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/success" element={<SuccessPage />} />
            
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/rfq" element={<ProtectedRoute><RFQPage /></ProtectedRoute>} />

          </Routes>
        </main>
        <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />

        {/* Floating WhatsApp Bot Icon */}
        {/* <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          onClick={handleWhatsAppClick}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center cursor-pointer"
          aria-label="WhatsApp Bot"
        >
          <Whatsapp className="w-7 h-7" />
        </motion.button> */}
      </div>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Helmet>
        <title>Buildnet AI</title>
        <meta name="description" content="Kerala's premier construction industry directory. Find contractors, suppliers, architects, engineers, and equipment providers across Kerala." />
      </Helmet>
      <App />
    </Router>
  );
}

export default AppWrapper;
