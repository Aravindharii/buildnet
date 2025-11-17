// pages/EditProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

const EditProfilePage = () => {
  const { user, businessProfile, loading, refreshPermissions } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    website: '',
    address: '',
    area: '',
    pincode: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: ''
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/account');
      return;
    }
    
    if (!loading && !businessProfile) {
      toast({
        title: 'No Profile Found',
        description: 'Your email is not associated with any business profile.',
        variant: 'destructive'
      });
      navigate('/dashboard');
      return;
    }
    
    if (businessProfile) {
      setFormData({
        name: businessProfile.name || '',
        phone: businessProfile.phone || '',
        website: businessProfile.website || '',
        address: businessProfile.address || '',
        area: businessProfile.area || '',
        pincode: businessProfile.pincode || '',
        instagram: businessProfile.instagram || '',
        facebook: businessProfile.facebook || '',
        linkedin: businessProfile.linkedin || '',
        twitter: businessProfile.twitter || ''
      });
    }
  }, [businessProfile, loading, user, navigate, toast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // TODO: Implement Google Sheets update via Apps Script or API
      // For now, we'll show a success message
      
      // Example API call structure:
      // await updateBusinessInGoogleSheets(businessProfile.id, formData);
      
      toast({
        title: 'Profile Updated',
        description: 'Your business profile has been updated successfully.'
      });
      
      await refreshPermissions();
      
      // Navigate to view profile or dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-600 mb-2">Edit Business Profile</h1>
            <p className="text-gray-600">Update your business information</p>
            <p className="text-sm text-gray-500 mt-2">
              Logged in as: <span className="font-medium">{user?.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <Input
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://"
                  className="w-full"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <Input
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code
                </label>
                <Input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Media Links</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <Input
                    name="instagram"
                    type="url"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <Input
                    name="facebook"
                    type="url"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <Input
                    name="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <Input
                    name="twitter"
                    type="url"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Read-only fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Read-Only Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Email:</span> {businessProfile?.email}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {businessProfile?.category}
                </div>
                <div>
                  <span className="font-medium">District:</span> {businessProfile?.district}
                </div>
                <div>
                  <span className="font-medium">State:</span> {businessProfile?.state}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                To change these fields, please contact the administrator.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 flex-1"
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
