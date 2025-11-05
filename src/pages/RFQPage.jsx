import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, Users, PlusCircle, Trash2, Bot, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const RFQPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [products, setProducts] = useState([{ description: '', quantity: '' }]);
  const [formData, setFormData] = useState({ projectName: '', description: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to create an RFQ.",
        variant: "destructive"
      });
      navigate('/account');
    }

    const fetchBusinesses = async () => {
      const { data, error } = await supabase.from('businesses').select('*');
      if (error) {
        toast({ title: 'Error fetching contacts', description: error.message, variant: 'destructive' });
      } else {
        setAllContacts(data);
        setFilteredContacts(data);
        const uniqueCategories = ['All', ...new Set(data.flatMap(c => c.categories || (c.category ? [c.category] : [])))];
        setCategories(uniqueCategories);
      }
    };
    fetchBusinesses();
  }, [user, navigate, toast]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredContacts(allContacts);
    } else {
      setFilteredContacts(allContacts.filter(contact => (contact.categories || [contact.category]).includes(selectedCategory)));
    }
    setSelectedContacts([]);
  }, [selectedCategory, allContacts]);

  const handleContactToggle = (contactId) => {
    setSelectedContacts(prev => prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProductRow = () => setProducts([...products, { description: '', quantity: '' }]);
  const removeProductRow = (index) => setProducts(products.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast({ title: "Not logged in", description: "You must be logged in.", variant: "destructive" }); return; }
    if (selectedContacts.length === 0) { toast({ title: "No contacts selected", description: "Please select at least one contact to send the RFQ.", variant: "destructive" }); return; }
    if (products.some(p => !p.description.trim() || !p.quantity.trim())) { toast({ title: "Incomplete Product Details", description: "Please fill out all product descriptions and quantities.", variant: "destructive" }); return; }

    setIsSubmitting(true);

    // 1. Insert RFQ
    const { data: rfqData, error: rfqError } = await supabase.from('rfqs').insert({
      user_id: user.id,
      project_name: formData.projectName,
      description: formData.description,
      location: formData.location
    }).select().single();

    if (rfqError) {
      toast({ title: 'Error creating RFQ', description: rfqError.message, variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const rfqId = rfqData.id;

    // 2. Insert Products
    const productsToInsert = products.map(p => ({ ...p, rfq_id: rfqId }));
    const { error: productsError } = await supabase.from('rfq_products').insert(productsToInsert);
    if (productsError) { toast({ title: 'Error saving products', description: productsError.message, variant: 'destructive' }); setIsSubmitting(false); return; }

    // 3. Insert Recipients
    const recipientsToInsert = selectedContacts.map(contactId => ({ rfq_id: rfqId, business_id: contactId }));
    const { error: recipientsError } = await supabase.from('rfq_recipients').insert(recipientsToInsert);
    if (recipientsError) { toast({ title: 'Error saving recipients', description: recipientsError.message, variant: 'destructive' }); setIsSubmitting(false); return; }

    toast({ title: "RFQ Sent Successfully! 🎉", description: `Your request has been saved and can be viewed in your dashboard.` });
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Request for Quotation - BuildNet</title>
        <meta name="description" content="Send project requirements to multiple construction professionals at once." />
      </Helmet>
      <div className="min-h-screen pb-20 bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20 mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Request for Quotation</h1>
            <p className="text-blue-100">Send your project requirements to selected suppliers</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 mt-6">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="glass-effect rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 gradient-text">1. Project & Product Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div><Label htmlFor="projectName">Project Name *</Label><Input id="projectName" value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="e.g., Residential Building Construction" required className="mt-2" /></div>
                <div><Label htmlFor="description">Project Description *</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project requirements in detail..." required rows={4} className="mt-2" /></div>
                <div><Label htmlFor="location">Location *</Label><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Kochi, Ernakulam" required className="mt-2" /></div>

                <div className="space-y-4 pt-4">
                  <Label>Products / Materials</Label>
                  <div className="space-y-3">
                    {products.map((product, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={product.description} onChange={(e) => handleProductChange(index, 'description', e.target.value)} placeholder={`Product ${index + 1} Description`} className="flex-grow" />
                        <Input value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} placeholder="Qty" className="w-24" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProductRow(index)} disabled={products.length === 1}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addProductRow} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Add Product</Button>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 text-lg" disabled={selectedContacts.length === 0 || isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                  {isSubmitting ? 'Submitting...' : `Send RFQ to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass-effect rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">2. Select Recipients</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="h-4 w-4" />{selectedContacts.length} selected</div>
              </div>
              <div className="mb-4">
                <Label htmlFor="category-filter">Filter by Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger id="category-filter" className="w-full mt-2"><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{categories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent></Select>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredContacts.length > 0 ? filteredContacts.slice(0, 50).map((contact) => (
                  <motion.div key={contact.id} whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedContacts.includes(contact.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => handleContactToggle(contact.id)}>
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedContacts.includes(contact.id)} onCheckedChange={() => handleContactToggle(contact.id)} className="mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{contact.name}</div>
                        <div className="text-sm text-gray-600">{Array.isArray(contact.categories) ? contact.categories.join(', ') : contact.category}</div>
                        <div className="text-xs text-gray-500 mt-1">{contact.district}</div>
                      </div>
                      {selectedContacts.includes(contact.id) && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    </div>
                  </motion.div>
                )) : <p className="text-center text-gray-500 mt-8">No contacts found for this category.</p>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RFQPage;