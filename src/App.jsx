// App.jsx - Simplified routing

import React, { useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/FirebaseAuthContext.jsx';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import { useDriveResourcesInit } from './hooks/useDriveResourcesInit';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext.jsx';
import { CartProvider } from './hooks/useCart.jsx';

// Lazy load pages
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
const CompleteProfilePage = lazy(() => import('@/pages/CompleteProfilePage'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-900">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
    />
  </div>
);

// Simple Protected Route - only checks authentication
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
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/assistant" element={<ChatBotPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* Protected Routes - All require authentication */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfilePage />
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

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
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
    <FirebaseAuthProvider>
      <CartProvider>
        <Router basename="/">
          <Helmet>
            <title>Buildnet AI</title>
            <meta name="description" content="Kerala's premier construction industry directory. Find contractors, suppliers, architects, engineers, and equipment providers across Kerala." />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="theme-color" content="#10b981" />
          </Helmet>
          <App />
        </Router>
      </CartProvider>
    </FirebaseAuthProvider>
  );
}

export default AppWrapper;
