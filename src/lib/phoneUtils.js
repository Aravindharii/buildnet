/**
 * Phone Number Matching Utilities for BuildNet
 * Handles various Indian phone number formats with STRICT EXACT MATCHING
 * Fixed version - NO fuzzy matching
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
 * Compares two phone numbers for EXACT match only
 * NO fuzzy matching - numbers must be identical after normalization
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} - True if phones match exactly
 */
export const phonesMatch = (phone1, phone2) => {
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);
  
  // Both must exist and have valid length
  if (!normalized1 || !normalized2) return false;
  
  // Must be valid phone number length (10 or 11 digits for Indian numbers)
  if (normalized1.length < 10 || normalized2.length < 10) return false;
  if (normalized1.length > 11 || normalized2.length > 11) return false;
  
  console.log(`🔍 Comparing: "${normalized1}" (from "${phone1}") vs "${normalized2}" (from "${phone2}")`);
  
  // ONLY exact match after normalization
  const isMatch = normalized1 === normalized2;
  
  if (isMatch) {
    console.log('✅ Exact match found');
  } else {
    console.log('❌ No exact match');
  }
  
  return isMatch;
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
  
  // Validate search phone length
  if (normalizedSearch.length < 10 || normalizedSearch.length > 11) {
    console.log(`❌ Invalid phone number length: ${normalizedSearch.length} digits`);
    return null;
  }
  
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
      const normalizedRecord = normalizePhone(recordPhone);
      
      // Skip if record phone is invalid length
      if (normalizedRecord.length < 10 || normalizedRecord.length > 11) {
        continue;
      }
      
      matchCount++;
      
      // Log first few comparisons for debugging
      if (matchCount <= 5) {
        console.log(`Checking record ${i + 1}: "${recordPhone}" -> "${normalizedRecord}"`);
      }
      
      if (phonesMatch(searchPhone, recordPhone)) {
        console.log(`\n✅ ===== MATCH FOUND! =====`);
        console.log(`📍 Record Index: ${i + 1}`);
        console.log(`🏢 Business: ${record.name || record.business_name || 'Unknown'}`);
        console.log(`📞 Matched Phone: "${recordPhone}"`);
        console.log(`📞 Normalized: "${normalizedRecord}"`);
        console.log(`✅ ========================\n`);
        return record;
      }
    }
  }
  
  console.log(`\n❌ === SEARCH COMPLETED ===`);
  console.log(`❌ No match found after checking ${matchCount} valid phone numbers`);
  console.log(`❌ ======================\n`);
  return null;
};

/**
 * Validates if a phone number is in valid format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return normalized.length === 10 || normalized.length === 11;
};

/**
 * Test function to verify phone matching
 */
export const testPhoneMatching = () => {
  const testCases = [
    // These SHOULD match (same number, different formatting)
    { input: '09847068369', sheet: '098470 68369', shouldMatch: true },
    { input: '09847 06836 9', sheet: '09847068369', shouldMatch: true },
    { input: '0484 234 4343', sheet: '04842344343', shouldMatch: true },
    { input: '9847068369', sheet: '9847068369', shouldMatch: true },
    
    // These should NOT match (different numbers)
    { input: '9847068369', sheet: '098470 68369', shouldMatch: false }, // 10 vs 11 digits
    { input: '9847068369', sheet: '89847068369', shouldMatch: false }, // Different prefix
    { input: '9847068369', sheet: '9847068368', shouldMatch: false }, // Last digit different
    { input: '1234567890', sheet: '098470 68369', shouldMatch: false }, // Completely different
    { input: '9995475379', sheet: '5', shouldMatch: false }, // Invalid short number
  ];
  
  console.log('\n🧪 === EXACT PHONE MATCHING TESTS ===\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((test, index) => {
    const result = phonesMatch(test.input, test.sheet);
    const status = result === test.shouldMatch ? '✅ PASS' : '❌ FAIL';
    
    if (result === test.shouldMatch) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(`Test ${index + 1}: ${status}`);
    console.log(`  Input: "${test.input}" vs Sheet: "${test.sheet}"`);
    console.log(`  Expected: ${test.shouldMatch}, Got: ${result}\n`);
  });
  
  console.log('🧪 === TESTS COMPLETED ===');
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}\n`);
};
