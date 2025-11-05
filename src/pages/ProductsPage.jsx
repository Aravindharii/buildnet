import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, PlusCircle, Search, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      toast({ title: "Error fetching products", description: error.message, variant: "destructive" });
      setProducts([]);
    } else {
      setProducts(data);
      const uniqueCategories = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (selectedCategory === 'All') {
      setSubcategories([]);
      setSelectedSubcategory('All');
    } else {
      const relevantSubcategories = ['All', ...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory).filter(Boolean))];
      setSubcategories(relevantSubcategories);
      setSelectedSubcategory('All');
    }
  }, [selectedCategory, products]);

  useEffect(() => {
    let tempProducts = [...products];

    if (selectedCategory !== 'All') {
      tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    }
    
    if (selectedSubcategory !== 'All') {
      tempProducts = tempProducts.filter(p => p.subcategory === selectedSubcategory);
    }

    if (searchQuery) {
      tempProducts = tempProducts.filter(p => 
        (p.manufacturer && p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProducts(tempProducts);
  }, [selectedCategory, selectedSubcategory, searchQuery, products]);

  const handleListProduct = () => {
    toast({
      title: "🚧 Feature Coming Soon!",
      description: "You'll soon be able to list your products. Request this feature in your next prompt! 🚀",
    });
  };

  const handleAddToCatalogue = (productName) => {
    toast({
      title: `Added to Catalogue!`,
      description: `${productName} is ready to be added to your supplier profile.`,
    });
  };

  const ProductCard = ({ product, index }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ delay: index * 0.05 }}
      className="glass-effect rounded-2xl overflow-hidden group"
    >
      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={product.name} src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Package className="w-16 h-16 text-gray-400" />
            </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm text-blue-500 mb-1">{product.subcategory || 'General'}</p>
        <h3 className="text-lg font-bold text-gray-800 mb-2 h-12">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 h-10">{product.spec}</p>
        <p className="text-xs text-gray-500 mb-4">By: <span className="font-semibold">{product.manufacturer || 'N/A'}</span></p>
        <Button 
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
          onClick={() => handleAddToCatalogue(product.name)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Catalogue
        </Button>
      </div>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>Product Marketplace - Kerala Construction</title>
        <meta name="description" content="Browse construction products from leading manufacturers." />
      </Helmet>

      <div className="min-h-screen pb-20">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20 mb-4" >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Product Marketplace</h1>
                    <p className="text-orange-100">Find and list high-quality construction materials</p>
                </div>
                <Button onClick={handleListProduct} className="mt-4 md:mt-0 bg-white text-orange-600 hover:bg-gray-100 shadow-lg">
                    <Upload className="mr-2 h-4 w-4" />
                    List Your Product
                </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-8 sticky top-4 z-40 shadow-sm border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="search-company" className="text-sm font-medium text-gray-700">Search by Product/Company</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input id="search-company" type="text" placeholder="e.g., TATA Steel, Cement" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="category-filter" className="text-sm font-medium text-gray-700">Filter by Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter" className="w-full mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => ( <SelectItem key={category} value={category}>{category}</SelectItem> ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory-filter" className="text-sm font-medium text-gray-700">Filter by Subcategory</Label>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} disabled={subcategories.length === 0}>
                  <SelectTrigger id="subcategory-filter" className="w-full mt-1">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => ( <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem> ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
                 <div className="col-span-full text-center py-16">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-500">Loading products...</p>
                 </div>
            ) : filteredProducts.length > 0 ? (
                <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </AnimatePresence>
            ) : (
              <div className="col-span-full text-center py-16">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Products Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters. You can also add products via the Admin Dashboard.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

const AnimatePresence = ({ children }) => <>{children}</>;

export default ProductsPage;