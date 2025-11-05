import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

const SuccessPage = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <>
      <Helmet>
        <title>Payment Successful! - BuildNetAI Store</title>
        <meta name="description" content="Your order has been successfully placed." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }}
          className="w-full max-w-lg text-center bg-white/5 backdrop-blur-xl p-8 sm:p-12 rounded-2xl shadow-2xl border border-white/10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', delay: 0.5, duration: 1.5 }}
          >
            <CheckCircle className="mx-auto h-20 w-20 text-green-400" />
          </motion.div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-white">Payment Successful!</h1>
          <p className="mt-4 text-lg text-gray-300">
            Thank you for your order. We've received your payment and your items will be on their way shortly.
          </p>
          <p className="mt-2 text-gray-400">A confirmation email has been sent to you.</p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              <Link to="/store">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default SuccessPage;