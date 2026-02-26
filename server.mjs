// Node.js HTTP server for Railway/Render deployment
import { serve } from '@hono/node-server';
import { readFileSync } from 'fs';

// Import the Hono app
let app;
try {
  const module = await import('./dist/_worker.js');
  app = module.default || module;
  
  if (!app || !app.fetch) {
    console.error('❌ Failed to load app from dist/_worker.js');
    console.error('Module keys:', Object.keys(module));
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error loading worker:', error);
  process.exit(1);
}

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🚀 Starting server on port ${port}...`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configured' : 'NOT CONFIGURED'}`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server listening on http://localhost:${info.port}`);
  console.log(`🌍 Access: http://localhost:${info.port}`);
});
