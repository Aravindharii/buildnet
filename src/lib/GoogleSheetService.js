// lib/GoogleSheetAuthService.js - COMPLETE FILE WITH OPTION 2

const SHEET_ID = '1ExVzzxjR7tJnpcK49OX5jCups_Akyabwp7qeMALt1Ss';
const GID = '1096958955';

export const isAuthorizedEmail = async (email) => {
  if (!email) {
    console.log('❌ No email provided');
    return { isAuthorized: false, businessData: null };
  }
  
  console.log('🔍 Checking authorization for:', email);
  
  try {
    const businesses = await fetchBusinessesWithCache();
    
    // Filter only businesses with emails for authentication
    const businessesWithEmail = businesses.filter(b => b.email && b.email.trim());
    
    console.log('📊 Total businesses loaded:', businesses.length);
    console.log('🔐 Businesses with emails:', businessesWithEmail.length);
    console.log('📋 Sample emails:', businessesWithEmail.slice(0, 5).map(b => b.email));
    
    const normalizedEmail = email.toLowerCase().trim();
    
    const authorizedBusiness = businessesWithEmail.find(
      business => business.email?.toLowerCase().trim() === normalizedEmail
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

export const getBusinessByEmail = async (email) => {
  if (!email) return null;
  
  const businesses = await fetchBusinessesWithCache();
  const normalizedEmail = email.toLowerCase().trim();
  
  return businesses.find(
    business => business.email?.toLowerCase().trim() === normalizedEmail
  ) || null;
};

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
    
    const businesses = parseCSV(csvText);
    
    console.log('✅ Successfully parsed', businesses.length, 'businesses');
    
    return businesses;
  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error);
    return [];
  }
};

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
      
      // Only require name (email optional)
      if (business.name && business.name.trim()) {
        businesses.push(business);
        
        if (!business.email || !business.email.trim()) {
          noEmailCount++;
        }
      } else {
        noNameCount++;
      }
    }
  }
  
  const withEmail = businesses.filter(b => b.email && b.email.trim()).length;
  
  console.log('\n📊 Parsing Summary:');
  console.log(`  ✅ Total businesses: ${businesses.length}`);
  console.log(`  🔐 With email (can login): ${withEmail}`);
  console.log(`  ⚠️  Without email: ${noEmailCount}`);
  console.log(`  ❌ Missing name: ${noNameCount}`);
  
  return businesses;
};

const mapBusinessFields = (rawBusiness) => {
  const getField = (possibleNames) => {
    for (const name of possibleNames) {
      if (rawBusiness[name]) return rawBusiness[name];
    }
    return '';
  };

  return {
    id: getField(['unique_id', 'BuildNET ID']) || generateId(),
    created_at: new Date().toISOString(),
    name: getField(['Name']),
    category: getField(['Category', 'Sub Category']),
    subcategory: getField(['Sub Category']),
    district: getField(['District']),
    state: getField(['State']) || 'Kerala',
    phone: cleanPhoneNumber(getField(['phone_number', 'Phone'])),
    email: getField(['Email Id', 'Email']),
    website: getField(['Website']),
    address: getField(['Address', 'Location']),
    area: getField(['Area']),
    pincode: getField(['Pin Code']),
    map_location: getField(['Map Link']),
    gst_number: getField(['gst_number', 'GST Number']),
    rating: getField(['Review']),
    rating_count: getField(['Rating Count']),
    tags: getField(['TAGS']),
    products: getField(['PRODUCTS', 'PRODUCTS ']),
    photo: getField(['Photo']),
    plus_code: getField(['PlusCode']),
    latitude: getField(['latitude']),
    longitude: getField(['longitude']),
    instagram: getField(['Instagram Profile']),
    facebook: getField(['Facebook Profile']),
    linkedin: getField(['Linkedin Profile']),
    twitter: getField(['Twitter Profile']),
    images_folder: getField(['Images Folder']),
    association_badges: getField(['association_badges']),
  };
};

const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/\s+/g, ' ').trim();
};

const generateId = () => {
  return `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

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

let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

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

export const clearCache = () => {
  cachedData = null;
  cacheTimestamp = null;
  console.log('🗑️ Cache cleared');
};
