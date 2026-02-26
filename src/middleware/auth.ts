// Authentication middleware for Hono
import { Context, Next } from 'hono';
import { extractToken, verifyToken, JWTPayload } from '../lib/auth';

// Extend Hono context with user info
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

// Middleware to require authentication
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);
  
  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  
  try {
    const payload = await verifyToken(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

// Middleware to require specific role
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    await next();
  };
}

// Middleware to log audit trail
export async function auditLog(c: Context, next: Next) {
  const user = c.get('user');
  const method = c.req.method;
  const path = c.req.path;
  
  // Log before processing
  console.log(`[AUDIT] User: ${user?.userId} - ${method} ${path}`);
  
  await next();
  
  // Could save to database here
}
