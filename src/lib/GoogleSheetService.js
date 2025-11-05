// lib/GoogleSheetService.js

const SHEET_ID = '1ExVzzxjR7tJnpcK49OX5jCups_Akyabwp7qeMALt1Ss';
const GID = '1096958955';

export const fetchBusinessesFromGoogleSheets = async () => {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheets data');
    }
    
    const csvText = await response.text();
    const businesses = parseCSV(csvText);
    
    console.log('Fetched businesses:', businesses); // Debug log
    return businesses;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return [];
  }
};

const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = parseCSVLine(lines[0]);
  console.log('CSV Headers:', headers); // Debug log
  
  const businesses = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    
    if (values.length > 0 && values.some(v => v)) {
      const rawBusiness = {};
      headers.forEach((header, index) => {
        rawBusiness[header] = values[index] || '';
      });
      
      // Map the Google Sheets columns to your expected format
      const business = mapBusinessFields(rawBusiness);
      
      // Only add if it has at least a name
      if (business.name && business.name.trim()) {
        businesses.push(business);
      }
    }
  }
  
  console.log('Parsed businesses:', businesses.length); // Debug log
  return businesses;
};

// Map Google Sheets field names to your application's field names
const mapBusinessFields = (rawBusiness) => {
  return {
    id: rawBusiness['unique_id'] || rawBusiness['BuildNET ID'] || generateId(),
    created_at: new Date().toISOString(),
    name: rawBusiness['Name'] || '',
    category: rawBusiness['Category'] || rawBusiness['Sub Category'] || '',
    subcategory: rawBusiness['Sub Category'] || '',
    district: rawBusiness['District'] || '',
    state: rawBusiness['State'] || 'Kerala',
    phone: cleanPhoneNumber(rawBusiness['phone_number'] || ''),
    email: rawBusiness['Email Id'] || '',
    website: rawBusiness['Website'] || '',
    address: rawBusiness['Address'] || rawBusiness['Location'] || '',
    area: rawBusiness['Area'] || '',
    pincode: rawBusiness['Pin Code'] || '',
    map_location: rawBusiness['Map Link'] || '',
    gst_number: rawBusiness['gst_number'] || '',
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

// Clean phone numbers (remove extra spaces)
const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/\s+/g, ' ').trim();
};

// Generate a simple ID if not provided
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
        // Handle escaped quotes ("")
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Push the last field
  values.push(current.trim());
  
  return values.map(v => v.replace(/^"(.*)"$/, '$1').trim());
};

// Cache management
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchBusinessesWithCache = async () => {
  const now = Date.now();
  
  if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    console.log('Using cached data');
    return cachedData;
  }
  
  console.log('Fetching fresh data from Google Sheets');
  const data = await fetchBusinessesFromGoogleSheets();
  cachedData = data;
  cacheTimestamp = now;
  
  return data;
};

// Clear cache manually if needed
export const clearCache = () => {
  cachedData = null;
  cacheTimestamp = null;
};
