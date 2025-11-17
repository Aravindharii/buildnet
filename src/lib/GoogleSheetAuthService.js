// lib/GoogleSheetAuthService.js - COMPLETE FIXED VERSION

const SHEET_ID = '1ExVzzxjR7tJnpcK49OX5jCups_Akyabwp7qeMALt1Ss';
const GID = '1096958955';

/**
 * Get ALL businesses (main function used by FirebaseAuthContext)
 */
export const getAllBusinesses = async () => {
  return await fetchBusinessesWithCache();
};

/**
 * Check if an email exists in the Google Sheet (authorized user)
 */
export const isAuthorizedEmail = async (email) => {
  if (!email) {
    console.log('❌ No email provided');
    return { isAuthorized: false, businessData: null };
  }
  
  console.log('🔍 Checking authorization for:', email);
  
  try {
    const businesses = await fetchBusinessesWithCache();
    
    console.log('📊 Total businesses loaded:', businesses.length);
    console.log('📋 Sample emails from sheet:', businesses.slice(0, 5).map(b => b.email));
    
    const normalizedEmail = email.toLowerCase().trim();
    
    const authorizedBusiness = businesses.find(
      business => {
        const bizEmail = business.email?.toLowerCase().trim();
        console.log('  Comparing:', bizEmail, '===', normalizedEmail);
        return bizEmail === normalizedEmail;
      }
    );
    
    if (authorizedBusiness) {
      console.log('✅ Found authorized business:', authorizedBusiness.name);
    } else {
      console.log('❌ Email not found in directory');
    }
    
    return {
      isAuthorized: !!authorizedBusiness,
      businessData: authorizedBusiness || null
    };
  } catch (error) {
    console.error('❌ Error checking email authorization:', error);
    return { isAuthorized: false, businessData: null };
  }
};

/**
 * Get business data by email
 */
export const getBusinessByEmail = async (email) => {
  if (!email) return null;
  
  const businesses = await fetchBusinessesWithCache();
  const normalizedEmail = email.toLowerCase().trim();
  
  return businesses.find(
    business => business.email?.toLowerCase().trim() === normalizedEmail
  ) || null;
};

/**
 * Get business data by phone number
 */
export const getBusinessByPhone = async (phone) => {
  if (!phone) return null;
  
  const businesses = await fetchBusinessesWithCache();
  const cleanPhone = phone.replace(/\D/g, '');
  
  return businesses.find(
    business => business.phone?.replace(/\D/g, '') === cleanPhone
  ) || null;
};

/**
 * Fetch businesses from Google Sheets
 */
export const fetchBusinessesFromGoogleSheets = async () => {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    
    console.log('🌐 Fetching from:', csvUrl);
    
    const response = await fetch(csvUrl);
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    console.log('📄 CSV length:', csvText.length, 'characters');
    console.log('📄 First 200 chars:', csvText.substring(0, 200));
    
    const businesses = parseCSV(csvText);
    
    console.log('✅ Successfully parsed', businesses.length, 'businesses');
    
    return businesses;
  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error);
    return [];
  }
};

/**
 * Parse CSV text into business objects
 */
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    console.warn('⚠️ No lines found in CSV');
    return [];
  }
  
  const headers = parseCSVLine(lines[0]);
  console.log('📋 CSV Headers:', headers);
  console.log('📊 Total lines (including header):', lines.length);
  
  const businesses = [];
  const businessesWithEmail = [];
  let skippedCount = 0;
  let noNameCount = 0;
  let noEmailCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    
    if (values.length > 0 && values.some(v => v)) {
      const rawBusiness = {};
      headers.forEach((header, index) => {
        rawBusiness[header] = values[index] || '';
      });
      
      const business = mapBusinessFields(rawBusiness);
      
      // Debug first few rows
      if (i <= 3) {
        console.log(`\n🔍 Row ${i} debug:`, {
          rawName: rawBusiness['Name'],
          rawEmail: rawBusiness['Email Id'],
          rawPhone: rawBusiness['phone_number'] || rawBusiness['Phone'],
          mappedName: business.name,
          mappedEmail: business.email,
          mappedPhone: business.phone,
          hasName: !!(business.name && business.name.trim()),
          hasEmail: !!(business.email && business.email.trim()),
          hasPhone: !!(business.phone && business.phone.trim())
        });
      }
      
      // Only require name, email and phone are optional
      if (!business.name || !business.name.trim()) {
        noNameCount++;
        if (noNameCount <= 3) console.log(`❌ Row ${i}: No name`);
      } else {
        // Add to main list (for directory)
        businesses.push(business);
        
        // Track if has email (for authentication)
        if (business.email && business.email.trim()) {
          businessesWithEmail.push(business);
          if (businessesWithEmail.length <= 3) {
            console.log(`✅ Row ${i}: Added "${business.name}" with email "${business.email}" and phone "${business.phone}"`);
          }
        } else {
          noEmailCount++;
          if (noEmailCount <= 3) {
            console.log(`⚠️  Row ${i}: Added "${business.name}" with phone "${business.phone}" but NO EMAIL (can't login with email)`);
          }
        }
      }
    } else {
      skippedCount++;
    }
  }
  
  console.log('\n📊 Parsing Summary:');
  console.log(`  ✅ Total businesses: ${businesses.length}`);
  console.log(`  🔐 Can authenticate with email: ${businessesWithEmail.length}`);
  console.log(`  ❌ Missing name: ${noNameCount}`);
  console.log(`  ⚠️  No email (can't login with email): ${noEmailCount}`);
  console.log(`  ⏭️  Empty rows: ${skippedCount}`);
  
  return businesses;
};

