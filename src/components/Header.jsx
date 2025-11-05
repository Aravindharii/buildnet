import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, LayoutGrid } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
const Header = ({
  onCartClick
}) => {
  const {
    cartItems
  } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const navLinkClasses = "transition-colors text-gray-300 hover:text-white relative";
  const activeNavLinkClasses = "text-white";
  return <motion.header initial={{
    y: -100
  }} animate={{
    y: 0
  }} transition={{
    type: 'spring',
    stiffness: 120,
    damping: 20
  }} className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img className="h-10 w-auto" src="https://horizons-cdn.hostinger.com/5d6d429a-e3e0-4553-9214-38ce43e19849/buildnet-6yHuu.jpg" alt="BuildNet logo" />
              <span className="text-2xl font-bold text-white">BuildNet AI</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={({
            isActive
          }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Home</NavLink>
            <NavLink to="/search" className={({
            isActive
          }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Directory</NavLink>
            <NavLink to="/products" className={({
            isActive
          }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Marketplace</NavLink>
            <NavLink to="/store" className={({
            isActive
          }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Store</NavLink>
            <NavLink to="/assistant" className={({
            isActive
          }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>AI Assistant</NavLink>
          </nav>

          <div className="flex-1 flex items-center justify-end">
            <button onClick={onCartClick} className="relative text-gray-300 hover:text-white transition-colors">
              <ShoppingCart size={24} />
              {totalItems > 0 && <motion.span initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </motion.span>}
            </button>
            <Link to="/admin" className="ml-6 text-gray-300 hover:text-white transition-colors">
              <LayoutGrid size={24} />
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-black/30 backdrop-blur-lg border-b border-white/10" />
    </motion.header>;
};
export default Header;