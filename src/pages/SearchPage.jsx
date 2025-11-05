// src/pages/SearchPage.jsx - CORRECTED FULL CODE WITH PROPER CSV MAPPING

import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowLeft, SortAsc, SortDesc, Grid, List, MapPin, Phone, Mail, Globe,
  ExternalLink, Star, Map, ChevronDown, X, Filter, CheckCircle, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../components/ui/badge';
import { fetchBusinessesWithCache } from '../lib/GoogleSheetService';

// Safe star count helper
const getSafeStarCount = (rating) => {
  if (!rating) return 0;
  const parsed = parseFloat(rating);
  return isNaN(parsed) ? 0 : Math.min(5, Math.max(0, Math.round(parsed)));
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterChips, setFilterChips] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Categories with proper mapping to CSV data
  const categories = [
    {
      label: 'Steel Sector',
      icon: '⚙️',
      color: 'from-gray-500 to-slate-600',
      description: 'TMT steel dealers, structural steel, steel distributors.',
      subcategories: ['TMT', 'Steel Distributors', 'Structural Steel', 'Iron and steel store', 'Steel industry', 'Manufacturer']
    },
    {
      label: 'Cement Sector',
      icon: '🏗️',
      color: 'from-blue-500 to-cyan-500',
      description: 'Cement dealers, bulk cement suppliers, cement manufacturers.',
      subcategories: ['Cement', 'Cement Dealers', 'Cement supplier', 'Cement manufacturer', 'Building materials supplier']
    },
    {
      label: 'Ready-Mix Concrete',
      icon: '🚛',
      color: 'from-amber-500 to-orange-500',
      description: 'RMC suppliers, concrete batching plants.',
      subcategories: ['RMC', 'Ready mix concrete supplier', 'Concrete Batching Plants']
    },
    {
      label: 'Construction Equipment',
      icon: '🚜',
      color: 'from-orange-500 to-red-500',
      description: 'Equipment rental, JCB, excavators, cranes.',
      subcategories: ['Equipment Rental', 'Power Tools Rental', 'Scaffolding Rental', 'JCB']
    },
    {
      label: 'Architects & Consultants',
      icon: '📊',
      color: 'from-green-500 to-emerald-500',
      description: 'Architects, structural engineers, design consultants.',
      subcategories: ['Architect', 'Architecture firm', 'Interior Designers', 'Interior designer']
    },
    {
      label: 'Construction Services',
      icon: '👷',
      color: 'from-purple-500 to-pink-500',
      description: 'Construction companies, contractors, builders.',
      subcategories: ['Construction company', 'Contractors', 'Builders', 'Construction']
    },
    {
      label: 'Rentals & Services',
      icon: '🔄',
      color: 'from-indigo-500 to-blue-500',
      description: 'Vehicle rentals, equipment rentals, service providers.',
      subcategories: ['Car rental', 'Houseboat rental', 'Motorcycle rental', 'Car leasing']
    }
  ];

  const districts = [
    'All Districts', 'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
    'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  const sortOptions = [
    { value: 'name', label: 'Name A-Z', icon: '🔤' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
    { value: 'district', label: 'Location', icon: '📍' },
    { value: 'rating_count', label: 'Most Reviewed', icon: '📝' },
  ];

  // Get selected category object
  const getSelectedCategoryObj = () => {
    return categories.find(cat => cat.label === selectedCategory);
  };

  // Count items per category
  const getCategoryCount = (categoryLabel) => {
    return businesses.filter(b => {
      const category = b.category?.toLowerCase() || '';
      const label = categoryLabel.toLowerCase();
      return category.includes(label);
    }).length;
  };

  // Format phone number properly
  const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as XXX-XXX-XXXX or XXXX-XXXXXX
    if (cleaned.length >= 10) {
      return cleaned.slice(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  // Fetch businesses
  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true);
      try {
        const data = await fetchBusinessesWithCache();
        // Map CSV fields to component fields
        const mappedData = data.map(b => ({
          ...b,
          phone: b.phone_number || b.phone || '', // Handle both field names
          rating: b.review || b.rating || 0,
          rating_count: b.rating_count || 0,
          address: b.address || b.location || '',
          subcategory: b.subcategory || '',
          category: b.category || '',
          district: b.district || '',
          name: b.name || '',
          website: b.website || '',
          email: b.email_id || b.email || '',
          map_location: b.map_link || '',
          gst_number: b.gst_number || ''
        }));
        setBusinesses(mappedData);
      } catch (error) {
        console.error('Error loading businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBusinesses();
  }, []);

  // Filter and sort
  const filteredAndSortedBusinesses = useMemo(() => {
    let filtered = [...businesses];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(business =>
        business.name?.toLowerCase().includes(searchLower) ||
        business.category?.toLowerCase().includes(searchLower) ||
        business.subcategory?.toLowerCase().includes(searchLower) ||
        business.address?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(business => {
        const category = business.category?.toLowerCase() || '';
        const categoryLabel = selectedCategory.toLowerCase();
        return category.includes(categoryLabel) || categoryLabel.includes(category);
      });
    }

    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(business => {
        const subcategory = business.subcategory?.toLowerCase() || '';
        const subLabel = selectedSubcategory.toLowerCase();
        return subcategory.includes(subLabel);
      });
    }

    if (selectedDistrict !== 'all' && selectedDistrict !== 'All Districts') {
      filtered = filtered.filter(business =>
        business.district?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(business =>
        parseFloat(business.rating) >= minRating
      );
    }

    if (verifiedOnly) {
      filtered = filtered.filter(business => business.gst_number && business.gst_number.trim() !== '');
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]?.toString().toLowerCase() || '';
      let bValue = b[sortField]?.toString().toLowerCase() || '';

      if (sortField === 'rating' || sortField === 'rating_count') {
        aValue = parseFloat(a[sortField]) || 0;
        bValue = parseFloat(b[sortField]) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [businesses, searchTerm, selectedCategory, selectedSubcategory, selectedDistrict, sortField, sortOrder, ratingFilter, verifiedOnly]);

  // Update filter chips
  const updateFilters = () => {
    const chips = [];
    if (selectedCategory !== 'all') chips.push({ type: 'category', value: selectedCategory });
    if (selectedSubcategory !== 'all') chips.push({ type: 'subcategory', value: selectedSubcategory });
    if (selectedDistrict !== 'all') chips.push({ type: 'district', value: selectedDistrict });
    if (ratingFilter !== 'all') chips.push({ type: 'rating', value: `Rating ≥ ${ratingFilter}⭐` });
    if (verifiedOnly) chips.push({ type: 'verified', value: 'GST Verified' });
    setFilterChips(chips);
  };

  useEffect(() => {
    updateFilters();
  }, [selectedCategory, selectedSubcategory, selectedDistrict, ratingFilter, verifiedOnly]);

  const removeChip = (chipType) => {
    switch(chipType) {
      case 'category': setSelectedCategory('all'); break;
      case 'subcategory': setSelectedSubcategory('all'); break;
      case 'district': setSelectedDistrict('all'); break;
      case 'rating': setRatingFilter('all'); break;
      case 'verified': setVerifiedOnly(false); break;
      default: break;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('steel') || categoryLower.includes('tmt')) 
      return 'from-gray-500 to-slate-600';
    if (categoryLower.includes('cement')) 
      return 'from-blue-500 to-cyan-500';
    if (categoryLower.includes('rmc') || categoryLower.includes('concrete')) 
      return 'from-amber-500 to-orange-500';
    if (categoryLower.includes('equipment') || categoryLower.includes('rental')) 
      return 'from-orange-500 to-red-500';
    if (categoryLower.includes('architect') || categoryLower.includes('consultant')) 
      return 'from-green-500 to-emerald-500';
    if (categoryLower.includes('contractor') || categoryLower.includes('construction')) 
      return 'from-purple-500 to-pink-500';
    
    return 'from-emerald-500 to-green-500';
  };

  // Star Rating Component
  const StarRating = ({ rating, count }) => {
    const stars = getSafeStarCount(rating);
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} whileHover={{ scale: 1.2 }}>
              <Star
                size={16}
                className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            </motion.div>
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-700">{rating || '0'}</span>
        {count && <span className="text-xs text-gray-500">({count})</span>}
      </div>
    );
  };

  // Professional Card Component
  const ProfessionalCard = ({ business, index }) => {
    const gradientClass = getCategoryColor(business.category);
    const isVerified = business.gst_number && business.gst_number.trim() !== '';
    const formattedPhone = formatPhoneNumber(business.phone);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.03 }}
        className="h-full group"
      >
        <div className="relative h-full rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`}></div>

          <div className="p-6 relative">
            <div className="absolute top-4 right-4 flex gap-2">
              {isVerified && (
                <motion.div whileHover={{ scale: 1.1 }} title="GST Verified">
                  <CheckCircle className="w-5 h-5 text-green-500 fill-green-100" />
                </motion.div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-2">
                {business.name}
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Badge className={`bg-gradient-to-r ${gradientClass} text-white border-0`}>
                    {business.category}
                  </Badge>
                </motion.div>
                {business.subcategory && business.subcategory !== business.category && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {business.subcategory}
                  </Badge>
                )}
              </div>

              {business.rating && (
                <StarRating rating={business.rating} count={business.rating_count} />
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>

            <div className="space-y-3 mb-4">
              {business.district && (
                <motion.div className="flex items-start gap-3" whileHover={{ x: 4 }}>
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{business.district}</p>
                    {business.address && (
                      <p className="text-xs text-gray-500 line-clamp-2">{business.address}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {formattedPhone && (
                <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <a
                    href={`tel:${business.phone.replace(/\D/g, '')}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium truncate hover:underline"
                    title={business.phone}
                  >
                    {formattedPhone}
                  </a>
                </motion.div>
              )}

              {business.email && (
                <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
                  <Mail className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <a
                    href={`mailto:${business.email}`}
                    className="text-sm text-red-600 hover:text-red-700 font-medium truncate hover:underline"
                    title={business.email}
                  >
                    {business.email}
                  </a>
                </motion.div>
              )}

              {business.website && (
                <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
                  <Globe className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <a
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium truncate hover:underline flex items-center gap-1"
                  >
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex gap-2">
                {business.map_location && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(business.map_location, '_blank')}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    Map
                  </motion.button>
                )}
                {business.website && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(business.website.startsWith('http') ? business.website : `https://${business.website}`, '_blank')}
                    className="flex-1 px-3 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg font-medium text-sm hover:bg-emerald-50 transition-all"
                  >
                    Visit
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Compact List View
  const CompactListCard = ({ business, index }) => {
    const gradientClass = getCategoryColor(business.category);
    const isVerified = business.gst_number && business.gst_number.trim() !== '';
    const formattedPhone = formatPhoneNumber(business.phone);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.02 }}
      >
        <div className="bg-white rounded-xl border-l-4 border-emerald-500 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-3 hover:-translate-y-0.5">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{business.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={`bg-gradient-to-r ${gradientClass} text-white border-0 text-xs`}>
                    {business.category}
                  </Badge>
                  {isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{business.district}</span>
                </div>
                {business.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(getSafeStarCount(business.rating))].map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-3">
                {formattedPhone && (
                  <a 
                    href={`tel:${business.phone.replace(/\D/g, '')}`} 
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-1"
                    title={business.phone}
                  >
                    <Phone className="w-3 h-3" /> {formattedPhone}
                  </a>
                )}
                {business.email && (
                  <a 
                    href={`mailto:${business.email}`} 
                    className="text-sm text-red-600 hover:underline truncate flex items-center gap-1"
                    title={business.email}
                  >
                    <Mail className="w-3 h-3" /> {business.email}
                  </a>
                )}
              </div>

              <div className="md:col-span-4 flex gap-2">
                {business.map_location && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => window.open(business.map_location, '_blank')}
                    className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                  >
                    <Map className="w-4 h-4" />
                    Map
                  </motion.button>
                )}
                {business.website && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => window.open(business.website.startsWith('http') ? business.website : `https://${business.website}`, '_blank')}
                    className="px-3 py-1.5 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Category Card Component
  const CategoryCard = ({ category, index }) => {
    const count = getCategoryCount(category.label);

    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        onClick={() => {
          setSelectedCategory(category.label);
          setSelectedSubcategory('all');
        }}
        className="relative group h-full"
      >
        <div className={`h-full rounded-2xl bg-gradient-to-br ${category.color} p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-white transform group-hover:scale-110 transition-transform duration-300"></div>
          </div>

          <div className="relative z-10">
            <div className="text-5xl mb-3">{category.icon}</div>
            <h3 className="text-xl font-bold mb-2">{category.label}</h3>
            <p className="text-sm opacity-90 mb-4 line-clamp-2">{category.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                {count} providers
              </span>
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  // Selected Category Showcase
  const SelectedCategoryShowcase = () => {
    const categoryObj = getSelectedCategoryObj();
    if (!categoryObj) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-gradient-to-r ${categoryObj.color} rounded-2xl p-8 mb-8 text-white shadow-xl`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-5xl mb-3">{categoryObj.icon}</div>
            <h2 className="text-3xl font-bold mb-2">{categoryObj.label}</h2>
            <p className="text-white/90 text-lg">{categoryObj.description}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubcategory('all');
            }}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div>
          <label className="text-sm font-semibold opacity-90 mb-3 block">Filter by type:</label>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedSubcategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedSubcategory === 'all'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All Types
            </motion.button>
            {categoryObj.subcategories.map((subcat) => (
              <motion.button
                key={subcat}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedSubcategory(subcat)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedSubcategory === subcat
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {subcat}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Professional Directory - BuildNet AI</title>
        <meta name="description" content="Comprehensive construction industry directory" />
      </Helmet>

      <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-10 px-4 sticky top-0 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 mb-4 group"
            >
              <motion.div whileHover={{ x: -4 }} className="flex items-center gap-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </motion.div>
            </Button>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white">
              Professional Directory
            </h1>
            <p className="text-emerald-100 text-lg">Discover industry-leading service providers across Kerala</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Category Grid */}
          {selectedCategory === 'all' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
              <p className="text-gray-600 mb-8">Select a category to explore businesses</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                  <CategoryCard key={category.label} category={category} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Selected Category Showcase */}
          <AnimatePresence>
            {selectedCategory !== 'all' && (
              <SelectedCategoryShowcase />
            )}
          </AnimatePresence>

          {/* Search & Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-xl border border-white/40"
          >
            {/* Search Bar */}
            <div className="mb-6">
              <motion.div whileHover={{ scale: 1.02 }} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
                <Input
                  placeholder="Search by name, category, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-lg"
                />
              </motion.div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                setSelectedSubcategory('all');
              }}>
                <SelectTrigger className="h-12 border-2 border-emerald-200 rounded-xl font-medium">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.icon} {group.label}</SelectLabel>
                      {group.subcategories.map((cat) => (
                        <SelectItem key={cat} value={group.label}>{cat}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="h-12 border-2 border-emerald-200 rounded-xl font-medium">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((dist) => (
                    <SelectItem key={dist} value={dist === 'All Districts' ? 'all' : dist}>
                      📍 {dist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortField} onValueChange={setSortField}>
                <SelectTrigger className="h-12 border-2 border-emerald-200 rounded-xl font-medium">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="h-12 border-2 border-emerald-200 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </motion.button>
            </div>

            {/* Advanced Filters */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-emerald-600 font-semibold mb-4 hover:text-emerald-700"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              <motion.div animate={{ rotate: showAdvancedFilters ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 pt-6 border-t-2 border-emerald-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Rating</label>
                      <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="border-2 border-emerald-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="3">⭐ 3+</SelectItem>
                          <SelectItem value="4">⭐⭐ 4+</SelectItem>
                          <SelectItem value="4.5">⭐⭐⭐ 4.5+</SelectItem>
                          <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Verification</label>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                          verifiedOnly
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        GST Verified Only
                      </motion.button>
                    </div>

                    <div className="flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setSelectedSubcategory('all');
                          setSelectedDistrict('all');
                          setRatingFilter('all');
                          setVerifiedOnly(false);
                        }}
                        className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all"
                      >
                        Reset All
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Chips */}
            {filterChips.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2 mb-4 pb-4 border-b"
              >
                {filterChips.map((chip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {chip.value}
                    <button onClick={() => removeChip(chip.type)} className="hover:bg-emerald-200 p-0.5 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold text-emerald-600 text-lg">{filteredAndSortedBusinesses.length}</span> of{' '}
                <span className="font-bold text-gray-900 text-lg">{businesses.length}</span> businesses
              </div>

              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                {[
                  { mode: 'grid', icon: Grid, label: 'Grid' },
                  { mode: 'list', icon: List, label: 'List' }
                ].map(({ mode, icon: Icon, label }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                      viewMode === mode
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-6"
              />
              <p className="text-gray-600 text-lg font-medium">Loading directory...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredAndSortedBusinesses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-32"
                >
                  <Search className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-3xl font-bold text-gray-600 mb-2">No results found</h3>
                  <p className="text-gray-500 text-lg">Try adjusting your filters</p>
                </motion.div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedBusinesses.map((business, index) => (
                    <ProfessionalCard key={business.id || index} business={business} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedBusinesses.map((business, index) => (
                    <CompactListCard key={business.id || index} business={business} index={index} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
