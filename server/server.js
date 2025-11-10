// server/server.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Load .env from parent directory (project root)
const envPath = resolve(__dirname, '..', '.env');
console.log('\n📁 Loading environment from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error.message);
} else {
  console.log('✅ Environment loaded successfully');
}

// ✅ Debug output
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 Environment Variables Check');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 
  `✅ Loaded (${process.env.GEMINI_API_KEY.substring(0, 25)}...)` : 
  '❌ NOT FOUND');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '❌ NOT FOUND');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

import express from 'express';
import cors from 'cors';
import driveRoutes from './routes/drive.js';

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.CLIENT_URL
    ].filter(Boolean);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Allow in dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use(driveRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: err.message });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 Server running on: http://localhost:' + PORT);
  console.log('='.repeat(60) + '\n');
});

export default app;
