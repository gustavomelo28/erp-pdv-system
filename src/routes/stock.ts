// Stock management API routes
import { Hono } from 'hono';
import { executeQuery } from '../lib/db';
import { requireAuth } from '../middleware/auth';

const stock = new Hono();
stock.use('/*', requireAuth);

// GET /api/stock - Get stock balance with filters
stock.get('/', async (c) => {
  try {
    const user = c.get('user');
    const { branch_id, low_stock, search } = c.req.query();
    
    let whereClause = 'WHERE p.company_id = $1';
    const params: any[] = [user.companyId];
    let paramIndex = 2;
    
    if (branch_id) {
      whereClause += ` AND sb.branch_id = $${paramIndex}`;
      params.push(branch_id);
      paramIndex++;
    }
    
    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    const stockData = await executeQuery(
      `SELECT 
        p.id as product_id,
        p.sku,
        p.barcode,
        p.name as product_name,
        p.unit,
        p.min_stock,
        p.cost_price,
        p.sale_price,
        sb.branch_id,
        b.name as branch_name,
        sb.quantity,
        sb.last_movement,
        (sb.quantity * p.cost_price) as total_cost,
        (sb.quantity * p.sale_price) as total_value
      FROM products p
      LEFT JOIN stock_balance sb ON sb.product_id = p.id
      LEFT JOIN branches b ON b.id = sb.branch_id
      ${whereClause}
      ${low_stock === 'true' ? 'AND sb.quantity < p.min_stock' : ''}
      ORDER BY p.name`,
      params
    );
    
    return c.json({ data: stockData });
  } catch (error) {
    console.error('Get stock error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/stock/adjustment - Stock adjustment
stock.post('/adjustment', async (c) => {
  try {
    const user = c.get('user');
    const { product_id, branch_id, quantity, type, notes } = await c.req.json();
    
    // Update stock balance
    await executeQuery(
      `INSERT INTO stock_balance (product_id, branch_id, quantity, last_movement)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (product_id, branch_id)
      DO UPDATE SET quantity = stock_balance.quantity + $3, last_movement = CURRENT_TIMESTAMP`,
      [product_id, branch_id, quantity]
    );
    
    // Create movement record
    await executeQuery(
      `INSERT INTO stock_movements (product_id, branch_id, type, quantity, reference_type, notes, user_id)
      VALUES ($1, $2, $3, $4, 'adjustment', $5, $6)`,
      [product_id, branch_id, type, quantity, notes, user.userId]
    );
    
    // Log audit
    await executeQuery(
      `INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, new_data)
      VALUES ($1, $2, 'stock_adjustment', 'stock', $3, $4)`,
      [user.userId, user.companyId, product_id, JSON.stringify({ quantity, type, notes })]
    );
    
    return c.json({ message: 'Stock adjusted successfully' });
  } catch (error) {
    console.error('Stock adjustment error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/stock/movements - Get stock movements (kardex)
stock.get('/movements', async (c) => {
  try {
    const user = c.get('user');
    const { product_id, branch_id, start_date, end_date, type } = c.req.query();
    
    let whereClause = 'WHERE p.company_id = $1';
    const params: any[] = [user.companyId];
    let paramIndex = 2;
    
    if (product_id) {
      whereClause += ` AND sm.product_id = $${paramIndex}`;
      params.push(product_id);
      paramIndex++;
    }
    if (branch_id) {
      whereClause += ` AND sm.branch_id = $${paramIndex}`;
      params.push(branch_id);
      paramIndex++;
    }
    if (start_date) {
      whereClause += ` AND sm.created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      whereClause += ` AND sm.created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }
    if (type) {
      whereClause += ` AND sm.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    const movementsData = await executeQuery(
      `SELECT 
        sm.*,
        p.name as product_name,
        p.sku,
        b.name as branch_name,
        u.name as user_name
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      JOIN branches b ON b.id = sm.branch_id
      LEFT JOIN users u ON u.id = sm.user_id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT 100`,
      params
    );
    
    return c.json({ data: movementsData });
  } catch (error) {
    console.error('Get stock movements error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default stock;
