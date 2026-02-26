// Products API routes
import { Hono } from 'hono';
import { executeQuery } from '../lib/db';
import { requireAuth } from '../middleware/auth';
import type { Product, CreateProductRequest, PaginatedResponse } from '../types';

const products = new Hono();

// Apply auth middleware to all routes
products.use('/*', requireAuth);

// GET /api/products - List products with pagination
products.get('/', async (c) => {
  try {
    const user = c.get('user');
    const { page = '1', limit = '20', search = '', sort_by = 'name', sort_order = 'asc' } = c.req.query();
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchPattern = `%${search}%`;
    
    // Get products with category and brand names
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name,
        COALESCE(SUM(sb.quantity), 0) as total_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN stock_balance sb ON sb.product_id = p.id
      WHERE p.company_id = $1
      AND (p.name ILIKE $2 OR p.sku ILIKE $2 OR p.barcode ILIKE $2)
      GROUP BY p.id, c.name, b.name
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $3 OFFSET $4
    `;
    
    const productsList = await executeQuery<Product>(
      productsQuery,
      [user.companyId, searchPattern, parseInt(limit), offset]
    );
    
    // Get total count
    const countResult = await executeQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM products 
       WHERE company_id = $1 
       AND (name ILIKE $2 OR sku ILIKE $2 OR barcode ILIKE $2)`,
      [user.companyId, searchPattern]
    );
    
    const total = parseInt(countResult[0].count);
    
    const response: PaginatedResponse<Product> = {
      data: productsList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit))
      }
    };
    
    return c.json(response);
  } catch (error) {
    console.error('List products error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/products/:id - Get single product
products.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    
    const productsData = await executeQuery<Product>(
      `SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.id = $1 AND p.company_id = $2`,
      [id, user.companyId]
    );
    
    if (productsData.length === 0) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Get stock balance by branch
    const stockData = await executeQuery(
      `SELECT 
        sb.branch_id,
        br.name as branch_name,
        sb.quantity,
        sb.last_movement
      FROM stock_balance sb
      JOIN branches br ON br.id = sb.branch_id
      WHERE sb.product_id = $1`,
      [id]
    );
    
    return c.json({
      product: productsData[0],
      stock: stockData
    });
  } catch (error) {
    console.error('Get product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/products - Create product
products.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body: CreateProductRequest = await c.req.json();
    
    const {
      sku,
      barcode,
      name,
      description,
      category_id,
      brand_id,
      cost_price,
      sale_price,
      unit = 'UN',
      min_stock = 0,
      max_stock = 0,
      image_url
    } = body;
    
    // Validate required fields
    if (!sku || !name || sale_price === undefined) {
      return c.json({ error: 'SKU, name and sale_price are required' }, 400);
    }
    
    // Check if SKU already exists
    const existingProducts = await executeQuery<Product>(
      'SELECT id FROM products WHERE company_id = $1 AND sku = $2',
      [user.companyId, sku]
    );
    
    if (existingProducts.length > 0) {
      return c.json({ error: 'SKU already exists' }, 400);
    }
    
    // Create product
    const newProducts = await executeQuery<Product>(
      `INSERT INTO products (
        company_id, sku, barcode, name, description, category_id, brand_id,
        cost_price, sale_price, unit, min_stock, max_stock, image_url, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
      RETURNING *`,
      [
        user.companyId, sku, barcode, name, description, category_id, brand_id,
        cost_price || 0, sale_price, unit, min_stock, max_stock, image_url
      ]
    );
    
    // Log audit
    await executeQuery(
      `INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, new_data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.userId, user.companyId, 'create', 'product', newProducts[0].id, JSON.stringify(newProducts[0])]
    );
    
    return c.json(newProducts[0], 201);
  } catch (error) {
    console.error('Create product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /api/products/:id - Update product
products.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const body: Partial<CreateProductRequest> = await c.req.json();
    
    // Get current product for audit
    const currentProducts = await executeQuery<Product>(
      'SELECT * FROM products WHERE id = $1 AND company_id = $2',
      [id, user.companyId]
    );
    
    if (currentProducts.length === 0) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'company_id') {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    values.push(id, user.companyId);
    const updateQuery = `
      UPDATE products 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
      RETURNING *
    `;
    
    const updatedProducts = await executeQuery<Product>(updateQuery, values);
    
    // Log audit
    await executeQuery(
      `INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, old_data, new_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.userId, user.companyId, 'update', 'product', id,
        JSON.stringify(currentProducts[0]), JSON.stringify(updatedProducts[0])
      ]
    );
    
    return c.json(updatedProducts[0]);
  } catch (error) {
    console.error('Update product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /api/products/:id - Soft delete product
products.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    
    // Get current product for audit
    const currentProducts = await executeQuery<Product>(
      'SELECT * FROM products WHERE id = $1 AND company_id = $2',
      [id, user.companyId]
    );
    
    if (currentProducts.length === 0) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Soft delete (set active = false)
    await executeQuery(
      'UPDATE products SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    // Log audit
    await executeQuery(
      `INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, old_data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.userId, user.companyId, 'delete', 'product', id, JSON.stringify(currentProducts[0])]
    );
    
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/products/barcode/:barcode - Find product by barcode (for POS)
products.get('/barcode/:barcode', async (c) => {
  try {
    const user = c.get('user');
    const { barcode } = c.req.param();
    
    const productsData = await executeQuery<Product>(
      `SELECT 
        p.*,
        c.name as category_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.barcode = $1 AND p.company_id = $2 AND p.active = true`,
      [barcode, user.companyId]
    );
    
    if (productsData.length === 0) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json(productsData[0]);
  } catch (error) {
    console.error('Find product by barcode error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default products;
