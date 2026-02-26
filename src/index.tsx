// Main Hono application - ERP/POS System
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';

// Import routes
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import salesRoutes from './routes/sales';
import stockRoutes from './routes/stock';

const app = new Hono();

// Middleware
app.use('/*', logger());
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './dist' }));

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/products', productsRoutes);
app.route('/api/sales', salesRoutes);
app.route('/api/stock', stockRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root route - Serve main HTML
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERP/PDV - Sistema de Gestão</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              heading: ['Montserrat', 'sans-serif']
            },
            colors: {
              primary: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                500: '#0ea5e9',
                600: '#0284c7',
                700: '#0369a1',
              }
            }
          }
        }
      }
    </script>
    <style>
      body {
        font-family: 'Inter', sans-serif;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Montserrat', sans-serif;
      }
      .sidebar {
        transition: transform 0.3s ease;
      }
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
        }
        .sidebar.open {
          transform: translateX(0);
        }
      }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app" class="min-h-screen">
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-6xl text-primary-500 mb-6"></i>
                <p class="text-xl text-gray-600">Carregando sistema...</p>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
