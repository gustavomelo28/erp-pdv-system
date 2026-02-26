-- Sistema ERP/PDV - Schema PostgreSQL
-- Autor: Claude Code
-- Data: 2026-02-26

-- ============================================
-- MÓDULO: EMPRESAS E FILIAIS (Multiempresa)
-- ============================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20) UNIQUE, -- CNPJ
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    logo_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    document VARCHAR(20), -- CNPJ da filial
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_main BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_company ON branches(company_id);

-- ============================================
-- MÓDULO: USUÁRIOS E PERMISSÕES (RBAC)
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'cashier', 'read_only');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'read_only',
    avatar_url TEXT,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Relacionamento usuário-empresa (um usuário pode estar em várias empresas)
CREATE TABLE user_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role user_role DEFAULT 'read_only',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

CREATE INDEX idx_user_companies_user ON user_companies(user_id);
CREATE INDEX idx_user_companies_company ON user_companies(company_id);

-- ============================================
-- MÓDULO: PRODUTOS E CATEGORIAS
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_company ON categories(company_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_company ON brands(company_id);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100), -- EAN/Código de barras
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    cost_price DECIMAL(15, 2) DEFAULT 0,
    sale_price DECIMAL(15, 2) NOT NULL,
    margin_percentage DECIMAL(5, 2), -- Calculado
    unit VARCHAR(50) DEFAULT 'UN', -- UN, KG, L, etc
    min_stock DECIMAL(15, 3) DEFAULT 0,
    max_stock DECIMAL(15, 3) DEFAULT 0,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);

-- ============================================
-- MÓDULO: CLIENTES E FORNECEDORES
-- ============================================

CREATE TYPE person_type AS ENUM ('customer', 'supplier', 'both');

CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type person_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20), -- CPF/CNPJ
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_persons_company ON persons(company_id);
CREATE INDEX idx_persons_type ON persons(type);
CREATE INDEX idx_persons_document ON persons(document);

-- ============================================
-- MÓDULO: ESTOQUE
-- ============================================

-- Saldo de estoque por produto e depósito (filial)
CREATE TABLE stock_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 3) DEFAULT 0,
    last_movement TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, branch_id)
);

CREATE INDEX idx_stock_balance_product ON stock_balance(product_id);
CREATE INDEX idx_stock_balance_branch ON stock_balance(branch_id);

-- Tipos de movimentação de estoque
CREATE TYPE stock_movement_type AS ENUM (
    'purchase',      -- Entrada por compra
    'sale',          -- Saída por venda
    'adjustment',    -- Ajuste manual
    'inventory',     -- Inventário
    'transfer_out',  -- Transferência saída
    'transfer_in',   -- Transferência entrada
    'return',        -- Devolução
    'loss'           -- Perda/quebra
);

-- Histórico de movimentações (Kardex)
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    type stock_movement_type NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL, -- Positivo=entrada, Negativo=saída
    unit_cost DECIMAL(15, 2),
    reference_type VARCHAR(50), -- 'sale', 'purchase', 'transfer', etc
    reference_id UUID, -- ID da venda, compra, transferência, etc
    notes TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_branch ON stock_movements(branch_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);

-- Transferências entre depósitos
CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    from_branch_id UUID NOT NULL REFERENCES branches(id),
    to_branch_id UUID NOT NULL REFERENCES branches(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed
    notes TEXT,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_transfers_from ON stock_transfers(from_branch_id);
CREATE INDEX idx_stock_transfers_to ON stock_transfers(to_branch_id);

CREATE TABLE stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 3) NOT NULL,
    unit_cost DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_transfer_items_transfer ON stock_transfer_items(transfer_id);

-- ============================================
-- MÓDULO: PDV E VENDAS
-- ============================================

