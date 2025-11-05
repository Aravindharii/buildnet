
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusCircle, Trash2, Edit, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MultiSelect } from '@/components/ui/multi-select';
import ImportSheetModal from '@/components/ImportSheetModal';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Business State
  const [businessName, setBusinessName] = useState('');
  const [businessCategories, setBusinessCategories] = useState([]);
  const [businessDistrict, setBusinessDistrict] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessMapLocation, setBusinessMapLocation] = useState('');
  const [businessGst, setBusinessGst] = useState('');
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [editingBusinessId, setEditingBusinessId] = useState(null);

  // Site State
  const [siteName, setSiteName] = useState('');
  const [siteDistrict, setSiteDistrict] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteMapLocation, setSiteMapLocation] = useState('');
  const [siteStatus, setSiteStatus] = useState('');
  const [isEditingSite, setIsEditingSite] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState(null);

  // AI Knowledge State
  const [aiKnowledgeTitle, setAiKnowledgeTitle] = useState('');
  const [aiKnowledgeContent, setAiKnowledgeContent] = useState('');
  const [aiKnowledgeSource, setAiKnowledgeSource] = useState('');
  const [isEditingKnowledge, setIsEditingKnowledge] = useState(false);
  const [editingKnowledgeId, setEditingKnowledgeId] = useState(null);

  // Data & Loading State
  const [existingBusinesses, setExistingBusinesses] = useState([]);
  const [existingSites, setExistingSites] = useState([]);
  const [existingKnowledge, setExistingKnowledge] = useState([]);
  const [loading, setLoading] = useState({ businesses: true, sites: true, knowledge: true });

  // Dialog State
  const [dialogState, setDialogState] = useState({ type: null, id: null, open: false });

  const ALL_CATEGORIES = useMemo(() => [
    'Cement Dealers', 'Bulk Cement', 'Ready-Mix Concrete (RMC)', 'TMT Dealers', 'Structural Steel', 'Cut & Bend Facilities', 'JCB/Excavators', 'Transit Mixers', 'Concrete Pumps', 'Tower Cranes', 'Aggregates & Crushers', 'M-Sand/P-Sand', 'Bricks/Blocks', 'Chemicals', 'Civil (GC/Sub)', 'MEP', 'Interiors', 'Waterproofing', 'Piling', 'Roads', 'Architects', 'Structural', 'PMC', 'QS/Estimators', 'Interior Designers', 'Elevators/Lifts', 'Furniture', 'Aluminium/Glass', 'Tiles/Sanitaryware', 'ERP/Estimating/BIM', 'AI Tools', 'IoT', 'IT Services', 'HR/Manpower'
  ].map(cat => ({ value: cat, label: cat })), []);

  const districts = useMemo(() => [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ], []);

  const siteStatuses = useMemo(() => ['Planned', 'Ongoing', 'Completed', 'On Hold'], []);

  const fetchData = async (table, setter, loadingKey) => {
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      toast({ title: 'Error!', description: `Failed to fetch ${loadingKey}: ${error.message}`, variant: 'destructive' });
    } else {
      setter(data);
    }
    setLoading(prev => ({ ...prev, [loadingKey]: false }));
  };
  
  const refreshAllData = () => {
    fetchData('businesses', setExistingBusinesses, 'businesses');
    fetchData('sites', setExistingSites, 'sites');
    fetchData('ai_knowledge_base', setExistingKnowledge, 'knowledge');
  };

  useEffect(() => {
    refreshAllData();
  }, [toast]);

  const clearBusinessForm = () => {
    setBusinessName(''); setBusinessCategories([]); setBusinessDistrict(''); setBusinessPhone(''); setBusinessEmail(''); setBusinessWebsite(''); setBusinessAddress(''); setBusinessMapLocation(''); setBusinessGst('');
    setIsEditingBusiness(false); setEditingBusinessId(null);
  };

  const clearSiteForm = () => {
    setSiteName(''); setSiteDistrict(''); setSiteAddress(''); setSiteMapLocation(''); setSiteStatus('');
    setIsEditingSite(false); setEditingSiteId(null);
  };

  const clearKnowledgeForm = () => {
    setAiKnowledgeTitle(''); setAiKnowledgeContent(''); setAiKnowledgeSource('');
    setIsEditingKnowledge(false); setEditingKnowledgeId(null);
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast({ title: 'Authentication Required', description: 'You must be logged in.', variant: 'destructive' }); return; }

    const businessData = {
      name: businessName,
      categories: businessCategories,
      category: businessCategories[0] || 'General', // Keep first category for compatibility
      district: businessDistrict,
      phone: businessPhone,
      email: businessEmail,
      website: businessWebsite,
      address: businessAddress,
      map_location: businessMapLocation,
      gst_number: businessGst,
    };

    const { error } = isEditingBusiness
      ? await supabase.from('businesses').update(businessData).eq('id', editingBusinessId)
      : await supabase.from('businesses').insert([businessData]);

    if (error) {
      toast({ title: 'Error!', description: `Failed to ${isEditingBusiness ? 'update' : 'add'} business: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Success!', description: `Business ${isEditingBusiness ? 'updated' : 'added'} successfully!` });
      clearBusinessForm();
      fetchData('businesses', setExistingBusinesses, 'businesses');
    }
  };

  const handleEditBusiness = (business) => {
    setBusinessName(business.name);
    setBusinessCategories(business.categories || (business.category ? [business.category] : []));
    setBusinessDistrict(business.district);
    setBusinessPhone(business.phone);
    setBusinessEmail(business.email);
    setBusinessWebsite(business.website);
    setBusinessAddress(business.address);
    setBusinessMapLocation(business.map_location || '');
    setBusinessGst(business.gst_number || '');
    setIsEditingBusiness(true);
    setEditingBusinessId(business.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSiteSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast({ title: 'Authentication Required', description: 'You must be logged in.', variant: 'destructive' }); return; }

    const siteData = { name: siteName, district: siteDistrict, address: siteAddress, map_location: siteMapLocation, status: siteStatus };
    const { error } = isEditingSite
      ? await supabase.from('sites').update(siteData).eq('id', editingSiteId)
      : await supabase.from('sites').insert([siteData]);

    if (error) {
      toast({ title: 'Error!', description: `Failed to ${isEditingSite ? 'update' : 'add'} site: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Success!', description: `Site ${isEditingSite ? 'updated' : 'added'} successfully!` });
      clearSiteForm();
      fetchData('sites', setExistingSites, 'sites');
    }
  };

  const handleEditSite = (site) => {
    setSiteName(site.name);
    setSiteDistrict(site.district);
    setSiteAddress(site.address || '');
    setSiteMapLocation(site.map_location || '');
    setSiteStatus(site.status || '');
    setIsEditingSite(true);
    setEditingSiteId(site.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKnowledgeSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast({ title: 'Authentication Required', description: 'You must be logged in.', variant: 'destructive' }); return; }

    const knowledgeData = { title: aiKnowledgeTitle, content: aiKnowledgeContent, source_type: aiKnowledgeSource };
    const { error } = isEditingKnowledge
      ? await supabase.from('ai_knowledge_base').update(knowledgeData).eq('id', editingKnowledgeId)
      : await supabase.from('ai_knowledge_base').insert([knowledgeData]);

    if (error) {
      toast({ title: 'Error!', description: `Failed to ${isEditingKnowledge ? 'update' : 'add'} knowledge: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Success!', description: `Knowledge ${isEditingKnowledge ? 'updated' : 'added'} successfully!` });
      clearKnowledgeForm();
      fetchData('ai_knowledge_base', setExistingKnowledge, 'knowledge');
    }
  };

  const handleEditKnowledge = (knowledge) => {
    setAiKnowledgeTitle(knowledge.title);
    setAiKnowledgeContent(knowledge.content);
    setAiKnowledgeSource(knowledge.source_type);
    setIsEditingKnowledge(true);
    setEditingKnowledgeId(knowledge.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteDialog = (type, id) => setDialogState({ type, id, open: true });

  const executeDelete = async () => {
    const { type, id } = dialogState;
    if (!id || !type) return;

    const tableMap = { business: 'businesses', site: 'sites', knowledge: 'ai_knowledge_base' };
    const table = tableMap[type];
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      toast({ title: 'Error!', description: `Failed to delete ${type}: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Success!', description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!` });
      if (type === 'business') fetchData('businesses', setExistingBusinesses, 'businesses');
      if (type === 'site') fetchData('sites', setExistingSites, 'sites');
      if (type === 'knowledge') fetchData('ai_knowledge_base', setExistingKnowledge, 'knowledge');
    }
    setDialogState({ type: null, id: null, open: false });
  };

  const renderList = (items, loading, type, onEdit, onDelete) => {
    if (loading) return <div className="text-center py-4 text-gray-600">Loading...</div>;
    if (items.length === 0) return <div className="text-center py-4 text-gray-500">No entries yet.</div>;
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-800">{item.name || item.title}</p>
              <p className="text-sm text-gray-600">{Array.isArray(item.categories) ? item.categories.join(', ') : (item.category || item.district || item.source_type || '')}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}><Edit className="h-4 w-4" /></Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(type, item.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Manage Content</title>
        <meta name="description" content="Admin dashboard to manage businesses, sites, and AI knowledge base." />
      </Helmet>
      
      <ImportSheetModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} onImportSuccess={refreshAllData} />

      <div className="min-h-screen pb-20 bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-8 px-4 sticky top-0 z-40 shadow-xl">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Button>
                <Button onClick={() => setIsImportModalOpen(true)} className="bg-white text-emerald-600 hover:bg-gray-100">
                    <Upload className="mr-2 h-4 w-4" /> Import from CSV
                </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">Admin Dashboard</h1>
            <p className="text-emerald-100">Manage Businesses, Sites, and AI Knowledge Base</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
          {/* Business Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Business Management</h2>
            <form onSubmit={handleBusinessSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div><Label htmlFor="businessName" className="text-gray-700">Business Name</Label><Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Enter business name" required className="mt-1" /></div>
              <div><Label htmlFor="businessCategories" className="text-gray-700">Categories</Label><MultiSelect options={ALL_CATEGORIES} selected={businessCategories} onChange={setBusinessCategories} className="mt-1 bg-white" /></div>
              <div><Label htmlFor="businessDistrict" className="text-gray-700">District</Label><Select value={businessDistrict} onValueChange={setBusinessDistrict} required><SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Select District" /></SelectTrigger><SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="businessPhone" className="text-gray-700">Phone</Label><Input id="businessPhone" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="Enter phone number" className="mt-1" /></div>
              <div><Label htmlFor="businessEmail" className="text-gray-700">Email</Label><Input id="businessEmail" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="Enter email address" className="mt-1" /></div>
              <div><Label htmlFor="businessWebsite" className="text-gray-700">Website</Label><Input id="businessWebsite" value={businessWebsite} onChange={(e) => setBusinessWebsite(e.target.value)} placeholder="Enter website URL" className="mt-1" /></div>
              <div className="md:col-span-2"><Label htmlFor="businessAddress" className="text-gray-700">Address</Label><Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Enter full address" className="mt-1" /></div>
              <div className="md:col-span-2"><Label htmlFor="businessMapLocation" className="text-gray-700">Map Location URL</Label><Input id="businessMapLocation" value={businessMapLocation} onChange={(e) => setBusinessMapLocation(e.target.value)} placeholder="Enter Google Maps URL" className="mt-1" /></div>
              <div className="md:col-span-2"><Label htmlFor="businessGst" className="text-gray-700">GST Number (Optional)</Label><Input id="businessGst" value={businessGst} onChange={(e) => setBusinessGst(e.target.value)} placeholder="Enter GST Number" className="mt-1" /></div>
              <div className="md:col-span-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={clearBusinessForm}>Cancel</Button><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">{isEditingBusiness ? <><Edit className="mr-2 h-4 w-4" /> Update Business</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Business</>}</Button></div>
            </form>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Existing Businesses</h3>
            {renderList(existingBusinesses, loading.businesses, 'business', handleEditBusiness, openDeleteDialog)}
          </motion.div>

          {/* Site Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Site Management</h2>
            <form onSubmit={handleSiteSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div><Label htmlFor="siteName" className="text-gray-700">Site Name</Label><Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Enter site name" required className="mt-1" /></div>
              <div><Label htmlFor="siteDistrict" className="text-gray-700">District</Label><Select value={siteDistrict} onValueChange={setSiteDistrict} required><SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Select District" /></SelectTrigger><SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="md:col-span-2"><Label htmlFor="siteAddress" className="text-gray-700">Address</Label><Input id="siteAddress" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} placeholder="Enter full address" className="mt-1" /></div>
              <div className="md:col-span-2"><Label htmlFor="siteMapLocation" className="text-gray-700">Map Location URL</Label><Input id="siteMapLocation" value={siteMapLocation} onChange={(e) => setSiteMapLocation(e.target.value)} placeholder="Enter Google Maps URL" className="mt-1" /></div>
              <div className="md:col-span-2"><Label htmlFor="siteStatus" className="text-gray-700">Status</Label><Select value={siteStatus} onValueChange={setSiteStatus}><SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent>{siteStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="md:col-span-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={clearSiteForm}>Cancel</Button><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">{isEditingSite ? <><Edit className="mr-2 h-4 w-4" /> Update Site</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Site</>}</Button></div>
            </form>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Existing Sites</h3>
            {renderList(existingSites, loading.sites, 'site', handleEditSite, openDeleteDialog)}
          </motion.div>

          {/* AI Knowledge Base Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Knowledge Base Management</h2>
            <form onSubmit={handleKnowledgeSubmit} className="space-y-4 mb-8">
              <div><Label htmlFor="aiKnowledgeTitle" className="text-gray-700">Title</Label><Input id="aiKnowledgeTitle" value={aiKnowledgeTitle} onChange={(e) => setAiKnowledgeTitle(e.target.value)} placeholder="Enter knowledge title" required className="mt-1" /></div>
              <div><Label htmlFor="aiKnowledgeContent" className="text-gray-700">Content</Label><Input id="aiKnowledgeContent" value={aiKnowledgeContent} onChange={(e) => setAiKnowledgeContent(e.target.value)} placeholder="Enter knowledge content" required className="mt-1" /></div>
              <div><Label htmlFor="aiKnowledgeSource" className="text-gray-700">Source Type</Label><Input id="aiKnowledgeSource" value={aiKnowledgeSource} onChange={(e) => setAiKnowledgeSource(e.target.value)} placeholder="e.g., Document, Website" className="mt-1" /></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={clearKnowledgeForm}>Cancel</Button><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">{isEditingKnowledge ? <><Edit className="mr-2 h-4 w-4" /> Update Knowledge</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Knowledge</>}</Button></div>
            </form>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Existing AI Knowledge Entries</h3>
            {renderList(existingKnowledge, loading.knowledge, 'knowledge', handleEditKnowledge, openDeleteDialog)}
          </motion.div>
        </div>
      </div>

      <AlertDialog open={dialogState.open} onOpenChange={(open) => setDialogState({ ...dialogState, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the {dialogState.type} entry.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminPage;
