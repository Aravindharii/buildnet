// src/lib/GoogleDriveService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ============================================
// Cache management
// ============================================
let cachedResources = null;
let cacheTimestamp = null;
let initializationPromise = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// ============================================
// Initialization: Preload resources on app start
// ============================================
export const initializeDriveResources = async () => {
  // Return existing promise if already initializing
  if (initializationPromise) {
    console.log('[GoogleDriveService] ⏳ Already initializing, waiting...');
    return initializationPromise;
  }
  
  console.log('[GoogleDriveService] 🚀 Starting initialization...');
  
  initializationPromise = (async () => {
    try {
      const resources = await fetchDriveResources();
      
      if (resources && resources.length > 0) {
        cachedResources = resources;
        cacheTimestamp = Date.now();
        console.log(`[GoogleDriveService] ✅ Initialization complete: ${resources.length} files cached`);
      } else {
        console.warn('[GoogleDriveService] ⚠️ Initialization returned no resources');
      }
      
      return resources;
    } catch (error) {
      console.error('[GoogleDriveService] ❌ Initialization failed:', error);
      initializationPromise = null; // Allow retry
      throw error;
    }
  })();
  
  return initializationPromise;
};

// Check if resources are already loaded
export const isInitialized = () => {
  return cachedResources !== null && cachedResources.length > 0;
};

// ============================================
// FUNCTION 1: Fetch all drive resources
// ============================================
export const fetchDriveResources = async () => {
  const url = `${API_BASE_URL}/api/drive-resources`;
  console.log('[GoogleDriveService] 📡 Fetching resources from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('[GoogleDriveService] Response status:', response.status);
    console.log('[GoogleDriveService] Response OK:', response.ok);
    console.log('[GoogleDriveService] Response type:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleDriveService] ❌ Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[GoogleDriveService] ❌ Expected JSON but got:', text.substring(0, 200));
      throw new Error(`Expected JSON response but got: ${contentType || 'unknown'}`);
    }
    
    const data = await response.json();
    console.log('[GoogleDriveService] ✅ Response:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }
    
    console.log(`[GoogleDriveService] ✅ Fetched ${data.count} files`);
    return data.files || [];
    
  } catch (error) {
    console.error('[GoogleDriveService] ❌ Error:', error.message);
    console.error('[GoogleDriveService] Stack:', error.stack);
    
    // Check if backend is running
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('[GoogleDriveService] ⚠️ Backend server might not be running!');
      console.error('[GoogleDriveService] ⚠️ Make sure to run: npm run dev:server');
    }
    
    return [];
  }
};

// ============================================
// Fetch with cache support
// ============================================
export const fetchDriveResourcesWithCache = async () => {
  const now = Date.now();
  
  if (cachedResources && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    console.log('[GoogleDriveService] ♻️ Using cached resources');
    return cachedResources;
  }
  
  console.log('[GoogleDriveService] 🔄 Cache expired or empty, fetching fresh data');
  const resources = await fetchDriveResources();
  
  if (resources && resources.length > 0) {
    cachedResources = resources;
    cacheTimestamp = now;
    console.log(`[GoogleDriveService] ✅ Cached ${resources.length} resources`);
  } else {
    console.warn('[GoogleDriveService] ⚠️ No resources to cache');
  }
  
  return resources;
};

export const clearResourceCache = () => {
  console.log('[GoogleDriveService] 🗑️ Clearing cache');
  cachedResources = null;
  cacheTimestamp = null;
  initializationPromise = null;
};

// ============================================
// FUNCTION 2: Get file content as text
// ============================================
export const getFileContent = async (fileId) => {
  const url = `${API_BASE_URL}/api/drive-resources/${fileId}/content`;
  console.log(`[GoogleDriveService] 📄 Getting content for file: ${fileId}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleDriveService] ❌ Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }
    
    console.log(`[GoogleDriveService] ✅ Got content: ${data.textLength} characters`);
    return data;
    
  } catch (error) {
    console.error('[GoogleDriveService] ❌ Error:', error.message);
    throw error;
  }
};

// ============================================
// FUNCTION 3: Ask question about specific file
// ============================================
export const askFileQuestion = async (fileId, question) => {
  const url = `${API_BASE_URL}/api/drive-resources/${fileId}/ask`;
  console.log(`[GoogleDriveService] 💬 Asking question about file: ${fileId}`);
  console.log(`[GoogleDriveService] ❓ Question: "${question}"`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }
    
    console.log('[GoogleDriveService] ✅ Got answer');
    return data;
    
  } catch (error) {
    console.error('[GoogleDriveService] ❌ Error:', error.message);
    throw error;
  }
};

// ============================================
// FUNCTION 4: Ask question across all files
// ============================================
export const askAllFilesQuestion = async (question) => {
  const url = `${API_BASE_URL}/api/drive-resources/ask-all`;
  console.log('[GoogleDriveService] 💬 Asking question across all files');
  console.log(`[GoogleDriveService] ❓ Question: "${question}"`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }
    
    console.log('[GoogleDriveService] ✅ Got answer from all files');
    console.log(`[GoogleDriveService] 📚 Sources: ${data.fileNames?.join(', ') || 'none'}`);
    return data;
    
  } catch (error) {
    console.error('[GoogleDriveService] ❌ Error:', error.message);
    throw error;
  }
};

// ============================================
// Utility: Check API health
// ============================================
export const checkApiHealth = async () => {
  const url = `${API_BASE_URL}/health`;
  console.log('[GoogleDriveService] 🏥 Checking API health:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[GoogleDriveService] ❌ API health check failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('[GoogleDriveService] ✅ API is healthy:', data);
    return data;
  } catch (error) {
    console.error('[GoogleDriveService] ❌ API health check failed:', error.message);
    return null;
  }
};
