
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from '@/App';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { CartProvider } from '@/hooks/useCart';
import { Toaster } from '@/components/ui/toaster';
import '@/index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <AuthProvider>
      <CartProvider>
        <AppWrapper />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  </>
);
