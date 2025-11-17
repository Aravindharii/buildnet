// pages/CompleteProfilePage.jsx - OPTIMIZED FINAL VERSION

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Search, CheckCircle, AlertCircle, Loader2, ArrowLeft, LogOut, 
  Phone, Mail, MapPin, Globe, Edit2, Save, X, FileText 
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizePhone, formatPhoneDisplay, isValidPhone } from '@/lib/phoneUtils';
import { updateBusinessInSheet } from '@/lib/GoogleSheetsUpdateService';

const CompleteProfilePage = () => {
  const { user, linkedBusiness, linkBusinessProfile, hasCompletedProfile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [activeTab, setActiveTab] = useState('email');
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FIX: Don't auto-redirect if profile completed - allow editing first
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/account');
      return;
    }
    
    // Removed hasCompletedProfile redirect - users can edit before confirming
    setSearchEmail(user.email || '');
  }, [user, navigate, loading]);

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setSearchPhone(formatted);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    const searchValue = activeTab === 'email' ? searchEmail : searchPhone;
    
    if (!searchValue) {
      toast({
        title: 'Missing Information',
        description: `Please enter your business ${activeTab}`,
        variant: 'destructive'
      });
      return;
    }

    if (activeTab === 'phone') {
      const cleanPhone = normalizePhone(searchPhone);
      if (!isValidPhone(cleanPhone, 10)) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid 10-digit phone number',
          variant: 'destructive'
        });
        return;
      }
    }

    setSearching(true);
    setSearchResult(null);

    const result = await linkBusinessProfile({
      email: activeTab === 'email' ? searchEmail : '',
      phone: activeTab === 'phone' ? normalizePhone(searchPhone) : ''
    });

    setSearching(false);

    if (result.success) {
      setSearchResult(result.business);
      setEditedData({
        phone: result.business.phone || '',
        email: result.business.email || '',
        website: result.business.website || '',
        address: result.business.address || '',
        map_location: result.business.map_location || '',
        gst_number: result.business.gst_number || '',
      });
      toast({
        title: 'Business Found!',
        description: `Matched with ${result.business.name || result.business.business_name}`
      });
    } else {
      toast({
        title: 'No Match Found',
        description: activeTab === 'email' 
          ? 'No business found with this email. Try searching with your phone number.'
          : 'No business found with this phone number. Try searching with your email.',
        variant: 'destructive'
      });
    }
  };

  const handleEditChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

 // CompleteProfilePage.jsx - handleSaveChanges

