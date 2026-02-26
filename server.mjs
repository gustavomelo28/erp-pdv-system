// Node.js HTTP server for Railway/Render deployment
import { serve } from '@hono/node-server';
import app from './dist/_worker.js';

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🚀 Starting server on port ${port}...`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server listening on http://localhost:${info.port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'NOT CONFIGURED'}`);
});