CREATE TYPE payment_method AS ENUM ('cash', 'pix', 'debit_card', 'credit_card', 'mixed');
CREATE TYPE sale_status AS ENUM ('draft', 'completed', 'cancelled');

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    sale_number VARCHAR(50) UNIQUE NOT NULL, -- Número sequencial da venda
    customer_id UUID REFERENCES persons(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status sale_status DEFAULT 'completed',
    
    -- Valores
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    
    -- Pagamento
    payment_method payment_method NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL,
    change_amount DECIMAL(15, 2) DEFAULT 0,
    
    notes TEXT,
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_company ON sales(company_id);
CREATE INDEX idx_sales_branch ON sales(branch_id);
CREATE INDEX idx_sales_cashier ON sales(cashier_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_created ON sales(created_at);
CREATE INDEX idx_sales_number ON sales(sale_number);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    subtotal DECIMAL(15, 2) NOT NULL, -- quantity * unit_price
    total DECIMAL(15, 2) NOT NULL, -- subtotal - discount
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- Pagamentos mistos (quando usa mais de um método)
CREATE TABLE sale_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sale_payments_sale ON sale_payments(sale_id);

-- ============================================
-- MÓDULO: CAIXA (Fechamento de Caixa)
-- ============================================

CREATE TABLE cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opening_amount DECIMAL(15, 2) DEFAULT 0,
    closing_amount DECIMAL(15, 2),
    expected_amount DECIMAL(15, 2),
    difference DECIMAL(15, 2),
    
    -- Totalizadores
    total_sales DECIMAL(15, 2) DEFAULT 0,
    total_cash DECIMAL(15, 2) DEFAULT 0,
    total_pix DECIMAL(15, 2) DEFAULT 0,
    total_debit_card DECIMAL(15, 2) DEFAULT 0,
    total_credit_card DECIMAL(15, 2) DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'open', -- open, closed
    notes TEXT,
    
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cash_registers_branch ON cash_registers(branch_id);
CREATE INDEX idx_cash_registers_cashier ON cash_registers(cashier_id);
CREATE INDEX idx_cash_registers_status ON cash_registers(status);
CREATE INDEX idx_cash_registers_opened ON cash_registers(opened_at);

-- ============================================
-- MÓDULO: AUDITORIA
-- ============================================

CREATE TYPE audit_action AS ENUM (
    'create', 'update', 'delete',
    'login', 'logout',
    'sale_create', 'sale_cancel',
    'stock_adjustment', 'stock_transfer',
    'cash_register_open', 'cash_register_close'
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    action audit_action NOT NULL,
    entity_type VARCHAR(100), -- 'product', 'sale', 'user', etc
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON stock_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_registers_updated_at BEFORE UPDATE ON cash_registers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular margem de lucro
CREATE OR REPLACE FUNCTION calculate_product_margin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cost_price > 0 AND NEW.sale_price > 0 THEN
        NEW.margin_percentage = ((NEW.sale_price - NEW.cost_price) / NEW.cost_price) * 100;
    ELSE
        NEW.margin_percentage = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_product_margin_trigger 
BEFORE INSERT OR UPDATE ON products 
FOR EACH ROW EXECUTE FUNCTION calculate_product_margin();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de estoque com informações do produto
CREATE VIEW v_stock_full AS
SELECT 
    sb.id,
    sb.product_id,
    p.sku,
    p.barcode,
    p.name AS product_name,
    p.unit,
    sb.branch_id,
    b.name AS branch_name,
    sb.quantity,
    p.min_stock,
    p.max_stock,
    p.cost_price,
    p.sale_price,
    (sb.quantity * p.cost_price) AS total_cost_value,
    (sb.quantity * p.sale_price) AS total_sale_value,
    sb.last_movement,
    sb.updated_at
FROM stock_balance sb
JOIN products p ON p.id = sb.product_id
JOIN branches b ON b.id = sb.branch_id;

-- View de vendas com resumo
CREATE VIEW v_sales_summary AS
SELECT 
    s.id,
    s.sale_number,
    s.created_at,
    s.branch_id,
    b.name AS branch_name,
    s.cashier_id,
    u.name AS cashier_name,
    s.customer_id,
    per.name AS customer_name,
    s.subtotal,
    s.discount_amount,
    s.total,
    s.payment_method,
    s.status,
    COUNT(si.id) AS total_items
FROM sales s
JOIN branches b ON b.id = s.branch_id
LEFT JOIN users u ON u.id = s.cashier_id
LEFT JOIN persons per ON per.id = s.customer_id
LEFT JOIN sale_items si ON si.sale_id = s.id
GROUP BY s.id, b.name, u.name, per.name;

-- View de produtos com estoque baixo
CREATE VIEW v_low_stock_products AS
SELECT 
    p.id,
    p.sku,
    p.barcode,
    p.name,
    p.company_id,
    c.name AS company_name,
    sb.branch_id,
    b.name AS branch_name,
    sb.quantity,
    p.min_stock,
    (p.min_stock - sb.quantity) AS deficit
FROM products p
JOIN companies c ON c.id = p.company_id
JOIN stock_balance sb ON sb.product_id = p.id
JOIN branches b ON b.id = sb.branch_id
WHERE sb.quantity < p.min_stock
AND p.active = true;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE companies IS 'Empresas (multiempresa)';
COMMENT ON TABLE branches IS 'Filiais/depósitos de cada empresa';
COMMENT ON TABLE users IS 'Usuários do sistema';
COMMENT ON TABLE user_companies IS 'Relacionamento N:N entre usuários e empresas';
COMMENT ON TABLE products IS 'Produtos cadastrados';
COMMENT ON TABLE categories IS 'Categorias de produtos (hierárquica)';
COMMENT ON TABLE brands IS 'Marcas de produtos';
COMMENT ON TABLE persons IS 'Clientes e fornecedores';
COMMENT ON TABLE stock_balance IS 'Saldo de estoque atual por produto e depósito';
COMMENT ON TABLE stock_movements IS 'Histórico de movimentações (Kardex)';
COMMENT ON TABLE stock_transfers IS 'Transferências entre depósitos';
COMMENT ON TABLE sales IS 'Vendas realizadas';
COMMENT ON TABLE sale_items IS 'Itens das vendas';
COMMENT ON TABLE sale_payments IS 'Pagamentos de vendas (para pagamentos mistos)';
COMMENT ON TABLE cash_registers IS 'Fechamento de caixa por operador';
COMMENT ON TABLE audit_logs IS 'Log de auditoria de ações do sistema';
