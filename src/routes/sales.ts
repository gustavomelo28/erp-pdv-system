// Sales/POS API routes
import { Hono } from 'hono';
import { executeQuery } from '../lib/db';
import { requireAuth } from '../middleware/auth';
import type { Sale, SaleItem, CreateSaleRequest } from '../types';

const sales = new Hono();
sales.use('/*', requireAuth);

// POST /api/sales - Create new sale
sales.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body: CreateSaleRequest = await c.req.json();
    const { customer_id, branch_id, items, discount_amount = 0, discount_percentage = 0, payment_method, amount_paid, payments, notes } = body;
    
    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemDiscount = item.discount_amount || (itemSubtotal * (item.discount_percentage || 0) / 100);
      subtotal += itemSubtotal - itemDiscount;
    });
    
    const saleDiscountAmount = discount_amount || (subtotal * discount_percentage / 100);
    const total = subtotal - saleDiscountAmount;
    const change = amount_paid - total;
    
    // Generate sale number
    const saleNumberResult = await executeQuery<{ count: string }>(
      'SELECT COUNT(*) as count FROM sales WHERE company_id = $1',
      [user.companyId]
    );
    const saleNumber = `VND-${String(parseInt(saleNumberResult[0].count) + 1).padStart(5, '0')}`;
    
    // Create sale
    const newSales = await executeQuery<Sale>(
      `INSERT INTO sales (company_id, branch_id, sale_number, customer_id, cashier_id, status, 
       subtotal, discount_amount, discount_percentage, total, payment_method, amount_paid, change_amount, notes)
      VALUES ($1, $2, $3, $4, $5, 'completed', $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [user.companyId, branch_id, saleNumber, customer_id, user.userId, subtotal, saleDiscountAmount, discount_percentage, total, payment_method, amount_paid, change, notes]
    );
    
    const saleId = newSales[0].id;
    
    // Create sale items and update stock
    for (const item of items) {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemDiscount = item.discount_amount || (itemSubtotal * (item.discount_percentage || 0) / 100);
      const itemTotal = itemSubtotal - itemDiscount;
      
      await executeQuery(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, discount_percentage, subtotal, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.discount_amount || 0, item.discount_percentage || 0, itemSubtotal, itemTotal]
      );
      
      // Update stock balance
      await executeQuery(
        `UPDATE stock_balance SET quantity = quantity - $1, last_movement = CURRENT_TIMESTAMP 
        WHERE product_id = $2 AND branch_id = $3`,
        [item.quantity, item.product_id, branch_id]
      );
      
      // Create stock movement
      await executeQuery(
        `INSERT INTO stock_movements (product_id, branch_id, type, quantity, unit_cost, reference_type, reference_id, user_id)
        VALUES ($1, $2, 'sale', $3, $4, 'sale', $5, $6)`,
        [item.product_id, branch_id, -item.quantity, item.unit_price, saleId, user.userId]
      );
    }
    
    // Handle mixed payments
    if (payment_method === 'mixed' && payments) {
      for (const payment of payments) {
        await executeQuery(
          `INSERT INTO sale_payments (sale_id, payment_method, amount) VALUES ($1, $2, $3)`,
          [saleId, payment.payment_method, payment.amount]
        );
      }
    }
    
    // Log audit
    await executeQuery(
      `INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, new_data)
      VALUES ($1, $2, 'sale_create', 'sale', $3, $4)`,
      [user.userId, user.companyId, saleId, JSON.stringify({ sale_number: saleNumber, total })]
    );
    
    return c.json(newSales[0], 201);
  } catch (error) {
    console.error('Create sale error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/sales - List sales
sales.get('/', async (c) => {
  try {
    const user = c.get('user');
    const { page = '1', limit = '20', start_date, end_date, branch_id, status } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = 'WHERE s.company_id = $1';
    const params: any[] = [user.companyId];
    let paramIndex = 2;
    
    if (start_date) {
      whereClause += ` AND s.created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      whereClause += ` AND s.created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }
    if (branch_id) {
      whereClause += ` AND s.branch_id = $${paramIndex}`;
      params.push(branch_id);
      paramIndex++;
    }
    if (status) {
      whereClause += ` AND s.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    const salesData = await executeQuery(
      `SELECT s.*, b.name as branch_name, u.name as cashier_name, p.name as customer_name
      FROM sales s
      JOIN branches b ON b.id = s.branch_id
      LEFT JOIN users u ON u.id = s.cashier_id
      LEFT JOIN persons p ON p.id = s.customer_id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );
    
    return c.json({ data: salesData });
  } catch (error) {
    console.error('List sales error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/sales/:id - Get sale details
sales.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    
    const saleData = await executeQuery(
      `SELECT s.*, b.name as branch_name, u.name as cashier_name, p.name as customer_name
      FROM sales s
      JOIN branches b ON b.id = s.branch_id
      LEFT JOIN users u ON u.id = s.cashier_id
      LEFT JOIN persons p ON p.id = s.customer_id
      WHERE s.id = $1 AND s.company_id = $2`,
      [id, user.companyId]
    );
    
    if (saleData.length === 0) {
      return c.json({ error: 'Sale not found' }, 404);
    }
    
    const itemsData = await executeQuery(
      `SELECT si.*, pr.name as product_name, pr.sku, pr.barcode
      FROM sale_items si
      JOIN products pr ON pr.id = si.product_id
      WHERE si.sale_id = $1`,
      [id]
    );
    
    const paymentsData = await executeQuery(
      'SELECT * FROM sale_payments WHERE sale_id = $1',
      [id]
    );
    
    return c.json({
      sale: saleData[0],
      items: itemsData,
      payments: paymentsData
    });
  } catch (error) {
    console.error('Get sale error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default sales;
