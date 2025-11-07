import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, ArrowLeft, RefreshCcw, X, MapPin, Phone, Globe, Mail, Star, User, Search, Building, Navigation, ChevronRight, Home, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { fetchBusinessesWithCache } from '../lib/GoogleSheetService';

// Enhanced categories with direct mapping
const categories = [
  {
    label: 'Steel Sector',
    icon: '⚙️',
    color: 'from-gray-500 to-slate-600',
    description: 'TMT steel dealers, structural steel, steel distributors.',
    keywords: ['tmt', 'steel', 'iron', 'metal', 'bar', 'rod', 'structural']
  },
  {
    label: 'Cement Sector',
    icon: '🏗️',
    color: 'from-blue-500 to-cyan-500',
    description: 'Cement dealers, bulk cement suppliers, cement manufacturers.',
    keywords: ['cement', 'concrete', 'building material']
  },
  {
    label: 'Ready-Mix Concrete',
    icon: '🚛',
    color: 'from-amber-500 to-orange-500',
    description: 'RMC suppliers, concrete batching plants.',
    keywords: ['rmc', 'ready mix', 'concrete', 'readymix', 'batching']
  },
  {
    label: 'Construction Equipment',
    icon: '🚜',
    color: 'from-orange-500 to-red-500',
    description: 'Equipment rental, JCB, excavators, cranes.',
    keywords: ['equipment', 'machinery', 'tools', 'machine', 'rental', 'jcb', 'crane']
  },
  {
    label: 'Architects & Consultants',
    icon: '📊',
    color: 'from-green-500 to-emerald-500',
    description: 'Architects, structural engineers, design consultants.',
    keywords: ['architect', 'consultant', 'design', 'designer', 'architecture', 'engineer']
  },
  {
    label: 'Construction Services',
    icon: '👷',
    color: 'from-purple-500 to-pink-500',
    description: 'Construction companies, contractors, builders.',
    keywords: ['construction', 'contractor', 'builder', 'building', 'service']
  },
  {
    label: 'Rentals & Services',
    icon: '🔄',
    color: 'from-indigo-500 to-blue-500',
    description: 'Vehicle rentals, equipment rentals, service providers.',
    keywords: ['rental', 'rent', 'hire', 'leasing', 'agency']
  }
];

const districts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod', 'All Districts'
];

// AI Response templates
const aiResponses = {
  greeting: [
    "Hello! 👋 I'm your Construction Assistant AI. I can help you find construction materials, suppliers, and professionals across Kerala.",
    "Hi there! 🏗️ I'm here to help you with all your construction needs. Let me know what you're looking for!",
    "Welcome! 🌟 I'm your AI construction assistant. Tell me what you need and I'll find the best options."
  ],
  categorySelected: "Great choice! You've selected {category}. Now, which district would you like to search in?",
  districtSelected: "Perfect! I'm searching for {category} suppliers in {district}. Finding the best options for you...",
  noResults: "I couldn't find any {category} suppliers in {district}. Try selecting a different district or category.",
  searchResults: "🎉 Found {count} {category} suppliers in {district}. Here are the best matches:",
  help: "I can help you find:\n• Steel & TMT suppliers\n• Cement dealers\n• Ready-mix concrete\n• Construction equipment\n• Architects & consultants\n• Construction services\n• Rental services",
  default: "I understand you're looking for construction resources. Let me help you find exactly what you need!"
};

const getCategoryColor = (category) => {
  if (!category) return 'from-emerald-500 to-green-500';
  const cat = category.toLowerCase();
  
  if (cat.includes('tmt') || cat.includes('steel') || cat.includes('iron')) 
    return 'from-gray-500 to-slate-600';
  if (cat.includes('cement')) 
    return 'from-blue-500 to-cyan-500';
  if (cat.includes('ready mix') || cat.includes('concrete') || cat.includes('rmc')) 
    return 'from-amber-500 to-orange-500';
  if (cat.includes('equipment') || cat.includes('machinery') || cat.includes('rental')) 
    return 'from-orange-500 to-red-500';
  if (cat.includes('architect') || cat.includes('consultant') || cat.includes('design')) 
    return 'from-green-500 to-emerald-500';
  if (cat.includes('construction') || cat.includes('contractor') || cat.includes('builder')) 
    return 'from-purple-500 to-pink-500';
  if (cat.includes('rental') || cat.includes('rent')) 
    return 'from-indigo-500 to-blue-500';
  
  return 'from-emerald-500 to-green-500';
};

const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  return phone;
};

const ChatBotPageAdvanced = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 0, 
      text: aiResponses.greeting[0], 
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [currentStep, setCurrentStep] = useState('category'); // category -> district -> results
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, filteredResults]);

  // Load businesses
