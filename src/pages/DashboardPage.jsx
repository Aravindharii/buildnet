// pages/DashboardPage.jsx - COMPLETE CORRECTED CODE

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Edit, Save, LogOut, User, FileText, ShoppingCart, Mail, Phone, MapPin, Globe ,ArrowRight} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

const ProfileManager = () => {
  const { user, linkedBusiness, refreshBusinessProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    phone: '',
    website: '',
    address: '',
    map_location: '',
  });

  useEffect(() => {
    if (linkedBusiness) {
      setEditableData({
        phone: linkedBusiness.phone || '',
        website: linkedBusiness.website || '',
        address: linkedBusiness.address || '',
        map_location: linkedBusiness.map_location || '',
      });
    }
  }, [linkedBusiness]);

  const handleInputChange = (e) => {
    setEditableData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    // TODO: Implement Google Sheets update via Apps Script
    // For now, just show success message
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved (Google Sheets update pending implementation).',
    });
    
    setIsEditing(false);
    
    // Refresh the profile from Google Sheets
    await refreshBusinessProfile();
  };

  if (!linkedBusiness) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-6">
        <div className="text-center py-10">
          <Building className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No Business Profile Found</h2>
          <p className="text-gray-500 mt-2">
            Your email ({user?.email}) is not linked to any business in our directory.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Please contact administrator to add your business.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-emerald-600 flex items-center">
            <Building className="mr-3" size={32} />
            {linkedBusiness.name}
          </h2>
          <p className="text-gray-500 mt-1">{linkedBusiness.category}</p>
          <Badge variant="outline" className="mt-2">
            ✅ Verified in Directory
          </Badge>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Editable Fields */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phone" className="flex items-center">
              <Phone className="mr-2 h-4 w-4" /> Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              value={editableData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="website" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" /> Website
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={editableData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" /> Address
          </Label>
          <Input
            id="address"
            name="address"
            value={editableData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter business address"
          />
        </div>

        <div>
          <Label htmlFor="map_location">Map Location URL</Label>
          <Input
            id="map_location"
            name="map_location"
            type="url"
            value={editableData.map_location}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Google Maps link"
          />
        </div>
      </div>

      {/* Read-only Information */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Read-Only Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Email:</span>
            <p className="text-gray-800">{linkedBusiness.email}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">District:</span>
            <p className="text-gray-800">{linkedBusiness.district}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">State:</span>
            <p className="text-gray-800">{linkedBusiness.state}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">GST Number:</span>
            <p className="text-gray-800">{linkedBusiness.gst_number || 'Not provided'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          ℹ️ To change these fields, please contact the administrator.
        </p>
      </div>
    </div>
  );
};

const RfqManager = () => {
  return (
    <div className="text-center py-16 bg-white rounded-lg mt-6">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No RFQs Found</h3>
      <p className="mt-1 text-sm text-gray-500">You haven't created any RFQs yet.</p>
      <Button className="mt-4">Create New RFQ</Button>
    </div>
  );
};

const PurchaseOrderManager = () => {
  return (
    <div className="text-center py-16 bg-white rounded-lg mt-6">
      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No Purchase Orders Found</h3>
      <p className="mt-1 text-sm text-gray-500">This feature is coming soon!</p>
    </div>
  );
};

const NoBusinessProfile = ({ user, onNavigateToComplete }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-6">
      <div className="text-center py-10">
        <Building className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Business Profile Found</h2>
        <p className="text-gray-500 mt-2 mb-1">
          Your email ({user?.email}) is not linked to any business in our directory.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Link your business profile to access your dashboard features.
        </p>
        <Button 
          onClick={onNavigateToComplete}
          className="bg-emerald-600 hover:bg-emerald-700 mt-4"
          size="lg"
        >
          Complete Your Profile
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, linkedBusiness, hasCompletedProfile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/account');
    }
    // ✅ REMOVED: redirect to complete-profile (let user click button instead)
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await logout();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.'
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard - BuildNet</title>
        <meta name="description" content="Manage your BuildNet profile, RFQs, and purchase orders." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-800">My Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Welcome, {user.email} 
                {user.emailVerified && (
                  <Badge className="ml-2" variant="outline">✅ Verified</Badge>
                )}
              </p>
            </div>
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </motion.div>

          {/* ✅ Show Complete Profile button if no business linked */}
          {!linkedBusiness ? (
            <NoBusinessProfile 
              user={user} 
              onNavigateToComplete={() => navigate('/complete-profile')}
            />
          ) : (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />My Profile
                </TabsTrigger>
                <TabsTrigger value="rfqs">
                  <FileText className="mr-2 h-4 w-4" />My RFQs
                </TabsTrigger>
                <TabsTrigger value="pos">
                  <ShoppingCart className="mr-2 h-4 w-4" />Purchase Orders
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileManager />
              </TabsContent>
              
              <TabsContent value="rfqs">
                <RfqManager />
              </TabsContent>
              
              <TabsContent value="pos">
                <PurchaseOrderManager />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
};


export default DashboardPage;
