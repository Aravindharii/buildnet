/**
 * Phone Number Matching Utilities for BuildNet
 * Handles various Indian phone number formats with spaces
 */

/**
 * Normalizes a phone number by removing ALL non-digit characters
 * Handles formats like: "094477 73889", "0484 234 4343", "098470 68369"
 * @param {string} phone - Raw phone number string
 * @returns {string} - Normalized phone number (digits only)
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  // Remove ALL non-digit characters (spaces, dashes, parentheses, etc.)
  return phone.toString().replace(/\D/g, '');
};

/**
 * Formats a phone number for display (Indian format: XXXXX XXXXX)
 * @param {string} phone - Phone number string
 * @returns {string} - Formatted phone number
 */
export const formatPhoneDisplay = (phone) => {
  const cleaned = normalizePhone(phone);
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  // Handle 11-digit numbers (with country code prefix)
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 6)} ${cleaned.slice(6)}`;
  }
  return cleaned;
};

/**
 * Compares two phone numbers for similarity
 * Handles ALL format variations by normalizing to digits only
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @param {number} minMatchDigits - Minimum number of trailing digits to match (default: 10)
 * @returns {boolean} - True if phones match
 */
export const phonesMatch = (phone1, phone2, minMatchDigits = 10) => {
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);
  
  if (!normalized1 || !normalized2) return false;
  
  console.log(`🔍 Comparing: "${normalized1}" (from "${phone1}") vs "${normalized2}" (from "${phone2}")`);
  
  // Exact match after normalization
  if (normalized1 === normalized2) {
    console.log('✅ Exact match found');
    return true;
  }
  
  const len1 = normalized1.length;
  const len2 = normalized2.length;
  
  // Compare last N digits (handles different length numbers)
  if (len1 >= minMatchDigits && len2 >= minMatchDigits) {
    const last1 = normalized1.slice(-minMatchDigits);
    const last2 = normalized2.slice(-minMatchDigits);
    
    if (last1 === last2) {
      console.log(`✅ Last ${minMatchDigits} digits match: ${last1}`);
      return true;
    }
  }
  
  // For shorter numbers (like 10 digits), try matching last 8-10 digits
  if (len1 >= 8 && len2 >= 8) {
    for (let i = 10; i >= 8; i--) {
      const last1 = normalized1.slice(-i);
      const last2 = normalized2.slice(-i);
      if (last1 === last2) {
        console.log(`✅ Last ${i} digits match: ${last1}`);
        return true;
      }
    }
  }
  
  // If one is contained in the other
  if (len1 < len2) {
    const match = normalized2.includes(normalized1) || normalized2.endsWith(normalized1);
    if (match) console.log('✅ Phone1 contained in phone2');
    return match;
  } else if (len2 < len1) {
    const match = normalized1.includes(normalized2) || normalized1.endsWith(normalized2);
    if (match) console.log('✅ Phone2 contained in phone1');
    return match;
  }
  
  console.log('❌ No match found');
  return false;
};

/**
 * Finds matching phone number from an array of records
 * @param {string} searchPhone - Phone number to search for
 * @param {Array} records - Array of records with phone field
 * @param {string} phoneField - Name of the phone field (default: 'phone')
 * @returns {Object|null} - Matching record or null
 */
export const findPhoneMatch = (searchPhone, records, phoneField = 'phone') => {
  if (!searchPhone || !records || records.length === 0) {
    console.log('❌ Invalid search parameters');
    return null;
  }
  
  const normalizedSearch = normalizePhone(searchPhone);
  console.log(`\n🔍 === PHONE SEARCH STARTED ===`);
  console.log(`🔍 Searching for: "${normalizedSearch}" (original: "${searchPhone}")`);
  console.log(`📊 Total records to search: ${records.length}\n`);
  
  let matchCount = 0;
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    // Try multiple possible field names
    const recordPhone = record[phoneField] 
      || record.Phone 
      || record.phoneNumber 
      || record.phone_number
      || record.mobile
      || record.Mobile
      || record.contact
      || record.Contact;
    
    if (recordPhone) {
      matchCount++;
      
      // Log first few comparisons for debugging
      if (matchCount <= 5) {
        console.log(`Checking record ${i + 1}: "${recordPhone}"`);
      }
      
      if (phonesMatch(searchPhone, recordPhone)) {
        console.log(`\n✅ ===== MATCH FOUND! =====`);
        console.log(`📍 Record Index: ${i + 1}`);
        console.log(`🏢 Business: ${record.name || record.business_name || 'Unknown'}`);
        console.log(`📞 Matched Phone: "${recordPhone}"`);
        console.log(`📞 Normalized: "${normalizePhone(recordPhone)}"`);
        console.log(`✅ ========================\n`);
        return record;
      }
    }
  }
  
  console.log(`\n❌ === SEARCH COMPLETED ===`);
  console.log(`❌ No match found after checking ${matchCount} phone numbers`);
  console.log(`❌ ======================\n`);
  return null;
};

/**
 * Validates if a phone number is in valid format
 * @param {string} phone - Phone number to validate
 * @param {number} expectedLength - Expected length (default: 10)
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone, expectedLength = 10) => {
  const normalized = normalizePhone(phone);
  return normalized.length === expectedLength || normalized.length === expectedLength + 1; // Allow 10 or 11 digits
};

/**
 * Test function to verify phone matching
 */
export const testPhoneMatching = () => {
  const testCases = [
    { input: '0984706836', sheet: '098470 68369', shouldMatch: true },
    { input: '09847 06836', sheet: '098470 68369', shouldMatch: true },
    { input: '0484 234 4343', sheet: '04842344343', shouldMatch: true },
    { input: '9847068369', sheet: '098470 68369', shouldMatch: true },
    { input: '1234567890', sheet: '098470 68369', shouldMatch: false }
  ];
  
  console.log('\n🧪 === PHONE MATCHING TESTS ===\n');
  
  testCases.forEach((test, index) => {
    const result = phonesMatch(test.input, test.sheet);
    const status = result === test.shouldMatch ? '✅ PASS' : '❌ FAIL';
    console.log(`Test ${index + 1}: ${status}`);
    console.log(`  Input: "${test.input}" vs Sheet: "${test.sheet}"`);
    console.log(`  Expected: ${test.shouldMatch}, Got: ${result}\n`);
  });
  
  console.log('🧪 === TESTS COMPLETED ===\n');
};