const handleSaveChanges = async () => {
  console.log('🔴 === SAVE BUTTON CLICKED ===');
  
  if (!searchResult || !editedData) {
    console.error('❌ Missing data');
    alert('Error: Missing data');
    return;
  }

  setIsSaving(true);
  
  toast({
    title: '💾 Saving...',
    description: 'Updating Google Sheets',
    duration: 30000
  });
  
  try {
    // ✅ Send both email AND phone - Apps Script will use whichever is available
    const updateData = {
      email: editedData.email || searchResult.email || '', // Can be empty
      phone: editedData.phone || searchResult.phone || '', // Primary search key
      website: editedData.website || '',
      address: editedData.address || '',
      map_location: editedData.map_location || '',
      gst_number: editedData.gst_number || ''
    };
    
    console.log('📤 Data to send:', updateData);
    
    // Validate we have at least email OR phone
    if (!updateData.email && !updateData.phone) {
      alert('Error: Need either email or phone number to update');
      setIsSaving(false);
      return;
    }
    
    const result = await updateBusinessInSheet(updateData);
    
    console.log('📥 Result received:', result);
    
    if (result.success) {
      setSearchResult(prev => ({ ...prev, ...editedData }));
      setIsEditing(false);
      
      toast({
        title: '✅ Saved!',
        description: 'Google Sheets updated successfully',
        className: 'bg-green-50 border-green-200'
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error || 'Could not update Google Sheets',
        variant: 'destructive'
      });
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
    toast({
      title: '❌ Error',
      description: error.message,
      variant: 'destructive'
    });
  } finally {
    setIsSaving(false);
  }
};

  const handleConfirmLink = () => {
    toast({
      title: 'Profile Linked!',
      description: 'Your account is now linked to your business'
    });
    navigate('/dashboard');
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Complete Your Profile - BuildNet</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="hover:bg-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-3xl flex items-center">
                  <Building className="mr-3" size={36} />
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-emerald-50">
                  Find and link your business to access the dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-900 font-medium">
                        Logged in as: <span className="font-bold">{user.email}</span>
                      </p>
                    </div>
                    {user.emailVerified && <Badge className="bg-green-500">✅ Verified</Badge>}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!searchResult && (
                    <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100">
                          <TabsTrigger value="email" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                            <Mail className="mr-2 h-4 w-4" />
                            Search by Email
                          </TabsTrigger>
                          <TabsTrigger value="phone" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                            <Phone className="mr-2 h-4 w-4" />
                            Search by Phone
                          </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSearch} className="mt-6 space-y-4">
                          <TabsContent value="email" className="mt-0 space-y-4">
                            <div>
                              <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                                Business Email Address
                              </Label>
                              <div className="relative mt-2">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="business@example.com"
                                  value={searchEmail}
                                  onChange={(e) => setSearchEmail(e.target.value)}
                                  className="pl-10 h-12 text-base"
                                  disabled={searching}
                                />
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="phone" className="mt-0 space-y-4">
                            <div>
                              <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
                                Business Phone Number
                              </Label>
                              <div className="relative mt-2">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder="98765 43210"
                                  value={searchPhone}
                                  onChange={handlePhoneChange}
                                  className="pl-10 h-12 text-base"
                                  maxLength={12}
                                  disabled={searching}
                                />
                              </div>
                            </div>
                          </TabsContent>

                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700"
                            disabled={searching}
                          >
                            {searching ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Searching Directory...
                              </>
                            ) : (
                              <>
                                <Search className="mr-2 h-5 w-5" />
                                Find My Business
                              </>
                            )}
                          </Button>
                        </form>
                      </Tabs>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {searchResult && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-green-900 text-lg">Business Found!</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Review and edit your information below.
                          </p>
                        </div>
                      </div>

                      <Card className="border-2 border-emerald-200 shadow-lg">
                        <CardHeader className="bg-emerald-50 border-b">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-2xl text-gray-900">
                                {searchResult.name || searchResult.business_name}
                              </CardTitle>
                              <p className="text-gray-600 mt-1">{searchResult.category}</p>
                              <Badge variant="outline" className="mt-2">
                                📍 {searchResult.district}, {searchResult.state}
                              </Badge>
                            </div>
                            <Button
                              variant={isEditing ? "destructive" : "outline"}
                              onClick={() => {
                                if (isEditing) {
                                  setEditedData({
                                    phone: searchResult.phone || '',
                                    email: searchResult.email || '',
                                    website: searchResult.website || '',
                                    address: searchResult.address || '',
                                    map_location: searchResult.map_location || '',
                                    gst_number: searchResult.gst_number || '',
                                  });
                                }
                                setIsEditing(!isEditing);
                              }}
                              className="min-w-[100px]"
                              disabled={isSaving}
                            >
                              {isEditing ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Info
                                </>
                              )}
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                                  Email
                                </Label>
                                {isEditing ? (
                                  <Input
                                    type="email"
                                    value={editedData.email}
                                    onChange={(e) => handleEditChange('email', e.target.value)}
                                    className="h-10"
                                  />
                                ) : (
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                                    {searchResult.email || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                  Phone
                                </Label>
                                {isEditing ? (
                                  <Input
                                    type="tel"
                                    value={editedData.phone}
                                    onChange={(e) => handleEditChange('phone', e.target.value)}
                                    className="h-10"
                                  />
                                ) : (
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                                    {searchResult.phone || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                  <Globe className="mr-2 h-4 w-4 text-gray-500" />
                                  Website
                                </Label>
                                {isEditing ? (
                                  <Input
                                    type="url"
                                    value={editedData.website}
                                    onChange={(e) => handleEditChange('website', e.target.value)}
                                    placeholder="https://example.com"
                                    className="h-10"
                                  />
                                ) : (
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                                    {searchResult.website || 'Not provided'}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                  <FileText className="mr-2 h-4 w-4 text-gray-500" />
                                  GST Number
                                </Label>
                                {isEditing ? (
                                  <Input
                                    value={editedData.gst_number}
                                    onChange={(e) => handleEditChange('gst_number', e.target.value)}
                                    placeholder="22AAAAA0000A1Z5"
                                    className="h-10"
                                  />
                                ) : (
                                  <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                                    {searchResult.gst_number || 'Not provided'}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                Address
                              </Label>
                              {isEditing ? (
                                <Textarea
                                  value={editedData.address}
                                  onChange={(e) => handleEditChange('address', e.target.value)}
                                  rows={3}
                                />
                              ) : (
                                <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                                  {searchResult.address || 'Not provided'}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                Maps Link
                              </Label>
                              {isEditing ? (
                                <Input
                                  type="url"
                                  value={editedData.map_location}
                                  onChange={(e) => handleEditChange('map_location', e.target.value)}
                                  placeholder="https://maps.google.com/..."
                                  className="h-10"
                                />
                              ) : (
                                <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                                  {searchResult.map_location ? (
                                    <a 
                                      href={searchResult.map_location} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-emerald-600 hover:underline"
                                    >
                                      View on Google Maps →
                                    </a>
                                  ) : (
                                    'Not provided'
                                  )}
                                </p>
                              )}
                            </div>

                            {isEditing && (
                              <Button
                                onClick={handleSaveChanges}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving to Google Sheets...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-5 w-5" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {!isEditing && (
                        <div className="flex gap-3">
                          <Button 
                            onClick={handleConfirmLink}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 text-base shadow-lg"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Confirm & Go to Dashboard
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSearchResult(null);
                              setIsEditing(false);
                            }}
                            className="h-12 px-6"
                          >
                            Search Again
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!searchResult && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">Can't find your business?</p>
                        <p>
                          Contact us at{' '}
                          <a href="mailto:support@buildnet.com" className="text-emerald-600 hover:underline font-medium">
                            support@buildnet.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CompleteProfilePage;
