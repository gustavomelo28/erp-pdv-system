// Node.js HTTP server for Railway/Render deployment
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ALWAYS load .env.production
console.log('📁 Loading environment from .env.production...');
const envPath = join(__dirname, '.env.production');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('⚠️  Failed to load .env.production:', result.error.message);
} else {
  console.log('✅ Loaded .env.production successfully');
}

// Import the Hono app
const module = await import('./dist/_worker.js');
const app = module.default || module;

if (!app || !app.fetch) {
  console.error('❌ Failed to load app from dist/_worker.js');
  process.exit(1);
}

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🚀 Starting server on port ${port}...`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configured ✅' : 'NOT CONFIGURED ❌'}`);
console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured ✅' : 'NOT CONFIGURED ❌'}`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server listening on http://localhost:${info.port}`);
  console.log(`🌍 Access: http://localhost:${info.port}`);
});
