// contexts/FirebaseAuthContext.jsx - COMPLETE FIXED VERSION

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // ✅ CHANGED: removed updateDoc, using only setDoc
import { auth, googleProvider, db } from '../config/firebase.js';
import * as GoogleSheetAuthService from '../lib/GoogleSheetAuthService.js';
import { normalizePhone, phonesMatch, findPhoneMatch } from '../lib/phoneUtils';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkedBusiness, setLinkedBusiness] = useState(null);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  /**
   * Check if user is linked to a business in Firestore
   */
  const checkBusinessLink = async (currentUser) => {
    if (!currentUser) {
      setLinkedBusiness(null);
      setHasCompletedProfile(false);
      return false;
    }

    try {
      console.log('🔍 Checking business link for:', currentUser.email);
      
      // Check Firestore for linked business
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.profileCompleted && userData.linkedBusinessId) {
          console.log('✅ User profile completed, business ID:', userData.linkedBusinessId);
          
          // Fetch full business data from Google Sheets
          const businesses = await GoogleSheetAuthService.getAllBusinesses();
          const business = businesses.find(b => 
            (b.id || b.business_id || b.Business_ID) === userData.linkedBusinessId
          );
          
          if (business) {
            console.log('✅ Business found:', business.name || business.business_name);
            setLinkedBusiness(business);
            setHasCompletedProfile(true);
            return true;
          }
        }
      }
      
      console.log('⚠️ User not linked to any business yet');
      setLinkedBusiness(null);
      setHasCompletedProfile(false);
      return false;
      
    } catch (error) {
      console.error('❌ Error checking business link:', error);
      
      // Handle offline error gracefully
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.log('⚠️ Firestore unavailable (offline), skipping profile check');
      }
      
      setLinkedBusiness(null);
      setHasCompletedProfile(false);
      return false;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email, password) => {
    console.log('📝 [signUp] Starting sign up for:', email);
    
    try {
      console.log('📝 [signUp] Calling createUserWithEmailAndPassword...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      console.log('📝 [signUp] User created:', newUser.uid);
      
      try {
        // Create initial Firestore document with setDoc
        const userRef = doc(db, 'users', newUser.uid);
        await setDoc(userRef, {
          email: email,
          createdAt: new Date().toISOString(),
          profileCompleted: false,
          linkedBusinessId: null,
          businessName: null
        });
        console.log('📝 [signUp] Firestore document created');
      } catch (firestoreError) {
        console.error('⚠️ Firestore document creation failed:', firestoreError);
      }
      
      console.log('📝 [signUp] Sending verification email...');
      await sendEmailVerification(newUser);
      console.log('📝 [signUp] Verification email sent');
      
      const redirect = '/complete-profile';
      console.log('📝 [signUp] Redirect determined:', redirect);
      
      return { 
        user: newUser, 
        error: null,
        redirect
      };
    } catch (error) {
      console.error('❌ [signUp] Error:', error);
      
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      
      return { user: null, error: { message }, redirect: null };
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email, password) => {
    console.log('🔑 [signIn] Starting sign in for:', email);
    
    try {
      console.log('🔑 [signIn] Calling signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      console.log('🔑 [signIn] User signed in:', currentUser.uid);
      
      console.log('🔑 [signIn] Checking business link...');
      const hasLink = await checkBusinessLink(currentUser);
      console.log('🔑 [signIn] Has business link:', hasLink);
      
      const redirect = '/complete-profile';
      console.log('🔑 [signIn] Redirect determined:', redirect);
      
      return { 
        user: currentUser, 
        error: null,
        redirect
      };
    } catch (error) {
      console.error('❌ [signIn] Error:', error);
      
      let message = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }
      
      return { user: null, error: { message }, redirect: null };
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithProvider = async () => {
    console.log('🔑 [Google] Starting Google sign in');
    
    try {
      console.log('🔑 [Google] Opening popup...');
      const userCredential = await signInWithPopup(auth, googleProvider);
      const currentUser = userCredential.user;
      console.log('🔑 [Google] User signed in:', currentUser.uid);
      
      try {
        // Check if user document exists, create if not
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.log('🔑 [Google] Creating new user document');
          await setDoc(userRef, {
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: new Date().toISOString(),
            profileCompleted: false,
            linkedBusinessId: null,
            businessName: null
          });
        }
      } catch (firestoreError) {
        console.error('⚠️ Firestore operation failed:', firestoreError);
      }
      
      console.log('🔑 [Google] Checking business link...');
      const hasLink = await checkBusinessLink(currentUser);
      console.log('🔑 [Google] Has business link:', hasLink);
      
      const redirect = hasLink ? '/dashboard' : '/complete-profile';
      console.log('🔑 [Google] Redirect determined:', redirect);
      
      return { 
        user: currentUser, 
        error: null,
        redirect
      };
    } catch (error) {
      console.error('❌ [Google] Error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        return { user: null, error: null, redirect: null };
      }
      
      return { user: null, error: { message: error.message }, redirect: null };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      console.log('🚪 Logging out');
      await signOut(auth);
      setLinkedBusiness(null);
      setHasCompletedProfile(false);
      return { error: null };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { error };
    }
  };

  /**
   * Link business profile using email or phone
   */
  const linkBusinessProfile = async ({ email, phone }) => {
    console.log('\n🔗 === LINKING BUSINESS PROFILE ===');
    console.log('📧 Email:', email);
    console.log('📞 Phone:', phone);
    console.log('👤 Current User:', user?.email);
    console.log('================================\n');
    
    if (!user) {
      console.error('❌ No user logged in');
      return { success: false, message: 'User not authenticated' };
    }
    
    try {
      const businesses = await GoogleSheetAuthService.getAllBusinesses();
      console.log(`📦 Loaded ${businesses.length} businesses from Google Sheets\n`);
      
      let matchedBusiness = null;
      
      // Strategy 1: Try exact email match first
      if (email && email.trim()) {
        const normalizedEmail = email.toLowerCase().trim();
        console.log('🔍 Strategy 1: Searching by email...');
        console.log(`   Email: "${normalizedEmail}"\n`);
        
        matchedBusiness = businesses.find(b => 
          b.email && b.email.toLowerCase().trim() === normalizedEmail
        );
        
        if (matchedBusiness) {
          console.log('✅ Match found by EMAIL!\n');
          
          try {
            // ✅ FIX: Use setDoc with merge instead of updateDoc
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              email: user.email,
              linkedBusinessId: matchedBusiness.id || matchedBusiness.business_id || matchedBusiness.Business_ID,
              businessName: matchedBusiness.name || matchedBusiness.business_name || matchedBusiness.Business_Name,
              profileCompleted: true,
              linkedAt: new Date().toISOString()
            }, { merge: true }); // ✅ This will create or update
            console.log('✅ Firestore updated');
          } catch (firestoreError) {
            console.error('⚠️ Firestore update failed:', firestoreError);
          }
          
          setLinkedBusiness(matchedBusiness);
          setHasCompletedProfile(true);
          
          return { 
            success: true, 
            business: matchedBusiness,
            matchedBy: 'email'
          };
        }
        
        console.log('❌ No email match found\n');
      }
      
      // Strategy 2: Try phone number match with fuzzy matching
      if (phone && phone.trim()) {
        const normalizedPhone = normalizePhone(phone);
        console.log('🔍 Strategy 2: Searching by phone number...');
        console.log(`   Input Phone: "${phone}"`);
        console.log(`   Normalized: "${normalizedPhone}"\n`);
        
        // Use the advanced fuzzy phone matching utility
        matchedBusiness = findPhoneMatch(phone, businesses, 'phone');
        
        // If not found, try alternate field names manually
        if (!matchedBusiness) {
          console.log('🔄 Trying alternate phone field names...\n');
          
          matchedBusiness = businesses.find(business => {
            const phoneVariants = [
              business.phone,
              business.Phone,
              business.phoneNumber,
              business.phone_number,
              business.Phone_Number,
              business.mobile,
              business.Mobile,
              business.contact,
              business.Contact,
              business.Contact_Number
            ];
            
            for (const variant of phoneVariants) {
              if (variant && phonesMatch(phone, variant)) {
                console.log(`✅ Match found using field variant!`);
                console.log(`   Field value: "${variant}"\n`);
                return true;
              }
            }
            return false;
          });
        }
        
        if (matchedBusiness) {
          console.log('✅ Match found by PHONE!\n');
          
          try {
            // ✅ FIX: Use setDoc with merge instead of updateDoc
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              email: user.email,
              linkedBusinessId: matchedBusiness.id || matchedBusiness.business_id || matchedBusiness.Business_ID,
              businessName: matchedBusiness.name || matchedBusiness.business_name || matchedBusiness.Business_Name,
              profileCompleted: true,
              linkedAt: new Date().toISOString()
            }, { merge: true }); // ✅ This will create or update
            console.log('✅ Firestore updated');
          } catch (firestoreError) {
            console.error('⚠️ Firestore update failed:', firestoreError);
          }
          
          setLinkedBusiness(matchedBusiness);
          setHasCompletedProfile(true);
          
          return { 
            success: true, 
            business: matchedBusiness,
            matchedBy: 'phone'
          };
        }
        
        console.log('❌ No phone match found\n');
      }
      
      console.log('❌ === NO MATCH FOUND ===');
      console.log('❌ Tried email and phone matching');
      console.log('❌ =======================\n');
      
      return { 
        success: false, 
        message: 'No matching business found in directory' 
      };
      
    } catch (error) {
      console.error('❌ Error linking business profile:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  };

  /**
   * Refresh business profile from latest data
   */
  const refreshBusinessProfile = async () => {
    if (user) {
      await checkBusinessLink(user);
    }
  };

  /**
   * Auth state listener
   */
  useEffect(() => {
    console.log('🔄 Setting up auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('👤 Auth state changed:', currentUser ? currentUser.email : 'No user');
      
      setUser(currentUser);
      
      if (currentUser) {
        await checkBusinessLink(currentUser);
      } else {
        setLinkedBusiness(null);
        setHasCompletedProfile(false);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    linkedBusiness,
    hasCompletedProfile,
    signUp,
    signIn,
    signInWithProvider,
    logout,
    linkBusinessProfile,
    refreshBusinessProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
