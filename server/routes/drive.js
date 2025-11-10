// server/routes/drive.js
import express from 'express';
import { google } from 'googleapis';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const router = express.Router();

// Configuration
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '18bSim3RFbg306S73VB3idAfLoWqAYmqw';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBFZ6IUxuC5CLCif1yhOgIxl8-EN_h4EBE';

// ✅ NEW: Document cache
const documentCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

console.log('\n🔑 [Drive Routes] Checking API Key:');
console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY preview:', GEMINI_API_KEY?.substring(0, 25) + '...' || 'NOT FOUND');
console.log();

// ✅ Helper: Call Gemini API
async function callGeminiAPI(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  console.log('🤖 [Gemini] Calling API...');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Gemini] Error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ [Gemini] Response received');
  
  return data.candidates[0].content.parts[0].text;
}

// ✅ NEW: Get or cache document text
async function getDocumentText(drive, file) {
  const cacheKey = `${file.id}-${file.mimeType}`;
  
  // Check cache first
  if (documentCache.has(cacheKey)) {
    const cached = documentCache.get(cacheKey);
    const age = Date.now() - cached.timestamp;
    
    if (age < CACHE_DURATION) {
      console.log(`   ♻️ Using cached text for: ${file.name} (${Math.round(age / 1000)}s old)`);
      return cached.text;
    } else {
      console.log(`   ⏰ Cache expired for: ${file.name}`);
      documentCache.delete(cacheKey);
    }
  }
  
  // Download and extract
  console.log(`   ⬇️ Downloading: ${file.name}...`);
  const fileBuffer = await downloadFile(drive, file.id);
  let text = '';

  if (file.mimeType === 'application/pdf') {
    text = await extractPdfText(fileBuffer);
  } else if (file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await extractDocxText(fileBuffer);
  }

  // Cache it
  if (text.length > 0) {
    documentCache.set(cacheKey, {
      text,
      timestamp: Date.now(),
      fileName: file.name
    });
    console.log(`   💾 Cached text for: ${file.name} (${text.length} chars)`);
  }

  return text;
}

// ✅ NEW: Clear old cache entries
function cleanupCache() {
  const now = Date.now();
  let removed = 0;
  
  for (const [key, value] of documentCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      documentCache.delete(key);
      removed++;
    }
  }
  
  if (removed > 0) {
    console.log(`🗑️ Cleaned up ${removed} expired cache entries`);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);

// Helper: Format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

// Helper: Initialize Google Auth
const getGoogleAuth = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google credentials not configured');
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
};

// Helper: Extract text from PDF
const extractPdfText = async (buffer) => {
  try {
    console.log('      [PDF] Extracting text...');
    const data = await pdf(buffer);
    console.log(`      [PDF] ✅ ${data.text.length} chars`);
    return data.text;
  } catch (error) {
    console.error('[PDF] ❌ Error:', error.message);
    throw new Error(`Failed to extract PDF: ${error.message}`);
  }
};

// Helper: Extract text from DOCX
const extractDocxText = async (buffer) => {
  try {
    console.log('      [DOCX] Extracting text...');
    const result = await mammoth.extractRawText({ buffer });
    console.log(`      [DOCX] ✅ ${result.value.length} chars`);
    return result.value;
  } catch (error) {
    console.error('[DOCX] ❌ Error:', error.message);
    throw new Error(`Failed to extract DOCX: ${error.message}`);
  }
};

// Helper: Download file from Drive
const downloadFile = async (drive, fileId) => {
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const bytes = response.data.byteLength || response.data.length;
    console.log(`      ⬇️ ${formatFileSize(bytes)}`);
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
};

// CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============================================
// ENDPOINT 1: List files
// ============================================
router.get('/api/drive-resources', async (req, res) => {
  try {
    console.log('\n📡 [API] GET /api/drive-resources');
    
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and (mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document') and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink, createdTime, size, modifiedTime)',
      pageSize: 100,
      orderBy: 'modifiedTime desc'
    });

    const files = response.data.files || [];
    console.log(`✅ Found ${files.length} files`);
    
    const formattedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      viewLink: file.webViewLink,
      downloadLink: `https://drive.google.com/uc?id=${file.id}&export=download`,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: formatFileSize(file.size),
      sizeBytes: parseInt(file.size) || 0,
      type: file.mimeType === 'application/pdf' ? 'PDF' : 'DOCX'
    }));

    res.json({ 
      success: true, 
      files: formattedFiles,
      count: formattedFiles.length,
      cacheStats: {
        entries: documentCache.size,
        size: `${Math.round(Array.from(documentCache.values()).reduce((sum, v) => sum + v.text.length, 0) / 1024)}KB`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ENDPOINT 2: Get file content
// ============================================
router.get('/api/drive-resources/:fileId/content', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log('\n📄 [API] GET /api/drive-resources/:fileId/content');
    
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType'
    });

    const text = await getDocumentText(drive, fileMetadata.data);

    res.json({
      success: true,
      fileId,
      fileName: fileMetadata.data.name,
      text,
      textLength: text.length,
      cached: documentCache.has(`${fileId}-${fileMetadata.data.mimeType}`),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ENDPOINT 3: Ask specific file
// ============================================
router.post('/api/drive-resources/:fileId/ask', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { question } = req.body;

    console.log('\n💬 [API] POST /api/drive-resources/:fileId/ask');
    console.log('❓ Question:', question);

    if (!question?.trim()) {
      return res.status(400).json({ success: false, error: 'Question required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'API key not configured' });
    }

    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType'
    });

    const text = await getDocumentText(drive, fileMetadata.data);

    const maxChars = 30000;
    const documentText = text.length > maxChars 
      ? text.substring(0, maxChars) + '\n\n...(truncated)' 
      : text;

   const prompt = `You are BuildNET AI, an expert construction industry assistant specializing in Kerala building regulations, materials, and best practices. You have deep knowledge of:
- Kerala Panchayat Building Rules
- Construction standards and codes
- Building materials and specifications
- Safety regulations and guidelines
- Permit requirements and procedures
- Structural engineering principles
- Construction best practices

Your personality:
- Professional yet friendly and approachable
- Patient and thorough in explanations
- Practical and solution-oriented
- Uses simple language while maintaining technical accuracy
- Provides specific examples and actionable advice

Guidelines for answering:
1. Base your answer PRIMARILY on the provided document content
2. Cite specific sections, rules, or clauses when relevant (e.g., "According to Section 3.2..." or "As per Rule 5...")
3. If the document doesn't have complete information, acknowledge this and provide general guidance based on construction best practices
4. Use bullet points or numbered lists for clarity when listing multiple items
5. Include practical tips or warnings when relevant (e.g., "⚠️ Important:" or "💡 Tip:")
6. Be conversational - imagine you're helping a builder, architect, or homeowner face-to-face
7. DO NOT use ** for bold text - use plain text only


Document: "${fileMetadata.data.name}"
Content: ${documentText}

Question: ${question}

Answer:`;

    const answer = await callGeminiAPI(prompt);

    res.json({
      success: true,
      fileId,
      fileName: fileMetadata.data.name,
      question,
      answer,
      cached: documentCache.has(`${fileId}-${fileMetadata.data.mimeType}`),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ENDPOINT 4: Ask all files (CACHED)
// ============================================
router.post('/api/drive-resources/ask-all', async (req, res) => {
  try {
    const { question } = req.body;

    console.log('\n💬 [API] POST /api/drive-resources/ask-all');
    console.log('❓ Question:', question);
    console.log('📊 Cache status:', documentCache.size, 'documents cached');

    if (!question?.trim()) {
      return res.status(400).json({ success: false, error: 'Question required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'API key not configured' });
    }

    const startTime = Date.now();

    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    const filesResponse = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and (mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document') and trashed=false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 10
    });

    const files = filesResponse.data.files || [];
    console.log(`📚 Processing ${files.length} files`);

    let allText = '';
    const fileNames = [];
    const processedFiles = [];

    for (const file of files) {
      try {
        console.log(`\n   📄 ${file.name}`);
        const text = await getDocumentText(drive, file);

        if (text.length > 0) {
          allText += `\n\n━━━ ${file.name} ━━━\n${text}`;
          fileNames.push(file.name);
          processedFiles.push({ 
            name: file.name, 
            length: text.length,
            cached: documentCache.has(`${file.id}-${file.mimeType}`)
          });
        }
      } catch (err) {
        console.error(`   ⚠️ Error: ${err.message}`);
      }
    }

    const maxChars = 30000;
    const documentText = allText.length > maxChars 
      ? allText.substring(0, maxChars) + '\n\n...(truncated)' 
      : allText;

    console.log(`\n📖 Total: ${allText.length} chars (using ${documentText.length})`);

   const prompt = `You are BuildNET AI, an expert construction industry assistant specializing in Kerala building regulations, materials, and best practices. You have deep knowledge of:
- Kerala Panchayat Building Rules
- Construction standards and codes
- Building materials and specifications
- Safety regulations and guidelines
- Permit requirements and procedures
- Structural engineering principles
- Construction best practices

Your personality:
- Professional yet friendly and approachable
- Patient and thorough in explanations
- Practical and solution-oriented
- Uses simple language while maintaining technical accuracy
- Provides specific examples and actionable advice

Guidelines for answering:
1. Base your answer PRIMARILY on the provided document content
2. Cite specific sections, rules, or clauses when relevant (e.g., "According to Section 3.2..." or "As per Rule 5...")
3. If the document doesn't have complete information, acknowledge this and provide general guidance based on construction best practices
4. Use bullet points or numbered lists for clarity when listing multiple items
5. Include practical tips or warnings when relevant (e.g., "⚠️ Important:" or "💡 Tip:")
6. Be conversational - imagine you're helping a builder, architect, or homeowner face-to-face
7. DO NOT use ** for bold text - use plain text only
Documents: ${fileNames.join(', ')}

Content:
${documentText}

Question: ${question}

Answer (cite sources):`;

    const answer = await callGeminiAPI(prompt);

    const duration = Date.now() - startTime;

    console.log(`✅ Completed in ${(duration / 1000).toFixed(1)}s`);

    res.json({
      success: true,
      filesProcessed: processedFiles.length,
      fileNames,
      processedFiles,
      question,
      answer,
      performance: {
        durationMs: duration,
        totalChars: allText.length,
        cachedFiles: processedFiles.filter(f => f.cached).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ NEW: Clear cache endpoint
router.post('/api/drive-resources/clear-cache', (req, res) => {
  const size = documentCache.size;
  documentCache.clear();
  console.log(`🗑️ Cleared ${size} cached documents`);
  res.json({ success: true, cleared: size });
});

export default router;
