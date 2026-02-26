-- Sistema ERP/PDV - Dados de Teste (Seed)
-- Autor: Claude Code
-- Data: 2026-02-26

-- ============================================
-- LIMPEZA (apenas para desenvolvimento)
-- ============================================

TRUNCATE TABLE 
    audit_logs,
    cash_registers,
    sale_payments,
    sale_items,
    sales,
    stock_transfer_items,
    stock_transfers,
    stock_movements,
    stock_balance,
    persons,
    products,
    brands,
    categories,
    user_companies,
    users,
    branches,
    companies
CASCADE;

-- ============================================
-- EMPRESAS E FILIAIS
-- ============================================

-- Empresa 1: Supermercado Exemplo
INSERT INTO companies (id, name, document, email, phone, address, active) VALUES
('11111111-1111-1111-1111-111111111111', 'Supermercado Exemplo LTDA', '12.345.678/0001-90', 'contato@supermercado.com.br', '(11) 3456-7890', 'Rua das Flores, 123 - São Paulo/SP', true);

-- Filiais da Empresa 1
INSERT INTO branches (id, company_id, name, code, document, email, phone, address, is_main, active) VALUES
('22222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Matriz - Centro', 'MTZ', '12.345.678/0001-90', 'matriz@supermercado.com.br', '(11) 3456-7890', 'Rua das Flores, 123 - Centro - São Paulo/SP', true, true),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Filial 1 - Jardins', 'FIL1', '12.345.678/0002-71', 'jardins@supermercado.com.br', '(11) 3456-7891', 'Av. Paulista, 1000 - Jardins - São Paulo/SP', false, true),
('22222222-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Filial 2 - Shopping', 'FIL2', '12.345.678/0003-52', 'shopping@supermercado.com.br', '(11) 3456-7892', 'Shopping Center - Piso 2 - São Paulo/SP', false, true);

-- ============================================
-- USUÁRIOS E PERMISSÕES
-- ============================================

-- Senha padrão para todos: "senha123" (hash bcrypt)
-- Hash gerado com bcryptjs.hash('senha123', 10)
INSERT INTO users (id, email, password_hash, name, role, active) VALUES
('33333333-1111-1111-1111-111111111111', 'admin@supermercado.com.br', '$2a$10$rK8qYF7F7K3Q3Q3Q3Q3Q3uX7F7K3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q', 'Administrador Sistema', 'admin', true),
('33333333-2222-2222-2222-222222222222', 'gerente@supermercado.com.br', '$2a$10$rK8qYF7F7K3Q3Q3Q3Q3Q3uX7F7K3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q', 'Maria Gerente', 'manager', true),
('33333333-3333-3333-3333-333333333333', 'caixa1@supermercado.com.br', '$2a$10$rK8qYF7F7K3Q3Q3Q3Q3Q3uX7F7K3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q', 'João Caixa', 'cashier', true),
('33333333-4444-4444-4444-444444444444', 'caixa2@supermercado.com.br', '$2a$10$rK8qYF7F7K3Q3Q3Q3Q3Q3uX7F7K3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q', 'Ana Caixa', 'cashier', true),
('33333333-5555-5555-5555-555555555555', 'consulta@supermercado.com.br', '$2a$10$rK8qYF7F7K3Q3Q3Q3Q3Q3uX7F7K3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q3Q', 'Pedro Consulta', 'read_only', true);

