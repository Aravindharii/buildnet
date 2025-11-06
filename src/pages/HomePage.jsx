import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, Search, FileText, Bot, Building, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WelcomeMessage from '@/components/WelcomeMessage';
import CallToAction from '@/components/CallToAction';
import { useAuth } from '@/contexts/SupabaseAuthContext';
const HomePage = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const handleNavigation = path => {
    navigate(path);
  };
  const featureCards = [{
    icon: <Search className="w-8 h-8 text-white" />,
    title: 'Search Directory',
    description: 'Find trusted professionals, suppliers, and contractors across Kerala.',
    path: '/search',
    color: 'from-blue-500 to-indigo-600'
  }, {
    icon: <FileText className="w-8 h-8 text-white" />,
    title: 'Request for Quotation',
    description: 'Easily submit RFQs to multiple suppliers and get competitive bids.',
    path: '/rfq',
    color: 'from-purple-500 to-pink-600'
  }, {
    icon: <Building className="w-8 h-8 text-white" />,
    title: 'Product Marketplace',
    description: 'Browse a wide range of construction products from top manufacturers.',
    path: '/products',
    color: 'from-orange-500 to-red-600'
  }, {
    icon: <Bot className="w-8 h-8 text-white" />,
    title: 'AI Assistant',
    description: 'Get instant answers and support with our intelligent AI-powered chatbot.',
    path: '/assistant',
    color: 'from-green-500 to-emerald-600'
  }];
  return <>
      <Helmet>
        <title>BuildNet - Kerala's Premier Construction Network</title>
        <meta name="description" content="Connect with construction professionals in Kerala. Find suppliers, contractors, and services for your projects. Powered by BuildNet." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                {/* <img alt="BuildNet logo" class="h-10 w-auto" src="https://horizons-cdn.hostinger.com/5d6d429a-e3e0-4553-9214-38ce43e19849/buildnet-6yHuu.jpg" /> */}
                <span className="text-2xl font-bold text-emerald-600">BuildNetAI</span>
              </div>
              <div className="flex items-center space-x-2">
                {user ? <Button onClick={() => navigate('/account')} variant="outline" className="rounded-full">
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </Button> : <>
                    <Button onClick={() => navigate('/account')} variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
                    <Button onClick={() => navigate('/account?signup=true')} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
                      Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>}
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="relative pt-16 pb-20 text-center">
             <div className="absolute inset-0">
                <img class="w-full h-full object-cover" alt="Kerala construction site background"  />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h1 initial={{
              opacity: 0,
              y: -20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.7
            }} className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                    The Future of Construction <span className="text-emerald-400">Starts Here.</span>
                </motion.h1>
                <motion.p initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.7,
              delay: 0.2
            }} className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-200">
                    BuildNet is Kerala's digital hub for the construction industry, connecting you with the best professionals, suppliers, and resources.
                </motion.p>
                <motion.div initial={{
              opacity: 0,
              scale: 0.8
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.7,
              delay: 0.4
            }} className="mt-10">
                    <Button size="lg" className="rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:scale-105 transition-transform duration-300 text-white shadow-lg" onClick={() => navigate('/assistant')}>
                        Talk to AI Assistant <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>
            </div>
          </div>
          
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your All-in-One Construction Market Place</h2>
                <p className="mt-4 text-lg text-gray-600">Everything you need, right at your fingertips.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featureCards.map((card, index) => <motion.div key={card.title} initial={{
                opacity: 0,
                y: 50
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: index * 0.1
              }} onClick={() => handleNavigation(card.path)} className="cursor-pointer group">
                    <div className={`relative p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 text-white overflow-hidden bg-gradient-to-br ${card.color}`}>
                      <div className="absolute -bottom-4 -right-4 text-white/10">
                        {React.cloneElement(card.icon, {
                      className: "w-24 h-24"
                    })}
                      </div>
                      <div className="relative">
                        {card.icon}
                        <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
                        <p className="mt-2 text-white/80">{card.description}</p>
                        <div className="mt-6 font-semibold flex items-center group-hover:underline">
                          Explore <ChevronRight className="ml-1 h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>)}
              </div>
            </div>
          </section>

          <CallToAction />
        </main>
        
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} BuildNet. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-1">Connecting Kerala's Construction Industry.</p>
          </div>
        </footer>
      </div>
    </>;
};
export default HomePage;