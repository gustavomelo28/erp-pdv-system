// TypeScript types for the ERP/POS system

// Database enums
export type UserRole = 'admin' | 'manager' | 'cashier' | 'read_only';
export type PersonType = 'customer' | 'supplier' | 'both';
export type StockMovementType = 
  | 'purchase' 
  | 'sale' 
  | 'adjustment' 
  | 'inventory' 
  | 'transfer_out' 
  | 'transfer_in' 
  | 'return' 
  | 'loss';
export type PaymentMethod = 'cash' | 'pix' | 'debit_card' | 'credit_card' | 'mixed';
export type SaleStatus = 'draft' | 'completed' | 'cancelled';
export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'sale_create' 
  | 'sale_cancel' 
  | 'stock_adjustment' 
  | 'stock_transfer'
  | 'cash_register_open'
  | 'cash_register_close';

// Entity interfaces
export interface Company {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_main: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  active: boolean;
  last_login?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: UserRole;
  created_at: Date;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Brand {
  id: string;
  company_id: string;
  name: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  company_id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  cost_price: number;
  sale_price: number;
  margin_percentage?: number;
  unit: string;
  min_stock: number;
  max_stock: number;
  image_url?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Person {
  id: string;
  company_id: string;
  type: PersonType;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StockBalance {
  id: string;
  product_id: string;
  branch_id: string;
  quantity: number;
  last_movement?: Date;
  updated_at: Date;
}

export interface StockMovement {
  id: string;
  product_id: string;
  branch_id: string;
  type: StockMovementType;
  quantity: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  user_id?: string;
  created_at: Date;
}

export interface Sale {
  id: string;
  company_id: string;
  branch_id: string;
  sale_number: string;
  customer_id?: string;
  cashier_id?: string;
  status: SaleStatus;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  total: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  change_amount: number;
  notes?: string;
  cancelled_at?: Date;
  cancelled_by?: string;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_percentage: number;
  subtotal: number;
  total: number;
  created_at: Date;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_method: PaymentMethod;
  amount: number;
  created_at: Date;
}

export interface CashRegister {
  id: string;
  branch_id: string;
  cashier_id: string;
  opening_amount: number;
  closing_amount?: number;
  expected_amount?: number;
  difference?: number;
  total_sales: number;
  total_cash: number;
  total_pix: number;
  total_debit_card: number;
  total_credit_card: number;
  status: 'open' | 'closed';
  notes?: string;
  opened_at: Date;
  closed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  company_id?: string;
  action: AuditAction;
  entity_type?: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  companies: Array<{
    id: string;
    name: string;
    role: UserRole;
  }>;
}

export interface CreateProductRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  cost_price: number;
  sale_price: number;
  unit?: string;
  min_stock?: number;
  max_stock?: number;
  image_url?: string;
}

export interface CreateSaleRequest {
  customer_id?: string;
  branch_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    discount_percentage?: number;
  }>;
  discount_amount?: number;
  discount_percentage?: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  payments?: Array<{
    payment_method: PaymentMethod;
    amount: number;
  }>;
  notes?: string;
}

export interface StockAdjustmentRequest {
  product_id: string;
  branch_id: string;
  quantity: number;
  type: StockMovementType;
  notes?: string;
}

export interface TransferRequest {
  from_branch_id: string;
  to_branch_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface ReportFilter {
  start_date?: string;
  end_date?: string;
  branch_id?: string;
  product_id?: string;
  category_id?: string;
  cashier_id?: string;
  customer_id?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