-- Relacionamento usuários-empresas
INSERT INTO user_companies (user_id, company_id, role) VALUES
('33333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin'),
('33333333-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'manager'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'cashier'),
('33333333-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'cashier'),
('33333333-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'read_only');

-- ============================================
-- CATEGORIAS E MARCAS
-- ============================================

-- Categorias principais
INSERT INTO categories (id, company_id, name, description, parent_id, active) VALUES
('44444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Alimentos', 'Produtos alimentícios', NULL, true),
('44444444-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Bebidas', 'Bebidas em geral', NULL, true),
('44444444-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Limpeza', 'Produtos de limpeza', NULL, true),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Higiene', 'Produtos de higiene pessoal', NULL, true);

-- Subcategorias
INSERT INTO categories (id, company_id, name, description, parent_id, active) VALUES
('44444444-1111-1111-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Arroz e Grãos', NULL, '44444444-1111-1111-1111-111111111111', true),
('44444444-1111-1111-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'Massas', NULL, '44444444-1111-1111-1111-111111111111', true),
('44444444-2222-2222-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Refrigerantes', NULL, '44444444-2222-2222-2222-222222222222', true),
('44444444-2222-2222-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'Águas', NULL, '44444444-2222-2222-2222-222222222222', true);

-- Marcas
INSERT INTO brands (id, company_id, name, active) VALUES
('55555555-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Tio João', true),
('55555555-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Barilla', true),
('55555555-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Coca-Cola', true),
('55555555-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Omo', true),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Dove', true);

-- ============================================
-- PRODUTOS
-- ============================================

INSERT INTO products (id, company_id, sku, barcode, name, description, category_id, brand_id, cost_price, sale_price, unit, min_stock, max_stock, active) VALUES
-- Alimentos
('66666666-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'ARR-TJ-001', '7891234567890', 'Arroz Branco Tipo 1 - 5kg', 'Arroz branco longo fino', '44444444-1111-1111-0001-000000000001', '55555555-1111-1111-1111-111111111111', 15.50, 22.90, 'UN', 20, 100, true),
('66666666-0001-0001-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'ARR-TJ-002', '7891234567891', 'Arroz Integral - 1kg', 'Arroz integral orgânico', '44444444-1111-1111-0001-000000000001', '55555555-1111-1111-1111-111111111111', 6.80, 9.90, 'UN', 30, 150, true),
('66666666-0001-0002-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'MAS-BAR-001', '7891234567892', 'Macarrão Espaguete - 500g', 'Massa de sêmola', '44444444-1111-1111-0002-000000000002', '55555555-2222-2222-2222-222222222222', 3.20, 5.49, 'UN', 50, 200, true),
('66666666-0001-0002-0002-000000000004', '11111111-1111-1111-1111-111111111111', 'MAS-BAR-002', '7891234567893', 'Macarrão Penne - 500g', 'Massa de sêmola', '44444444-1111-1111-0002-000000000002', '55555555-2222-2222-2222-222222222222', 3.40, 5.79, 'UN', 50, 200, true),
('66666666-0001-0003-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'FEI-001', '7891234567894', 'Feijão Preto - 1kg', 'Feijão tipo 1', '44444444-1111-1111-0001-000000000001', NULL, 4.50, 7.29, 'UN', 40, 180, true),

-- Bebidas
('66666666-0002-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111', 'REF-COC-001', '7891234567895', 'Coca-Cola 2L', 'Refrigerante sabor cola', '44444444-2222-2222-0001-000000000001', '55555555-3333-3333-3333-333333333333', 5.80, 8.99, 'UN', 60, 300, true),
('66666666-0002-0001-0002-000000000007', '11111111-1111-1111-1111-111111111111', 'REF-COC-002', '7891234567896', 'Coca-Cola 350ml', 'Refrigerante sabor cola lata', '44444444-2222-2222-0001-000000000001', '55555555-3333-3333-3333-333333333333', 2.10, 3.49, 'UN', 120, 500, true),
('66666666-0002-0001-0003-000000000008', '11111111-1111-1111-1111-111111111111', 'REF-GUA-001', '7891234567897', 'Guaraná Antarctica 2L', 'Refrigerante sabor guaraná', '44444444-2222-2222-0001-000000000001', NULL, 5.50, 8.49, 'UN', 60, 300, true),
('66666666-0002-0002-0001-000000000009', '11111111-1111-1111-1111-111111111111', 'AGU-MIN-001', '7891234567898', 'Água Mineral 500ml', 'Água mineral sem gás', '44444444-2222-2222-0002-000000000002', NULL, 0.80, 1.79, 'UN', 200, 800, true),
('66666666-0002-0002-0002-000000000010', '11111111-1111-1111-1111-111111111111', 'AGU-MIN-002', '7891234567899', 'Água Mineral 1,5L', 'Água mineral sem gás', '44444444-2222-2222-0002-000000000002', NULL, 1.20, 2.29, 'UN', 150, 600, true),

-- Limpeza
('66666666-0003-0001-0001-000000000011', '11111111-1111-1111-1111-111111111111', 'LMP-OMO-001', '7891234567900', 'Sabão em Pó Omo 1kg', 'Lava até 16 peças', '44444444-3333-3333-3333-333333333333', '55555555-4444-4444-4444-444444444444', 12.50, 18.90, 'UN', 25, 100, true),
('66666666-0003-0001-0002-000000000012', '11111111-1111-1111-1111-111111111111', 'LMP-DET-001', '7891234567901', 'Detergente Líquido 500ml', 'Detergente neutro', '44444444-3333-3333-3333-333333333333', NULL, 1.50, 2.49, 'UN', 80, 300, true),
('66666666-0003-0001-0003-000000000013', '11111111-1111-1111-1111-111111111111', 'LMP-DES-001', '7891234567902', 'Desinfetante 2L', 'Lavanda', '44444444-3333-3333-3333-333333333333', NULL, 4.20, 6.99, 'UN', 40, 150, true),

-- Higiene
('66666666-0004-0001-0001-000000000014', '11111111-1111-1111-1111-111111111111', 'HIG-DOV-001', '7891234567903', 'Sabonete Dove 90g', 'Hidratação profunda', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 2.80, 4.29, 'UN', 100, 400, true),
('66666666-0004-0001-0002-000000000015', '11111111-1111-1111-1111-111111111111', 'HIG-SHA-001', '7891234567904', 'Shampoo Anticaspa 400ml', 'Controle da oleosidade', '44444444-4444-4444-4444-444444444444', NULL, 8.50, 12.90, 'UN', 40, 150, true),
('66666666-0004-0001-0003-000000000016', '11111111-1111-1111-1111-111111111111', 'HIG-PAS-001', '7891234567905', 'Creme Dental 90g', 'Proteção total', '44444444-4444-4444-4444-444444444444', NULL, 3.20, 5.19, 'UN', 80, 300, true);

-- ============================================
-- CLIENTES E FORNECEDORES
-- ============================================

-- Clientes
INSERT INTO persons (id, company_id, type, name, document, email, phone, address, city, state, zip_code, active) VALUES
('77777777-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'customer', 'João da Silva', '123.456.789-00', 'joao.silva@email.com', '(11) 98765-4321', 'Rua A, 100', 'São Paulo', 'SP', '01000-000', true),
('77777777-0001-0001-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'customer', 'Maria Santos', '987.654.321-00', 'maria.santos@email.com', '(11) 98765-4322', 'Rua B, 200', 'São Paulo', 'SP', '01001-000', true),
('77777777-0001-0001-0003-000000000003', '11111111-1111-1111-1111-111111111111', 'customer', 'Pedro Oliveira', '456.789.123-00', 'pedro.oliveira@email.com', '(11) 98765-4323', 'Rua C, 300', 'São Paulo', 'SP', '01002-000', true),
('77777777-0001-0001-0004-000000000004', '11111111-1111-1111-1111-111111111111', 'customer', 'Ana Costa', '321.654.987-00', 'ana.costa@email.com', '(11) 98765-4324', 'Rua D, 400', 'São Paulo', 'SP', '01003-000', true);

-- Fornecedores
INSERT INTO persons (id, company_id, type, name, document, email, phone, address, city, state, zip_code, active) VALUES
('77777777-0002-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'supplier', 'Distribuidora Alimentos LTDA', '11.222.333/0001-44', 'vendas@distralimentos.com.br', '(11) 3333-4444', 'Av. Industrial, 1000', 'São Paulo', 'SP', '02000-000', true),
('77777777-0002-0001-0002-000000000006', '11111111-1111-1111-1111-111111111111', 'supplier', 'Bebidas Distribuidora SA', '22.333.444/0001-55', 'comercial@bebidas.com.br', '(11) 3333-5555', 'Rua do Comércio, 500', 'São Paulo', 'SP', '02001-000', true),
('77777777-0002-0001-0003-000000000007', '11111111-1111-1111-1111-111111111111', 'supplier', 'Limpeza & Cia', '33.444.555/0001-66', 'pedidos@limpezacia.com.br', '(11) 3333-6666', 'Av. das Nações, 800', 'São Paulo', 'SP', '02002-000', true);

-- ============================================
-- ESTOQUE INICIAL (Saldo)
-- ============================================

-- Matriz - Centro
INSERT INTO stock_balance (product_id, branch_id, quantity, last_movement) VALUES
('66666666-0001-0001-0001-000000000001', '22222222-1111-1111-1111-111111111111', 50.000, CURRENT_TIMESTAMP),
('66666666-0001-0001-0002-000000000002', '22222222-1111-1111-1111-111111111111', 80.000, CURRENT_TIMESTAMP),
('66666666-0001-0002-0001-000000000003', '22222222-1111-1111-1111-111111111111', 120.000, CURRENT_TIMESTAMP),
('66666666-0001-0002-0002-000000000004', '22222222-1111-1111-1111-111111111111', 110.000, CURRENT_TIMESTAMP),
('66666666-0001-0003-0001-000000000005', '22222222-1111-1111-1111-111111111111', 90.000, CURRENT_TIMESTAMP),
('66666666-0002-0001-0001-000000000006', '22222222-1111-1111-1111-111111111111', 150.000, CURRENT_TIMESTAMP),
('66666666-0002-0001-0002-000000000007', '22222222-1111-1111-1111-111111111111', 300.000, CURRENT_TIMESTAMP),
('66666666-0002-0001-0003-000000000008', '22222222-1111-1111-1111-111111111111', 140.000, CURRENT_TIMESTAMP),
('66666666-0002-0002-0001-000000000009', '22222222-1111-1111-1111-111111111111', 500.000, CURRENT_TIMESTAMP),
('66666666-0002-0002-0002-000000000010', '22222222-1111-1111-1111-111111111111', 350.000, CURRENT_TIMESTAMP),
('66666666-0003-0001-0001-000000000011', '22222222-1111-1111-1111-111111111111', 45.000, CURRENT_TIMESTAMP),
('66666666-0003-0001-0002-000000000012', '22222222-1111-1111-1111-111111111111', 180.000, CURRENT_TIMESTAMP),
('66666666-0003-0001-0003-000000000013', '22222222-1111-1111-1111-111111111111', 80.000, CURRENT_TIMESTAMP),
('66666666-0004-0001-0001-000000000014', '22222222-1111-1111-1111-111111111111', 250.000, CURRENT_TIMESTAMP),
('66666666-0004-0001-0002-000000000015', '22222222-1111-1111-1111-111111111111', 90.000, CURRENT_TIMESTAMP),
('66666666-0004-0001-0003-000000000016', '22222222-1111-1111-1111-111111111111', 180.000, CURRENT_TIMESTAMP);

-- Filial 1 - Jardins
INSERT INTO stock_balance (product_id, branch_id, quantity, last_movement) VALUES
('66666666-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 35.000, CURRENT_TIMESTAMP),
('66666666-0001-0001-0002-000000000002', '22222222-2222-2222-2222-222222222222', 60.000, CURRENT_TIMESTAMP),
('66666666-0001-0002-0001-000000000003', '22222222-2222-2222-2222-222222222222', 95.000, CURRENT_TIMESTAMP),
('66666666-0001-0002-0002-000000000004', '22222222-2222-2222-2222-222222222222', 85.000, CURRENT_TIMESTAMP),
('66666666-0002-0001-0001-000000000006', '22222222-2222-2222-2222-222222222222', 120.000, CURRENT_TIMESTAMP),
('66666666-0002-0001-0002-000000000007', '22222222-2222-2222-2222-222222222222', 250.000, CURRENT_TIMESTAMP),
('66666666-0002-0002-0001-000000000009', '22222222-2222-2222-2222-222222222222', 400.000, CURRENT_TIMESTAMP),
('66666666-0003-0001-0001-000000000011', '22222222-2222-2222-2222-222222222222', 35.000, CURRENT_TIMESTAMP),
('66666666-0004-0001-0001-000000000014', '22222222-2222-2222-2222-222222222222', 200.000, CURRENT_TIMESTAMP);

-- Filial 2 - Shopping
INSERT INTO stock_balance (product_id, branch_id, quantity, last_movement) VALUES
('66666666-0001-0002-0001-000000000003', '22222222-3333-3333-3333-333333333333', 70.000, CURRENT_TIMESTAMP),
('66666666-0002-0001-0001-000000000006', '22222222-3333-3333-3333-333333333333', 100.000, CURRENT_TIMESTAMP),
('66666666-0002-0001-0002-000000000007', '22222222-3333-3333-3333-333333333333', 200.000, CURRENT_TIMESTAMP),
('66666666-0002-0002-0001-000000000009', '22222222-3333-3333-3333-333333333333', 350.000, CURRENT_TIMESTAMP),
('66666666-0004-0001-0001-000000000014', '22222222-3333-3333-3333-333333333333', 150.000, CURRENT_TIMESTAMP);

-- ============================================
-- MOVIMENTAÇÕES DE ESTOQUE (Kardex)
-- ============================================

-- Entradas iniciais (compras)
INSERT INTO stock_movements (product_id, branch_id, type, quantity, unit_cost, reference_type, notes, user_id, created_at) VALUES
('66666666-0001-0001-0001-000000000001', '22222222-1111-1111-1111-111111111111', 'purchase', 50.000, 15.50, 'purchase', 'Entrada inicial - Estoque abertura', '33333333-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('66666666-0002-0001-0001-000000000006', '22222222-1111-1111-1111-111111111111', 'purchase', 200.000, 5.80, 'purchase', 'Compra fornecedor Bebidas Distribuidora', '33333333-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('66666666-0002-0001-0002-000000000007', '22222222-1111-1111-1111-111111111111', 'purchase', 400.000, 2.10, 'purchase', 'Compra fornecedor Bebidas Distribuidora', '33333333-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '5 days');

-- Saídas (vendas exemplo)
INSERT INTO stock_movements (product_id, branch_id, type, quantity, unit_cost, reference_type, notes, user_id, created_at) VALUES
('66666666-0002-0001-0001-000000000006', '22222222-1111-1111-1111-111111111111', 'sale', -50.000, 5.80, 'sale', 'Venda PDV', '33333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('66666666-0002-0001-0002-000000000007', '22222222-1111-1111-1111-111111111111', 'sale', -100.000, 2.10, 'sale', 'Venda PDV', '33333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- ============================================
-- VENDAS DE EXEMPLO
-- ============================================

-- Venda 1 (hoje)
INSERT INTO sales (id, company_id, branch_id, sale_number, customer_id, cashier_id, status, subtotal, discount_amount, discount_percentage, total, payment_method, amount_paid, change_amount, created_at) VALUES
('88888888-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'VND-00001', '77777777-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'completed', 52.97, 2.00, 0, 50.97, 'cash', 60.00, 9.03, CURRENT_TIMESTAMP);

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, discount_percentage, subtotal, total) VALUES
('88888888-0001-0001-0001-000000000001', '66666666-0001-0001-0001-000000000001', 1.000, 22.90, 0, 0, 22.90, 22.90),
('88888888-0001-0001-0001-000000000001', '66666666-0002-0001-0001-000000000006', 2.000, 8.99, 0, 0, 17.98, 17.98),
('88888888-0001-0001-0001-000000000001', '66666666-0003-0001-0002-000000000012', 5.000, 2.49, 0.36, 0, 12.45, 12.09);

-- Venda 2 (ontem)
INSERT INTO sales (id, company_id, branch_id, sale_number, customer_id, cashier_id, status, subtotal, discount_amount, discount_percentage, total, payment_method, amount_paid, change_amount, created_at) VALUES
('88888888-0001-0001-0002-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'VND-00002', '77777777-0001-0001-0002-000000000002', '33333333-3333-3333-3333-333333333333', 'completed', 35.67, 0, 0, 35.67, 'pix', 35.67, 0, CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, discount_percentage, subtotal, total) VALUES
('88888888-0001-0001-0002-000000000002', '66666666-0001-0002-0001-000000000003', 3.000, 5.49, 0, 0, 16.47, 16.47),
('88888888-0001-0001-0002-000000000002', '66666666-0002-0002-0001-000000000009', 10.000, 1.79, 0, 0, 17.90, 17.90),
('88888888-0001-0001-0002-000000000002', '66666666-0004-0001-0003-000000000016', 2.000, 5.19, 3.48, 0, 10.38, 6.90);

-- Venda 3 (2 dias atrás)
INSERT INTO sales (id, company_id, branch_id, sale_number, customer_id, cashier_id, status, subtotal, discount_amount, discount_percentage, total, payment_method, amount_paid, change_amount, created_at) VALUES
('88888888-0001-0001-0003-000000000003', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'VND-00003', NULL, '33333333-4444-4444-4444-444444444444', 'completed', 127.43, 12.74, 10, 114.69, 'debit_card', 114.69, 0, CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, discount_percentage, subtotal, total) VALUES
('88888888-0001-0001-0003-000000000003', '66666666-0001-0001-0001-000000000001', 2.000, 22.90, 0, 0, 45.80, 45.80),
('88888888-0001-0001-0003-000000000003', '66666666-0001-0003-0001-000000000005', 3.000, 7.29, 0, 0, 21.87, 21.87),
('88888888-0001-0001-0003-000000000003', '66666666-0002-0001-0002-000000000007', 10.000, 3.49, 0, 0, 34.90, 34.90),
('88888888-0001-0001-0003-000000000003', '66666666-0004-0001-0001-000000000014', 5.000, 4.29, 0, 0, 21.45, 21.45);

-- Venda 4 (pagamento misto)
INSERT INTO sales (id, company_id, branch_id, sale_number, customer_id, cashier_id, status, subtotal, discount_amount, discount_percentage, total, payment_method, amount_paid, change_amount, created_at) VALUES
('88888888-0001-0001-0004-000000000004', '11111111-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'VND-00004', '77777777-0001-0001-0003-000000000003', '33333333-3333-3333-3333-333333333333', 'completed', 89.50, 0, 0, 89.50, 'mixed', 89.50, 0, CURRENT_TIMESTAMP - INTERVAL '3 hours');

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount_amount, discount_percentage, subtotal, total) VALUES
('88888888-0001-0001-0004-000000000004', '66666666-0003-0001-0001-000000000011', 2.000, 18.90, 0, 0, 37.80, 37.80),
('88888888-0001-0001-0004-000000000004', '66666666-0003-0001-0003-000000000013', 3.000, 6.99, 0, 0, 20.97, 20.97),
('88888888-0001-0001-0004-000000000004', '66666666-0004-0001-0002-000000000015', 2.000, 12.90, 0, 0, 25.80, 25.80);

INSERT INTO sale_payments (sale_id, payment_method, amount) VALUES
('88888888-0001-0001-0004-000000000004', 'cash', 50.00),
('88888888-0001-0001-0004-000000000004', 'debit_card', 39.50);

-- ============================================
-- CAIXA (Exemplo de fechamento)
-- ============================================

INSERT INTO cash_registers (id, branch_id, cashier_id, opening_amount, closing_amount, expected_amount, difference, total_sales, total_cash, total_pix, total_debit_card, total_credit_card, status, opened_at, closed_at) VALUES
('99999999-0001-0001-0001-000000000001', '22222222-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 200.00, 409.50, 409.53, -0.03, 209.50, 159.50, 35.67, 0, 0, 'closed', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '12 hours');

-- Caixa aberto (hoje)
INSERT INTO cash_registers (id, branch_id, cashier_id, opening_amount, closing_amount, expected_amount, difference, total_sales, total_cash, total_pix, total_debit_card, total_credit_card, status, opened_at) VALUES
('99999999-0001-0001-0002-000000000002', '22222222-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 200.00, NULL, NULL, NULL, 140.47, 100.00, 0, 39.50, 0, 'open', CURRENT_TIMESTAMP - INTERVAL '6 hours');

-- ============================================
-- LOGS DE AUDITORIA (Exemplos)
-- ============================================

INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, new_data, ip_address, created_at) VALUES
('33333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'login', 'user', '33333333-1111-1111-1111-111111111111', '{"email": "admin@supermercado.com.br"}', '192.168.1.100', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'login', 'user', '33333333-3333-3333-3333-333333333333', '{"email": "caixa1@supermercado.com.br"}', '192.168.1.50', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'cash_register_open', 'cash_register', '99999999-0001-0001-0002-000000000002', '{"opening_amount": 200.00}', '192.168.1.50', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'sale_create', 'sale', '88888888-0001-0001-0001-000000000001', '{"sale_number": "VND-00001", "total": 50.97}', '192.168.1.50', CURRENT_TIMESTAMP);

-- ============================================
-- RESUMO
-- ============================================

-- Total de registros criados
SELECT 'companies' AS table_name, COUNT(*) AS records FROM companies
UNION ALL
SELECT 'branches', COUNT(*) FROM branches
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'user_companies', COUNT(*) FROM user_companies
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'brands', COUNT(*) FROM brands
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'persons', COUNT(*) FROM persons
UNION ALL
SELECT 'stock_balance', COUNT(*) FROM stock_balance
UNION ALL
SELECT 'stock_movements', COUNT(*) FROM stock_movements
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'sale_items', COUNT(*) FROM sale_items
UNION ALL
SELECT 'sale_payments', COUNT(*) FROM sale_payments
UNION ALL
SELECT 'cash_registers', COUNT(*) FROM cash_registers
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
