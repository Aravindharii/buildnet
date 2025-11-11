// src/hooks/useDriveResourcesInit.js

import { useEffect, useRef } from 'react';
import { initializeDriveResources } from '../lib/driveservice';

export const useDriveResourcesInit = () => {
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    // Prevent double initialization in React StrictMode (development)
    if (hasInitialized.current) {
      console.log('[useDriveResourcesInit] ⏭️ Already initialized, skipping...');
      return;
    }
    
    hasInitialized.current = true;
    
    // Fetch and cache resources on mount
    const initializeResources = async () => {
      console.log('[useDriveResourcesInit] 🚀 Initializing Drive resources on first load...');
      try {
        const resources = await initializeDriveResources();
        console.log(`[useDriveResourcesInit] ✅ Drive resources cached successfully (${resources?.length || 0} files)`);
      } catch (error) {
        console.error('[useDriveResourcesInit] ❌ Failed to initialize resources:', error);
        // Reset ref to allow retry on next mount
        hasInitialized.current = false;
      }
    };
    
    initializeResources();
  }, []); // Empty dependency array = run once on mount
};
