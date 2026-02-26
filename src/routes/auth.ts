// Authentication routes
import { Hono } from 'hono';
import { executeQuery } from '../lib/db';
import { hashPassword, verifyPassword, generateToken } from '../lib/auth';
import type { LoginRequest, LoginResponse, User, UserCompany, Company } from '../types';

const auth = new Hono();

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body: LoginRequest = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // Find user by email
    const users = await executeQuery<User>(
      'SELECT * FROM users WHERE email = $1 AND active = true',
      [email]
    );
    
    if (users.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    // Get user companies
    const userCompanies = await executeQuery<UserCompany & { company_name: string }>(
      `SELECT uc.*, c.name as company_name 
       FROM user_companies uc 
       JOIN companies c ON c.id = uc.company_id 
       WHERE uc.user_id = $1`,
      [user.id]
    );
    
    // Update last login
    await executeQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: userCompanies[0]?.company_id
    });
    
    // Log audit
    await executeQuery(
      `INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, new_data, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.id,
        userCompanies[0]?.company_id || null,
        'login',
        'user',
        user.id,
        JSON.stringify({ email: user.email }),
        c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
      ]
    );
    
    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      companies: userCompanies.map((uc) => ({
        id: uc.company_id,
        name: uc.company_name,
        role: uc.role
      }))
    };
    
    return c.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/register (for admin creating new users)
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role, company_id } = body;
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }
    
    // Check if user already exists
    const existingUsers = await executeQuery<User>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }
    
    // Hash password
    const password_hash = await hashPassword(password);
    
    // Create user
    const newUsers = await executeQuery<User>(
      `INSERT INTO users (email, password_hash, name, role, active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [email, password_hash, name, role || 'read_only']
    );
    
    const newUser = newUsers[0];
    
    // Associate user with company if provided
    if (company_id) {
      await executeQuery(
        `INSERT INTO user_companies (user_id, company_id, role)
         VALUES ($1, $2, $3)`,
        [newUser.id, company_id, role || 'read_only']
      );
    }
    
    return c.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/forgot-password
auth.post('/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    
    // Find user
    const users = await executeQuery<User>(
      'SELECT id FROM users WHERE email = $1 AND active = true',
      [email]
    );
    
    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      return c.json({ message: 'If the email exists, a reset link will be sent' });
    }
    
    const user = users[0];
    
    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour
    
    // Save reset token
    await executeQuery(
      `UPDATE users 
       SET password_reset_token = $1, password_reset_expires = $2 
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );
    
    // TODO: Send email with reset link
    // In development, just return the token
    if (process.env.NODE_ENV === 'development') {
      return c.json({
        message: 'Password reset token generated',
        reset_token: resetToken,
        reset_url: `/reset-password?token=${resetToken}`
      });
    }
    
    return c.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/reset-password
auth.post('/reset-password', async (c) => {
  try {
    const { token, new_password } = await c.req.json();
    
    if (!token || !new_password) {
      return c.json({ error: 'Token and new password are required' }, 400);
    }
    
    // Find user with valid reset token
    const users = await executeQuery<User>(
      `SELECT id FROM users 
       WHERE password_reset_token = $1 
       AND password_reset_expires > CURRENT_TIMESTAMP 
       AND active = true`,
      [token]
    );
    
    if (users.length === 0) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }
    
    const user = users[0];
    
    // Hash new password
    const password_hash = await hashPassword(new_password);
    
    // Update password and clear reset token
    await executeQuery(
      `UPDATE users 
       SET password_hash = $1, 
           password_reset_token = NULL, 
           password_reset_expires = NULL 
       WHERE id = $2`,
      [password_hash, user.id]
    );
    
    return c.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/auth/me (get current user info)
auth.get('/me', async (c) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Not authenticated' }, 401);
    }
    
    // Get full user info
    const users = await executeQuery<User>(
      'SELECT id, email, name, role, avatar_url, active, last_login FROM users WHERE id = $1',
      [user.userId]
    );
    
    if (users.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get user companies
    const userCompanies = await executeQuery<UserCompany & { company_name: string }>(
      `SELECT uc.*, c.name as company_name 
       FROM user_companies uc 
       JOIN companies c ON c.id = uc.company_id 
       WHERE uc.user_id = $1`,
      [user.userId]
    );
    
    return c.json({
      user: users[0],
      companies: userCompanies.map((uc) => ({
        id: uc.company_id,
        name: uc.company_name,
        role: uc.role
      }))
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;
