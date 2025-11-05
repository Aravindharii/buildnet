import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Bot, MessageCircle, Briefcase, BookOpen, UserCheck, HelpCircle, Home, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const ChatBotPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [inputMessage, setInputMessage] = useState(initialQuery);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Add a welcoming message from the bot on initial load
    setMessages([
      {
        id: 0,
        text: "Hello! I'm your AI construction assistant. How can I help you today? You can ask me to find suppliers, get industry knowledge, or ask for advice.",
        sender: 'bot'
      }
    ]);

    if (initialQuery) {
      handleSendMessage(initialQuery);
      setInputMessage('');
    }
  }, [initialQuery]);

  const promptExamples = [
    {
      label: "Find Suppliers",
      description: "Find RMC suppliers in Kochi with a rating above 4.5.",
      icon: Briefcase,
      query: "Find RMC suppliers in Kochi with a rating above 4.5."
    },
    {
      label: "Get Industry Knowledge",
      description: "What are the benefits of using M-Sand over river sand?",
      icon: BookOpen,
      query: "What are the benefits of using M-Sand over river sand."
    },
    {
      label: "List Professionals",
      description: "List structural engineers in Kozhikode.",
      icon: UserCheck,
      query: "List structural engineers in Kozhikode."
    },
    {
      label: "Ask for Advice",
      description: "What permits are required for a residential building construction in Kerala?",
      icon: HelpCircle,
      query: "What permits are required for a residential building construction in Kerala."
    }
  ];
  
  const handleWhatsAppChat = () => {
    const phoneNumber = '918547735518';
    const message = encodeURIComponent("Hello! I'm interested in your construction services.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const newMessage = { id: messages.length + 1, text: messageText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const botResponse = {
        id: messages.length + 2,
        text: `I'm sorry, I'm just a demo AI and cannot process complex queries yet. But I received your message: "${messageText}"! 🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀`,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (query) => {
    handleSendMessage(query);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleNewChat = () => {
    setMessages([
        {
          id: 0,
          text: "Hello! I'm your AI construction assistant. How can I help you today?",
          sender: 'bot'
        }
    ]);
    setInputMessage('');
    setIsTyping(false);
    toast({
      title: 'New Chat Started',
      description: 'Your conversation has been cleared. Start fresh! 🎉',
    });
  };

  return (
    <>
      <Helmet>
        <title>AI Assistant - Kerala Construction</title>
        <meta name="description" content="Get instant answers and insights for your construction questions with our AI Assistant." />
      </Helmet>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex flex-col w-96 p-6 border-r border-gray-200 bg-white shadow-lg overflow-y-auto"
        >
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="text-emerald-500 w-8 h-8"/>
              AI Assistant
            </h1>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Try these examples</h2>
          <div className="space-y-4">
            {promptExamples.map((example, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full text-left h-auto p-4 flex-col items-start bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  onClick={() => handlePromptClick(example.query)}
                >
                  <div className="flex items-center mb-1">
                    <example.icon className="w-5 h-5 text-emerald-600 mr-2" />
                    <h3 className="font-semibold text-gray-700">{example.label}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{example.description}</p>
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={handleWhatsAppChat}
              className="mt-8 p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-8 h-8"/>
                <div>
                  <h3 className="font-bold">Chat on WhatsApp</h3>
                  <p className="text-sm text-green-100">Prefer WhatsApp? Chat with our AI there.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 shadow-md z-10 flex items-center justify-between md:hidden">
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-white hover:bg-white/20" aria-label="Go to Home" >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </motion.div>
              <h1 className="text-xl font-bold">AI Assistant</h1>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={handleNewChat} className="text-white hover:bg-white/20" aria-label="Start New Chat">
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md lg:max-w-xl p-4 rounded-xl shadow-md ${
                    message.sender === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-md p-4 rounded-xl rounded-bl-none shadow-md bg-white text-gray-800">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex space-x-1"
                  >
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
             <div className="flex justify-around md:hidden mb-4">
              <TooltipProvider>
                {promptExamples.slice(0, 4).map((example) => (
                  <Tooltip key={example.label}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-emerald-600"
                        onClick={() => handlePromptClick(example.query)}
                      >
                        <example.icon className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{example.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about construction..."
                className="flex-1 h-12 rounded-full px-5 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                 <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNewChat}
                    className="h-9 w-9 rounded-full text-gray-500 hover:text-emerald-600 hidden md:inline-flex"
                    type="button"
                  >
                    <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatBotPage;