import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, Minus, Trash2, Send, FileText, 
  Calendar, User, Phone, Mail, Building2, MapPin, 
  Package, CheckCircle, X, AlertCircle,
  Download, Copy, MessageCircle, Sparkles, ArrowLeft,
  ChevronDown, Filter, Search, Users, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { fetchBusinessesWithCache } from '../lib/GoogleSheetAuthService';

// Material categories with items
const materialCategories = [
  {
    name: 'Steel Products',
    icon: '⚙️',
    color: 'from-gray-500 to-slate-600',
    items: [
      { id: 'tmt_8mm', name: 'TMT Bars 8mm', unit: 'Kg', priceRange: '₹50-60' },
      { id: 'tmt_10mm', name: 'TMT Bars 10mm', unit: 'Kg', priceRange: '₹48-58' },
      { id: 'tmt_12mm', name: 'TMT Bars 12mm', unit: 'Kg', priceRange: '₹47-57' },
      { id: 'tmt_16mm', name: 'TMT Bars 16mm', unit: 'Kg', priceRange: '₹46-56' },
      { id: 'tmt_20mm', name: 'TMT Bars 20mm', unit: 'Kg', priceRange: '₹45-55' },
      { id: 'steel_angles', name: 'Steel Angles', unit: 'Kg', priceRange: '₹55-70' },
      { id: 'steel_channels', name: 'Steel Channels', unit: 'Kg', priceRange: '₹60-75' },
      { id: 'ms_plates', name: 'MS Plates', unit: 'Kg', priceRange: '₹45-60' },
    ]
  },
  {
    name: 'Cement & Concrete',
    icon: '🏗️',
    color: 'from-blue-500 to-cyan-500',
    items: [
      { id: 'opc_43', name: 'OPC 43 Grade Cement', unit: 'Bag (50kg)', priceRange: '₹350-420' },
      { id: 'opc_53', name: 'OPC 53 Grade Cement', unit: 'Bag (50kg)', priceRange: '₹380-450' },
      { id: 'ppc', name: 'PPC Cement', unit: 'Bag (50kg)', priceRange: '₹330-400' },
      { id: 'rmc_m20', name: 'Ready Mix Concrete M20', unit: 'Cubic Meter', priceRange: '₹4500-5500' },
      { id: 'rmc_m25', name: 'Ready Mix Concrete M25', unit: 'Cubic Meter', priceRange: '₹5000-6000' },
      { id: 'rmc_m30', name: 'Ready Mix Concrete M30', unit: 'Cubic Meter', priceRange: '₹5500-6500' },
    ]
  },
  {
    name: 'Aggregates & Sand',
    icon: '🪨',
    color: 'from-amber-500 to-orange-500',
    items: [
      { id: 'river_sand', name: 'River Sand', unit: 'Ton', priceRange: '₹800-1200' },
      { id: 'm_sand', name: 'M-Sand', unit: 'Ton', priceRange: '₹600-900' },
      { id: 'p_sand', name: 'P-Sand (Plastering)', unit: 'Ton', priceRange: '₹500-800' },
      { id: 'blue_metal_20mm', name: 'Blue Metal 20mm', unit: 'Ton', priceRange: '₹900-1300' },
      { id: 'blue_metal_12mm', name: 'Blue Metal 12mm', unit: 'Ton', priceRange: '₹950-1350' },
      { id: 'granite_chips', name: 'Granite Chips', unit: 'Ton', priceRange: '₹700-1000' },
    ]
  },
  {
    name: 'Bricks & Blocks',
    icon: '🧱',
    color: 'from-red-500 to-pink-500',
    items: [
      { id: 'red_bricks', name: 'Red Clay Bricks', unit: 'Piece', priceRange: '₹6-10' },
      { id: 'fly_ash_bricks', name: 'Fly Ash Bricks', unit: 'Piece', priceRange: '₹4-7' },
      { id: 'aac_blocks_4', name: 'AAC Blocks 4 inch', unit: 'Piece', priceRange: '₹35-50' },
      { id: 'aac_blocks_6', name: 'AAC Blocks 6 inch', unit: 'Piece', priceRange: '₹50-70' },
      { id: 'aac_blocks_8', name: 'AAC Blocks 8 inch', unit: 'Piece', priceRange: '₹65-90' },
      { id: 'hollow_blocks', name: 'Hollow Concrete Blocks', unit: 'Piece', priceRange: '₹30-45' },
    ]
  },
  {
    name: 'Electrical Items',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    items: [
      { id: 'copper_wire_1_5', name: 'Copper Wire 1.5 sq mm', unit: 'Meter', priceRange: '₹15-25' },
      { id: 'copper_wire_2_5', name: 'Copper Wire 2.5 sq mm', unit: 'Meter', priceRange: '₹25-35' },
      { id: 'copper_wire_4', name: 'Copper Wire 4 sq mm', unit: 'Meter', priceRange: '₹40-55' },
      { id: 'pvc_conduit_25mm', name: 'PVC Conduit 25mm', unit: 'Meter', priceRange: '₹20-30' },
      { id: 'mcb_16a', name: 'MCB 16A Single Pole', unit: 'Piece', priceRange: '₹80-150' },
      { id: 'mcb_32a', name: 'MCB 32A Single Pole', unit: 'Piece', priceRange: '₹120-200' },
    ]
  },
  {
    name: 'Plumbing Materials',
    icon: '🚰',
    color: 'from-blue-600 to-indigo-600',
    items: [
      { id: 'pvc_pipe_half', name: 'PVC Pipe 1/2 inch', unit: 'Meter', priceRange: '₹25-40' },
      { id: 'pvc_pipe_3_4', name: 'PVC Pipe 3/4 inch', unit: 'Meter', priceRange: '₹35-50' },
      { id: 'pvc_pipe_1', name: 'PVC Pipe 1 inch', unit: 'Meter', priceRange: '₹45-65' },
      { id: 'pvc_pipe_1_5', name: 'PVC Pipe 1.5 inch', unit: 'Meter', priceRange: '₹70-100' },
      { id: 'cpvc_pipe_half', name: 'CPVC Pipe 1/2 inch', unit: 'Meter', priceRange: '₹40-60' },
      { id: 'gi_pipe_half', name: 'GI Pipe 1/2 inch', unit: 'Meter', priceRange: '₹80-120' },
    ]
  },
];

const RFQComponent = () => {
  // State Management
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(1); // 1: Materials, 2: Customer Details, 3: Select Suppliers, 4: Review & Send
  
  // Supplier Management
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState('');
  
  // Customer Details
  const [customerDetails, setCustomerDetails] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    projectName: '',
    deliveryDate: '',
    notes: ''
  });

  // Validation & Status
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Kerala Districts
  const districts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  // Load suppliers from Google Sheets
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const businesses = await fetchBusinessesWithCache();
      console.log('📦 Loaded suppliers from Google Sheets:', businesses.length);
      
      // Filter suppliers with phone numbers
      const suppliersWithPhone = businesses.filter(b => 
        b.phone && b.phone.trim() && b.name && b.name.trim()
      );
      
      console.log('📞 Suppliers with phone:', suppliersWithPhone.length);
      setAllSuppliers(suppliersWithPhone);
      setFilteredSuppliers(suppliersWithPhone);
    } catch (error) {
      console.error('❌ Error loading suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Filter suppliers based on criteria
  useEffect(() => {
    let filtered = [...allSuppliers];

    // Filter by district
    if (selectedDistrict) {
      filtered = filtered.filter(s => 
        s.district?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    // Filter by material category
    if (selectedMaterialCategory) {
      filtered = filtered.filter(s => 
        s.category?.toLowerCase().includes(selectedMaterialCategory.toLowerCase()) ||
        s.subcategory?.toLowerCase().includes(selectedMaterialCategory.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSuppliers(filtered);
    console.log('🔍 Filtered suppliers:', filtered.length);
  }, [selectedDistrict, selectedMaterialCategory, searchTerm, allSuppliers]);

  // Toggle supplier selection
  const toggleSupplierSelection = (supplier) => {
    if (selectedSuppliers.find(s => s.id === supplier.id)) {
      setSelectedSuppliers(selectedSuppliers.filter(s => s.id !== supplier.id));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplier]);
    }
  };

  // Select all filtered suppliers
  const selectAllSuppliers = () => {
    setSelectedSuppliers([...filteredSuppliers]);
  };

  // Clear supplier selection
  const clearSupplierSelection = () => {
    setSelectedSuppliers([]);
  };

  // Cart functions
  const addToCart = (item, category) => {
    const existingItem = cartItems.find(ci => ci.id === item.id);
    if (existingItem) {
      updateQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCartItems([...cartItems, {
        ...item,
        category: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
        quantity: 1,
        notes: ''
      }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateItemNotes = (itemId, notes) => {
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!customerDetails.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!customerDetails.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!customerDetails.phone.trim()) newErrors.phone = 'Phone number is required';
    if (customerDetails.phone && !/^\d{10}$/.test(customerDetails.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Valid 10-digit phone number required';
    }
    if (customerDetails.email && !/\S+@\S+\.\S+/.test(customerDetails.email)) {
      newErrors.email = 'Valid email required';
    }
    if (!customerDetails.deliveryDate) newErrors.deliveryDate = 'Expected delivery date required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate RFQ text
  const generateRFQText = () => {
    const rfqId = `RFQ-${Date.now().toString().slice(-6)}`;
    const date = new Date().toLocaleDateString('en-IN');
    
    let text = `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📋 REQUEST FOR QUOTATION\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `🆔 RFQ ID: ${rfqId}\n`;
    text += `📅 Date: ${date}\n\n`;
    
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 CUSTOMER DETAILS\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏢 Company: ${customerDetails.companyName}\n`;
    text += `👨‍💼 Contact: ${customerDetails.contactPerson}\n`;
    text += `📞 Phone: ${customerDetails.phone}\n`;
    if (customerDetails.email) text += `📧 Email: ${customerDetails.email}\n`;
    if (customerDetails.address) text += `📍 Address: ${customerDetails.address}\n`;
    if (customerDetails.district) text += `🗺️ District: ${customerDetails.district}\n`;
    if (customerDetails.projectName) text += `🏗️ Project: ${customerDetails.projectName}\n`;
    text += `📅 Required By: ${new Date(customerDetails.deliveryDate).toLocaleDateString('en-IN')}\n\n`;
    
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📦 MATERIALS REQUESTED\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    cartItems.forEach((item, index) => {
      text += `${index + 1}. ${item.name}\n`;
      text += `   📊 Quantity: ${item.quantity} ${item.unit}\n`;
      text += `   💰 Approx Price: ${item.priceRange}\n`;
      if (item.notes) text += `   📝 Notes: ${item.notes}\n`;
      text += `\n`;
    });
    
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 SUMMARY\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Total Items: ${cartItems.length}\n`;
    text += `Total Quantity: ${cartItems.reduce((sum, item) => sum + item.quantity, 0)} units\n\n`;
    
    if (customerDetails.notes) {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📝 ADDITIONAL NOTES\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `${customerDetails.notes}\n\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✅ Please provide your best quotation for the above materials.\n`;
    text += `⏰ Quote validity: 30 days\n`;
    text += `💳 Payment terms: As per discussion\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Thank you for your time!\n`;
    text += `Generated via BuildNet Directory 🚀`;
    
    return text;
  };

  // Send to multiple suppliers via WhatsApp
  const sendToAllSuppliers = async () => {
    if (selectedSuppliers.length === 0) {
      alert('⚠️ Please select at least one supplier');
      return;
    }

    setSending(true);
    setSendProgress(0);

    const rfqText = generateRFQText();
    const encodedText = encodeURIComponent(rfqText);

    // Send to each supplier with delay
    for (let i = 0; i < selectedSuppliers.length; i++) {
      const supplier = selectedSuppliers[i];
      const supplierPhone = (supplier.phone || '').replace(/\D/g, '');
      
      if (supplierPhone) {
        const whatsappUrl = `https://wa.me/91${supplierPhone}?text=${encodedText}`;
        console.log(`📤 Sending to ${supplier.name}: ${supplierPhone}`);
        
        // Open WhatsApp link
        window.open(whatsappUrl, '_blank');
        
        // Update progress
        setSendProgress(((i + 1) / selectedSuppliers.length) * 100);
        
        // Delay between opens (2 seconds)
        if (i < selectedSuppliers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    setSending(false);
    setSuccess(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setSuccess(false);
      setCartItems([]);
      setSelectedSuppliers([]);
      setStep(1);
      setSelectedCategory(null);
      setCustomerDetails({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        projectName: '',
        deliveryDate: '',
        notes: ''
      });
    }, 3000);
  };

  // Copy RFQ
  const copyToClipboard = () => {
    const text = generateRFQText();
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ RFQ copied to clipboard!');
    });
  };

  // Download RFQ
  const downloadRFQ = () => {
    const text = generateRFQText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RFQ-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 sm:p-10 mb-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8" />
                <h1 className="text-3xl sm:text-5xl font-bold">Request for Quotation</h1>
              </div>
              <p className="text-blue-100 text-lg">Create and send RFQs to multiple suppliers via WhatsApp</p>
            </div>
            
            {/* Cart Badge */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                <span className="font-bold">{cartItems.length} items</span>
              </div>
              {selectedSuppliers.length > 0 && (
                <div className="bg-green-500/80 backdrop-blur-sm rounded-2xl px-4 py-2">
                  <Users className="w-5 h-5 inline mr-2" />
                  <span className="font-bold">{selectedSuppliers.length} suppliers</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-between max-w-3xl">
            {[
              { num: 1, label: 'Materials', icon: Package },
              { num: 2, label: 'Details', icon: User },
              { num: 3, label: 'Suppliers', icon: Users },
              { num: 4, label: 'Send', icon: Send }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: step === s.num ? 1.2 : 1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      step >= s.num ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
                    } shadow-lg`}
                  >
                    {step > s.num ? <CheckCircle className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                  </motion.div>
                  <p className="text-xs mt-2 font-semibold hidden sm:block">{s.label}</p>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${step > s.num ? 'bg-white' : 'bg-white/30'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-md">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">RFQ sent to {selectedSuppliers.length} supplier(s) via WhatsApp</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Material Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                      Select Materials
                    </h2>
                    
                    {/* Category Selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      {materialCategories.map((category) => (
                        <motion.button
                          key={category.name}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCategory(
                            selectedCategory?.name === category.name ? null : category
                          )}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedCategory?.name === category.name
                              ? `border-transparent bg-gradient-to-br ${category.color} text-white shadow-lg`
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                          }`}
                        >
                          <div className="text-4xl mb-2">{category.icon}</div>
                          <h3 className="font-bold text-sm">{category.name}</h3>
                        </motion.button>
                      ))}
                    </div>

                    {/* Items List */}
                    {selectedCategory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t-2 pt-6"
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="text-3xl">{selectedCategory.icon}</span>
                          {selectedCategory.name}
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedCategory.items.map((item) => {
                            const inCart = cartItems.find(ci => ci.id === item.id);
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                              >
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <Badge className="bg-blue-100 text-blue-700 border-0">
                                      {item.unit}
                                    </Badge>
                                    <span className="text-sm text-gray-700">{item.priceRange}</span>
                                  </div>
                                </div>
                                
                                {inCart ? (
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                                      className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </motion.button>
                                    <span className="w-12 text-center font-bold text-gray-900">{inCart.quantity}</span>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                                      className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </motion.button>
                                  </div>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addToCart(item, selectedCategory)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add
                                  </motion.button>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Next Button */}
                  {cartItems.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                      Next: Enter Details
                      <CheckCircle className="w-6 h-6" />
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Step 2: Customer Details Form */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-6 shadow-xl"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-6 h-6 text-purple-500" />
                    Customer Details
                  </h2>

                  <div className="space-y-4">
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Company Name *
                      </label>
                      <Input
                        value={customerDetails.companyName}
                        onChange={(e) => setCustomerDetails({...customerDetails, companyName: e.target.value})}
                        placeholder="ABC Construction Pvt Ltd"
                        className={`h-12 text-gray-900 ${errors.companyName ? 'border-red-500' : ''}`}
                      />
                      {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Contact Person *
                      </label>
                      <Input
                        value={customerDetails.contactPerson}
                        onChange={(e) => setCustomerDetails({...customerDetails, contactPerson: e.target.value})}
                        placeholder="John Doe"
                        className={`h-12 text-gray-900 ${errors.contactPerson ? 'border-red-500' : ''}`}
                      />
                      {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Phone Number *
                        </label>
                        <Input
                          value={customerDetails.phone}
                          onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                          placeholder="9876543210"
                          className={`h-12 text-gray-900 ${errors.phone ? 'border-red-500' : ''}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email
                        </label>
                        <Input
                          value={customerDetails.email}
                          onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                          placeholder="contact@example.com"
                          className={`h-12 text-gray-900 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Address
                      </label>
                      <Input
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                        placeholder="123, Main Street, City"
                        className="h-12 text-gray-900"
                      />
                    </div>

                    {/* District & Project Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          District
                        </label>
                        <select
                          value={customerDetails.district}
                          onChange={(e) => setCustomerDetails({...customerDetails, district: e.target.value})}
                          className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        >
                          <option value="">Select District</option>
                          {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          <Building2 className="w-4 h-4 inline mr-1" />
                          Project Name
                        </label>
                        <Input
                          value={customerDetails.projectName}
                          onChange={(e) => setCustomerDetails({...customerDetails, projectName: e.target.value})}
                          placeholder="Residential Complex"
                          className="h-12 text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Delivery Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Expected Delivery Date *
                      </label>
                      <Input
                        type="date"
                        value={customerDetails.deliveryDate}
                        onChange={(e) => setCustomerDetails({...customerDetails, deliveryDate: e.target.value})}
                        className={`h-12 text-gray-900 ${errors.deliveryDate ? 'border-red-500' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.deliveryDate && <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>}
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Additional Notes
                      </label>
                      <textarea
                        value={customerDetails.notes}
                        onChange={(e) => setCustomerDetails({...customerDetails, notes: e.target.value})}
                        placeholder="Any special requirements or instructions..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (validateForm()) {
                          setStep(3);
                        }
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      Next: Select Suppliers
                      <CheckCircle className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Supplier Selection */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-6 shadow-xl"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-500" />
                    Select Suppliers
                  </h2>

                  {/* Filters */}
                  <div className="mb-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search suppliers by name, category..."
                        className="pl-10 h-12 text-gray-900"
                      />
                    </div>

                    {/* District & Category Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="">All Districts</option>
                        {districts.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select
                        value={selectedMaterialCategory}
                        onChange={(e) => setSelectedMaterialCategory(e.target.value)}
                        className="h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="">All Categories</option>
                        {materialCategories.map(cat => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Selection Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={selectAllSuppliers}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm"
                      >
                        Select All ({filteredSuppliers.length})
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={clearSupplierSelection}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm"
                      >
                        Clear Selection
                      </motion.button>
                    </div>
                  </div>

                  {/* Supplier List */}
                  {loadingSuppliers ? (
                    <div className="text-center py-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
                      />
                      <p className="text-gray-600">Loading suppliers...</p>
                    </div>
                  ) : filteredSuppliers.length === 0 ? (
                    <div className="text-center py-10">
                      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No suppliers found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {filteredSuppliers.map((supplier) => {
                        const isSelected = selectedSuppliers.find(s => s.id === supplier.id);
                        return (
                          <motion.div
                            key={supplier.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleSupplierSelection(supplier)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{supplier.name}</h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {supplier.category && (
                                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                                      {supplier.category}
                                    </Badge>
                                  )}
                                  {supplier.district && (
                                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                      📍 {supplier.district}
                                    </Badge>
                                  )}
                                </div>
                                {supplier.phone && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    📞 {supplier.phone}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-6 h-6 text-blue-500" />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (selectedSuppliers.length > 0) {
                          setStep(4);
                        } else {
                          alert('⚠️ Please select at least one supplier');
                        }
                      }}
                      disabled={selectedSuppliers.length === 0}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Review & Send
                      <CheckCircle className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Send */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-6 shadow-xl"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-500" />
                    Review & Send
                  </h2>

                  {/* Preview Box */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                      RFQ Preview
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2 text-gray-800">
                        <div><span className="font-semibold">Company:</span> {customerDetails.companyName}</div>
                        <div><span className="font-semibold">Contact:</span> {customerDetails.contactPerson}</div>
                        <div><span className="font-semibold">Phone:</span> {customerDetails.phone}</div>
                        <div><span className="font-semibold">Email:</span> {customerDetails.email || 'N/A'}</div>
                        <div><span className="font-semibold">District:</span> {customerDetails.district || 'N/A'}</div>
                        <div><span className="font-semibold">Required By:</span> {new Date(customerDetails.deliveryDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      
                      <div className="border-t pt-3 text-gray-800">
                        <span className="font-semibold">Total Items:</span> {cartItems.length}
                      </div>
                      
                      <div className="border-t pt-3 text-gray-800">
                        <span className="font-semibold">Sending to:</span> {selectedSuppliers.length} supplier(s)
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowPreview(!showPreview)}
                      className="mt-4 text-blue-600 font-semibold flex items-center gap-2 hover:text-blue-700"
                    >
                      {showPreview ? 'Hide' : 'Show'} Full Preview
                      <motion.div
                        animate={{ rotate: showPreview ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showPreview && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 p-4 bg-white rounded-lg border text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto text-gray-800"
                        >
                          {generateRFQText()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Selected Suppliers Preview */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3">Selected Suppliers ({selectedSuppliers.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedSuppliers.map((supplier) => (
                        <div key={supplier.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                          <span className="text-sm text-gray-900 font-medium">{supplier.name}</span>
                          <span className="text-xs text-gray-600">📞 {supplier.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={sendToAllSuppliers}
                      disabled={sending}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                          />
                          Sending ({Math.round(sendProgress)}%)...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-6 h-6" />
                          Send to All {selectedSuppliers.length} Suppliers
                        </>
                      )}
                    </motion.button>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={copyToClipboard}
                        className="py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        Copy
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadRFQ}
                        className="py-3 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to Suppliers
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Cart */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl sticky top-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-purple-500" />
                  Your Cart
                </span>
                <Badge className="bg-purple-100 text-purple-700 border-0">
                  {cartItems.length} items
                </Badge>
              </h3>

              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No items added yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start selecting materials</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`bg-gradient-to-r ${item.categoryColor} text-white border-0 text-xs`}>
                              {item.categoryIcon} {item.category}
                            </Badge>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-700">{item.priceRange}</span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        placeholder="Add notes (optional)"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {cartItems.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2 text-gray-800">
                    <span className="text-gray-700">Total Items:</span>
                    <span className="font-bold">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-800">
                    <span className="text-gray-700">Total Quantity:</span>
                    <span className="font-bold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} units</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQComponent;
