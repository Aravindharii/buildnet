// lib/GoogleSheetsUpdateService.js - NO EMAIL VALIDATION

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwfx46fFA37p2WRwOQZhtxdFkvDqMPCfurTmqRcd7A5WehlELw6ohI3zYXYiVFa3Y6Yg/exec';

export const updateBusinessInSheet = async (businessData) => {
  console.log('\n📝 === GOOGLE SHEETS UPDATE STARTED ===');
  console.log('📋 Data to update:', businessData);
  
  // ✅ Removed email validation - phone is enough
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
    //   mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(businessData)
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Request sent (no-cors mode)');
    console.log('⏱️  Duration:', duration, 'ms');
    console.log('🔍 Check Google Sheet to verify update\n');
    
    return { 
      success: true, 
      duration: duration
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