useEffect(() => {
  setLoading(true);
  fetchBusinessesWithCache()
    .then((data) => {
      // Map each business ensuring fallback for missing keys, type normalization
      const mapped = data.map((b, index) => {
        return {
          id: b.id || b.uniqueid || `business-${index}-${Date.now()}`,
          name: b.name || b.Name || "Unknown Business",
          category: b.category || b.Category || "General",
          subcategory: b.subcategory || b["Sub Category"] || "",
          district: b.district || b.District || "Unknown District",
          phone: b.phone || b.phonenumber || b.phone_number || "",
          address: b.address || b.Address || b.location || "",
          website: b.website || b.Website || "",
          email: b.email || b["Email Id"] || "",
          gst_number: b.gst_number || "",
          map_location: b.map_location || b.map_link || b.place_url || "",
          rating: parseFloat(b.rating || b.review || 0),
          rating_count: parseInt(b.rating_count || b.reviews_count || 0),
          image_source: b.image_source || "",
          tags: b.TAGS || "",
          products: b.PRODUCTS || "",
          ...b, // Preserve any other fields as-is
        };
      });
      setBusinesses(mapped);
    })
    .catch((error) => {
      console.error("Error loading business data:", error);
      toast({
        title: "Error",
        description: "Failed to load business data.",
        variant: "destructive",
      });
    })
    .finally(() => setLoading(false));
}, []);


  // Enhanced filter function with direct category mapping
  const filterBusinesses = (category, district) => {
    if (!category) return [];
    
    let filtered = businesses;

    // Filter by category keywords
    if (category && category.toLowerCase() !== 'all') {
      const selectedCat = categories.find(cat => cat.label === category);
      if (selectedCat) {
        filtered = filtered.filter(b => {
          const businessText = `
            ${b.category || ''} 
            ${b.subcategory || ''} 
            ${b.name || ''} 
            ${b.tags || ''} 
            ${b.products || ''}
          `.toLowerCase();
          
          return selectedCat.keywords.some(keyword => 
            businessText.includes(keyword.toLowerCase())
          );
        });
      }
    }

    // Filter by district
    if (district && district.toLowerCase() !== 'all districts') {
      filtered = filtered.filter(b => 
        b.district && b.district.toLowerCase().includes(district.toLowerCase())
      );
    }

    return filtered;
  };

  // AI Response handler
  const generateAIResponse = (context = {}) => {
    if (context.categorySelected) {
      return aiResponses.categorySelected.replace('{category}', context.category);
    }
    if (context.districtSelected) {
      return aiResponses.districtSelected
        .replace('{category}', context.category)
        .replace('{district}', context.district);
    }
    if (context.searchResults) {
      return aiResponses.searchResults
        .replace('{count}', context.count)
        .replace('{category}', context.category)
        .replace('{district}', context.district);
    }
    if (context.noResults) {
      return aiResponses.noResults
        .replace('{category}', context.category)
        .replace('{district}', context.district);
    }
    return aiResponses.default;
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    const userMsg = {
      id: Date.now(),
      text: `I'm interested in ${category.label}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setSelectedCategory(category.label);
    setCurrentStep('district');
    setShowQuickReplies(false);
    
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        text: generateAIResponse({ categorySelected: true, category: category.label }),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  // Handle district selection
  const handleDistrictSelect = (district) => {
    const userMsg = {
      id: Date.now(),
      text: `Search in ${district}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setSelectedDistrict(district);
    setLoading(true);
    setCurrentStep('results');
    
    setTimeout(() => {
      const results = filterBusinesses(selectedCategory, district);
      setFilteredResults(results);
      
      let botResponse = '';
      let context = {};
      
      if (results.length > 0) {
        botResponse = generateAIResponse({
          searchResults: true,
          count: results.length,
          category: selectedCategory,
          district: district
        });
        context.searchResults = true;
      } else {
        botResponse = generateAIResponse({
          noResults: true,
          category: selectedCategory,
          district: district
        });
        context.noResults = true;
      }
      
      const botMsg = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        context
      };
      
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 1500);
  };

  // Handle user text message
  const handleUserMessage = (message) => {
    if (!message.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setShowQuickReplies(false);
    
    // Simple intent detection
    setTimeout(() => {
      const messageLower = message.toLowerCase();
      let botResponse = '';
      
      if (messageLower.match(/\b(hi|hello|hey)\b/)) {
        botResponse = aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
      } else if (messageLower.match(/\b(help|what can you do)\b/)) {
        botResponse = aiResponses.help;
      } else {
        // Try to match with categories
        const matchedCategory = categories.find(cat => 
          cat.keywords.some(keyword => messageLower.includes(keyword))
        );
        
        if (matchedCategory) {
          handleCategorySelect(matchedCategory);
          return;
        } else {
          botResponse = "I understand you're looking for construction resources. Let me show you the main categories:";
          setCurrentStep('category');
        }
      }
      
      const botMsg = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  // Quick replies
  const quickReplies = [
    "Find TMT steel",
    "Need cement suppliers",
    "Construction equipment",
    "Ready mix concrete",
    "Architects & designers",
    "Show all categories"
  ];

  // Business Card Component
  const BusinessCard = ({ business }) => {
    const colorClasses = getCategoryColor(business.category);
    const formattedPhone = formatPhoneNumber(business.phone);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${colorClasses} p-3 text-white`}>
          <h3 className="font-bold text-sm truncate">{business.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Badge className="bg-white/20 text-white border-0 text-xs">
              {business.category}
            </Badge>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-900">{business.district}</p>
              {business.address && (
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{business.address}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {formattedPhone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-500" />
                <a 
                  href={`tel:${business.phone.replace(/\D/g, '')}`}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {formattedPhone}
                </a>
              </div>
            )}

            {business.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-gray-500" />
                <a
                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                >
                  Website
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="px-3 pb-3 flex gap-2">
          {formattedPhone && (
            <a
              href={`tel:${business.phone.replace(/\D/g, '')}`}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <Phone className="w-3 h-3" />
              Call
            </a>
          )}
          {business.map_location && (
            <a
              href={business.map_location.startsWith('http') ? business.map_location : `https://${business.map_location}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              Map
            </a>
          )}
        </div>
      </motion.div>
    );
  };

  // Reset chat
  const resetChat = () => {
    setSelectedCategory('');
    setSelectedDistrict('');
    setFilteredResults([]);
    setUserInput('');
    setShowQuickReplies(true);
    setCurrentStep('category');
    setMessages([{ 
      id: 0, 
      text: aiResponses.greeting[0], 
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  return (
    <>
      <Helmet>
        <title>AI Construction Assistant</title>
      </Helmet>
      
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col w-80 p-4 bg-white/90 backdrop-blur-lg border-r border-gray-200/60"
        >
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Construction AI</h1>
            <p className="text-gray-600 text-xs">Your building partner</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 mb-4 border border-emerald-100">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">{businesses.length}</div>
              <div className="text-xs text-emerald-700 font-medium">Verified Listings</div>
            </div>
          </div>

          <button
            onClick={resetChat}
            className="mt-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            New Chat
          </button>
        </motion.div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white/90 backdrop-blur-lg border-b border-gray-200/60 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-sm">Construction AI</h1>
                  <p className="text-gray-600 text-xs">Chat assistant</p>
                </div>
              </div>
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
                <Home className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Area - Takes most space */}
          <section className="flex-1 p-3 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Messages */}
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                        : 'bg-gradient-to-br from-emerald-400 to-green-500'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none border border-gray-200 shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Quick Replies */}
              {showQuickReplies && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-1.5 justify-start"
                >
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleUserMessage(reply)}
                      className="bg-white border border-gray-300 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm hover:shadow"
                    >
                      {reply}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Category Selection */}
              {currentStep === 'category' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
                >
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-500" />
                    What are you looking for?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.label}
                        onClick={() => handleCategorySelect(category)}
                        className={`bg-gradient-to-r ${category.color} text-white p-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-left`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <div className="font-semibold text-sm">{category.label}</div>
                            <div className="text-white/80 text-xs mt-0.5">{category.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* District Selection */}
              {currentStep === 'district' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
                >
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    Select District for {selectedCategory}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {districts.map((district) => (
                      <button
                        key={district}
                        onClick={() => handleDistrictSelect(district)}
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white p-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs text-center"
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Search Results */}
              {currentStep === 'results' && filteredResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-3 text-white">
                    <h3 className="font-bold text-sm mb-1">🎉 Found {filteredResults.length} Results</h3>
                    <p className="text-emerald-100 text-xs">
                      {selectedCategory} suppliers in {selectedDistrict}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredResults.map((business, index) => (
                      <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <BusinessCard business={business} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* No Results */}
              {currentStep === 'results' && filteredResults.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-2xl">😔</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No Results Found</h3>
                  <p className="text-gray-600 text-xs mb-3">
                    No {selectedCategory} suppliers found in {selectedDistrict}
                  </p>
                  <button
                    onClick={resetChat}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white rounded-lg rounded-bl-none p-2 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs">Searching for the best options...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </section>

          {/* Input Area - Fixed at bottom with better visibility */}
          <div className="border-t border-gray-200 bg-white/95 backdrop-blur-lg p-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserMessage(userInput)}
                  placeholder="Type your message... (e.g., 'I need TMT steel in Ernakulam')"
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 placeholder-gray-500"
                  style={{ fontSize: '14px', fontWeight: '400' }}
                />
                <button
                  onClick={() => handleUserMessage(userInput)}
                  disabled={!userInput.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 disabled:shadow-none flex items-center gap-1 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  onClick={resetChat}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  onClick={() => handleUserMessage('help')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  Help
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatBotPageAdvanced;