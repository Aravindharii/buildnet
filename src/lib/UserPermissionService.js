// lib/UserPermissionService.js

import { fetchBusinessesWithCache } from './GoogleSheetService';

/**
 * Check if the logged-in user's email matches any business in the sheet
 * @param {string} userEmail - The email of the logged-in user
 * @returns {Object|null} - The matched business or null
 */
export const getUserBusinessProfile = async (userEmail) => {
  if (!userEmail) return null;
  
  try {
    const businesses = await fetchBusinessesWithCache();
    
    // Find business matching the user's email
    const userBusiness = businesses.find(
      business => business.email?.toLowerCase() === userEmail.toLowerCase()
    );
    
    return userBusiness || null;
  } catch (error) {
    console.error('Error fetching user business profile:', error);
    return null;
  }
};

/**
 * Check if user has permission to edit a specific business
 * @param {string} userEmail - The logged-in user's email
 * @param {string} businessId - The business ID to edit
 * @returns {boolean}
 */
export const canEditBusiness = async (userEmail, businessId) => {
  const userBusiness = await getUserBusinessProfile(userEmail);
  return userBusiness?.id === businessId;
};

/**
 * Get all permissions for a user
 * @param {string} userEmail
 * @returns {Object} - User permissions object
 */
export const getUserPermissions = async (userEmail) => {
  const userBusiness = await getUserBusinessProfile(userEmail);
  
  return {
    hasBusinessProfile: !!userBusiness,
    businessId: userBusiness?.id || null,
    canEdit: !!userBusiness,
    profile: userBusiness || null
  };
};
