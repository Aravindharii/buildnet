import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Edit, Save, LogOut, ArrowLeft, Mail, Key, User, FileText, ShoppingCart, Loader2, ChevronsUpDown, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

const ProfileManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data: profileData } = await supabase.from('user_profiles').select('business_id').eq('user_id', user.id).single();
    if (profileData?.business_id) {
      const { data: busData, error: busError } = await supabase.from('businesses').select('*').eq('id', profileData.business_id).single();
      if (busError) toast({ variant: "destructive", title: "Error", description: "Could not fetch business data." });
      else setBusinessData(busData);
    } else {
        setBusinessData(null); // No business linked
    }
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  const handleUpdateBusiness = async () => {
    if (!businessData) return;
    const { error } = await supabase.from('businesses').update(businessData).eq('id', businessData.id);
    if (error) toast({ variant: "destructive", title: "Update Failed", description: error.message });
    else { toast({ title: "Profile Updated", description: "Your business information has been saved." }); setIsEditing(false); }
  };
  
  const handleInputChange = (e) => setBusinessData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-8 w-8 text-emerald-500" /></div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-6">
      {businessData ? (
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-emerald-600 flex items-center"><Building className="mr-3" /> {businessData.name}</h2>
              <p className="text-gray-500">{Array.isArray(businessData.categories) ? businessData.categories.join(', ') : businessData.category}</p>
            </div>
            {!isEditing ? (<Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>) : 
              (<div className="flex space-x-2"><Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button><Button onClick={handleUpdateBusiness}><Save className="mr-2 h-4 w-4" /> Save</Button></div>)
            }
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label htmlFor="name">Business Name</Label><Input id="name" name="name" value={businessData.name} onChange={handleInputChange} disabled={!isEditing} /></div>
            <div><Label htmlFor="district">District</Label><Input id="district" name="district" value={businessData.district} onChange={handleInputChange} disabled={!isEditing} /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={businessData.phone || ''} onChange={handleInputChange} disabled={!isEditing} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" value={businessData.email || ''} onChange={handleInputChange} disabled={!isEditing} /></div>
            <div><Label htmlFor="website">Website</Label><Input id="website" name="website" value={businessData.website || ''} onChange={handleInputChange} disabled={!isEditing} /></div>
            <div><Label htmlFor="gst_number">GST Number</Label><Input id="gst_number" name="gst_number" value={businessData.gst_number || ''} onChange={handleInputChange} disabled={!isEditing} /></div>
            <div className="md:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" value={businessData.address || ''} onChange={handleInputChange} disabled={!isEditing} /></div>
            <div className="md:col-span-2"><Label htmlFor="map_location">Map Location URL</Label><Input id="map_location" name="map_location" value={businessData.map_location || ''} onChange={handleInputChange} disabled={!isEditing} /></div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">No Business Profile Linked</h2>
          <p className="text-gray-500 mt-2">Link your business profile by contacting an admin.</p>
        </div>
      )}
    </div>
  );
};

const RfqManager = () => {
  const [rfqs, setRfqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRfqs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rfqs')
        .select(`
          *,
          rfq_products (*),
          rfq_recipients ( businesses (name) )
        `)
        .order('created_at', { ascending: false });

      if (error) toast({ variant: "destructive", title: "Error", description: "Could not fetch RFQs." });
      else setRfqs(data);
      setIsLoading(false);
    };
    fetchRfqs();
  }, [toast]);
  
  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin h-8 w-8 text-emerald-500" /></div>;

  return (
    <div className="space-y-6 mt-6">
      {rfqs.length > 0 ? rfqs.map(rfq => (
        <div key={rfq.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{rfq.project_name}</h3>
          <p className="text-sm text-gray-400 mb-4">On {new Date(rfq.created_at).toLocaleDateString()}</p>
          <p className="text-gray-600 mb-4">{rfq.description}</p>
          <div>
              <h4 className="font-semibold text-gray-700 mb-2">Products:</h4>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                  {rfq.rfq_products.map(p => <li key={p.id}>{p.description} ({p.quantity})</li>)}
              </ul>
          </div>
          <div>
              <h4 className="font-semibold text-gray-700 mb-2">Recipients ({rfq.rfq_recipients.length}):</h4>
              <div className="flex flex-wrap gap-2">
                  {rfq.rfq_recipients.map(r => <Badge key={r.businesses.name} variant="secondary">{r.businesses.name}</Badge>)}
              </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-16 bg-white rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No RFQs Found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't created any RFQs yet.</p>
        </div>
      )}
    </div>
  );
};

const PurchaseOrderManager = () => (
    <div className="text-center py-16 bg-white rounded-lg mt-6">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Purchase Orders Found</h3>
        <p className="mt-1 text-sm text-gray-500">This feature is coming soon!</p>
    </div>
);

const DashboardPage = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/account');
    }
  }, [user, loading, navigate]);
  
  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'You have been successfully signed out.' });
    navigate('/');
  };
  
  if (loading || !user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading dashboard...</p></div>;
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard - BuildNet</title>
        <meta name="description" content="Manage your BuildNet profile, RFQs, and purchase orders." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">My Dashboard</h1>
              <p className="text-gray-500">Welcome, {user.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline"><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
          </div>

          <Tabs defaultValue="rfqs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rfqs"><FileText className="mr-2 h-4 w-4" />My RFQs</TabsTrigger>
              <TabsTrigger value="pos"><ShoppingCart className="mr-2 h-4 w-4" />My Purchase Orders</TabsTrigger>
              <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />My Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="rfqs"><RfqManager /></TabsContent>
            <TabsContent value="pos"><PurchaseOrderManager /></TabsContent>
            <TabsContent value="profile"><ProfileManager /></TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;