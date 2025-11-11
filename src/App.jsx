import React, { useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import { useDriveResourcesInit } from './hooks/useDriveResourcesInit';


// Lazy load all pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const RFQPage = lazy(() => import('@/pages/RFQPage'));
const ChatBotPage = lazy(() => import('@/pages/ChatBotPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const StorePage = lazy(() => import('@/pages/StorePage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const SuccessPage = lazy(() => import('@/pages/SuccessPage'));

// Loading component with animation
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-900">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
    />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/account" state={{ from: location.pathname }} replace />;
  }

  return children;
};

function App() {
    useDriveResourcesInit();

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="pt-20">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/assistant" element={<ChatBotPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/success" element={<SuccessPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rfq" 
              element={
                <ProtectedRoute>
                  <RFQPage />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all route - 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      
      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Helmet>
        <title>Buildnet AI</title>
        <meta name="description" content="Kerala's premier construction industry directory. Find contractors, suppliers, architects, engineers, and equipment providers across Kerala." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#10b981" />
      </Helmet>
      <App />
    </Router>
  );
}

export default AppWrapper;
