import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { ArrowLeft, Bot, MessageCircle } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const AiInterfacePage = () => {
      const navigate = useNavigate();

      const handleWhatsAppChat = () => {
        const phoneNumber = '918547735518'; // Updated WhatsApp Business number
        const message = encodeURIComponent("Hello! I'm interested in your construction services.");
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      };

      return (
        <>
          <Helmet>
            <title>AI Interface - Kerala Construction</title>
            <meta name="description" content="Interact with our AI Assistant or start a chat on WhatsApp." />
          </Helmet>

          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4">
              <div className="max-w-6xl mx-auto">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-white hover:bg-white/20 mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Interface</h1>
                <p className="text-purple-100">Your intelligent construction companions</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* AI Assistant Card */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.03 }}
                  className="glass-effect rounded-3xl p-8 cursor-pointer group"
                  onClick={() => navigate('/assistant')}
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 text-gray-800">AI Assistant Bot</h2>
                  <p className="text-gray-600 text-lg mb-4">
                    Get instant answers to your construction-related questions, find professionals, and get guidance on building codes in Kerala directly on our platform.
                  </p>
                  <p className="text-gray-500 italic mb-6">e.g., "Find Architects in Kochi"</p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Chat Now
                  </Button>
                </motion.div>

                {/* WhatsApp Bot Card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.03 }}
                  className="glass-effect rounded-3xl p-8 cursor-pointer group"
                  onClick={handleWhatsAppChat}
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 text-gray-800">WhatsApp Bot</h2>
                  <p className="text-gray-600 text-lg mb-6">
                    Prefer chatting on WhatsApp? Connect with our AI assistant on your favorite messaging app for support on the go.
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    Start WhatsApp Chat
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </>
      );
    };

    export default AiInterfacePage;