/**
 * Map raw CSV fields to business object
 */
const mapBusinessFields = (rawBusiness) => {
  return {
    id: rawBusiness['unique_id'] || rawBusiness['BuildNET ID'] || generateId(),
    created_at: new Date().toISOString(),
    name: rawBusiness['Name'] || '',
    category: rawBusiness['Category'] || rawBusiness['Sub Category'] || '',
    subcategory: rawBusiness['Sub Category'] || '',
    district: rawBusiness['District'] || '',
    state: rawBusiness['State'] || 'Kerala',
    phone: cleanPhoneNumber(rawBusiness['phone_number'] || rawBusiness['Phone'] || ''),
    email: rawBusiness['Email Id'] || rawBusiness['Email'] || '',
    website: rawBusiness['Website'] || '',
    address: rawBusiness['Address'] || rawBusiness['Location'] || '',
    area: rawBusiness['Area'] || '',
    pincode: rawBusiness['Pin Code'] || '',
    map_location: rawBusiness['Map Link'] || '',
    gst_number: rawBusiness['gst_number'] || rawBusiness['GST Number'] || '',
    rating: rawBusiness['Review'] || '',
    rating_count: rawBusiness['Rating Count'] || '',
    tags: rawBusiness['TAGS'] || '',
    products: rawBusiness['PRODUCTS'] || '',
    photo: rawBusiness['Photo'] || '',
    plus_code: rawBusiness['PlusCode'] || '',
    latitude: rawBusiness['latitude'] || '',
    longitude: rawBusiness['longitude'] || '',
    instagram: rawBusiness['Instagram Profile'] || '',
    facebook: rawBusiness['Facebook Profile'] || '',
    linkedin: rawBusiness['Linkedin Profile'] || '',
    twitter: rawBusiness['Twitter Profile'] || '',
    images_folder: rawBusiness['Images Folder'] || '',
    association_badges: rawBusiness['association_badges'] || '',
  };
};
export const getBusinessWithFirestoreUpdates = async (businessId, firestoreData) => {
  const businesses = await getAllBusinesses();
  const sheetBusiness = businesses.find(b => 
    (b.id || b.business_id) === businessId
  );
  
  if (!sheetBusiness) return null;
  
  // Merge: Firestore data overrides Sheet data
  return {
    ...sheetBusiness,
    ...firestoreData,
    // Keep some fields from sheet only
    name: sheetBusiness.name,
    email: sheetBusiness.email,
    category: sheetBusiness.category,
    district: sheetBusiness.district,
    state: sheetBusiness.state
  };
};

/**
 * Clean phone number (preserve spaces for Indian format)
 */
const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  // Keep spaces but trim and normalize multiple spaces to single space
  return phone.replace(/\s+/g, ' ').trim();
};

/**
 * Generate unique ID
 */
const generateId = () => {
  return `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse a single CSV line (handles quoted values)
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values.map(v => v.replace(/^"(.*)"$/, '$1').trim());
};

// Cache management
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch businesses with caching
 */
export const fetchBusinessesWithCache = async () => {
  const now = Date.now();
  
  if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    console.log('📦 Using cached Google Sheets data');
    return cachedData;
  }
  
  console.log('🔄 Fetching fresh data from Google Sheets');
  const data = await fetchBusinessesFromGoogleSheets();
  cachedData = data;
  cacheTimestamp = now;
  
  return data;
};

/**
 * Clear the cache
 */
export const clearCache = () => {
  cachedData = null;
  cacheTimestamp = null;
  console.log('🗑️ Cache cleared');
};

/**
 * Force refresh data (clear cache and fetch new)
 */
export const refreshBusinessData = async () => {
  clearCache();
  return await fetchBusinessesWithCache();
};
