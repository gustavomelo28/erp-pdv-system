# ERP/PDV - Sistema de Gestão Empresarial

Sistema completo de ERP e Ponto de Venda (PDV) para varejo, desenvolvido com Hono + Cloudflare Pages + PostgreSQL.

## 🎯 Sobre o Projeto

Sistema web full-stack para gestão de empresas varejistas com foco em:
- **Multiempresa/Multi-filial**: Suporte para múltiplas empresas e filiais
- **PDV/Vendas**: Interface de caixa completa com leitura de código de barras
- **Gestão de Estoque**: Controle de entradas, saídas, transferências e kardex
- **Cadastros**: Produtos, clientes, fornecedores, usuários
- **Relatórios**: Vendas, estoque, movimentações com exportação CSV
- **Auditoria**: Log completo de ações do sistema

## 📋 Funcionalidades Principais

### MVP Implementado

#### 1. **Autenticação e Controle de Acesso (RBAC)**
- Login por e-mail/senha com JWT
- Recuperação de senha
- 4 níveis de acesso: Admin, Gerente, Caixa, Consulta
- Um usuário pode pertencer a múltiplas empresas

#### 2. **Gestão de Produtos**
- Cadastro completo: SKU, EAN/código de barras, nome, categoria, marca
- Controle de preços: custo, venda, margem (calculada automaticamente)
- Estoque mínimo/máximo
- Busca por nome, SKU ou código de barras
- Imagens de produtos

#### 3. **Controle de Estoque**
- Saldo por produto e depósito (filial)
- Movimentações: compra, venda, ajuste, inventário, transferência
- Kardex completo (histórico de movimentações)
- Transferência entre depósitos
- Alertas de estoque baixo

#### 4. **PDV (Ponto de Venda)**
- Interface de caixa com leitor de código de barras
- Adição de itens com desconto individual
- Desconto na venda
- Múltiplas formas de pagamento:
  - Dinheiro (com cálculo de troco)
  - PIX
  - Cartão débito/crédito
  - Pagamento misto (combinar métodos)
- Fechamento de caixa por operador/turno

#### 5. **Cadastros Auxiliares**
- **Clientes**: CPF/CNPJ, contatos, endereço
- **Fornecedores**: Dados completos para compras
- **Categorias**: Hierárquicas (categoria e subcategoria)
- **Marcas**: Organização de produtos
- **Filiais**: Multi-depósito

#### 6. **Relatórios**
- Vendas por período, operador, produto
- Estoque atual e movimentações
- Produtos com estoque baixo
- Exportação CSV

#### 7. **Auditoria**
- Log de todas as ações do sistema
- Rastreamento de usuário, data/hora, IP
- Registro de valores antigos e novos (update)

## 🛠️ Stack Tecnológica

### Backend
- **Hono**: Framework web edge-first
- **PostgreSQL**: Banco de dados relacional (via Neon.tech)
- **JWT**: Autenticação stateless com jose
- **bcryptjs**: Hash de senhas

### Frontend
- **Vanilla JavaScript**: SPA sem frameworks
- **TailwindCSS**: Estilização via CDN
- **Axios**: Cliente HTTP
- **Font Awesome**: Ícones
- **Google Fonts**: Inter (texto) + Montserrat (títulos)

### Deploy
- **Cloudflare Pages**: Hosting edge
- **Cloudflare Workers**: Backend serverless
- **Neon PostgreSQL**: Database serverless

## 📊 Modelagem do Banco de Dados

### Principais Tabelas

```sql
companies          # Empresas (multiempresa)
├── branches       # Filiais/depósitos
└── user_companies # Usuários associados

users              # Usuários do sistema
├── user_companies # Relação N:N com empresas
└── audit_logs     # Logs de ações

products           # Produtos
├── categories     # Categorias (hierárquica)
├── brands         # Marcas
└── stock_balance  # Saldo atual por depósito

stock_movements    # Histórico (Kardex)
stock_transfers    # Transferências entre depósitos
├── stock_transfer_items

sales              # Vendas
├── sale_items     # Itens da venda
└── sale_payments  # Pagamentos (para pagamento misto)

persons            # Clientes e Fornecedores
cash_registers     # Fechamento de caixa
audit_logs         # Auditoria do sistema
```

### Views Úteis
- `v_stock_full`: Estoque com informações completas
- `v_sales_summary`: Resumo de vendas
- `v_low_stock_products`: Produtos com estoque baixo

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Conta no Neon.tech (PostgreSQL serverless gratuito)
- Conta no Cloudflare (para deploy em produção)

### 1. Configurar Banco de Dados

#### Criar banco no Neon.tech
1. Acesse https://console.neon.tech
2. Crie um novo projeto
3. Copie a connection string

#### Executar migrations
```bash
# Execute o schema SQL no console do Neon
# Copie e cole o conteúdo de database/schema.sql

# Execute o seed para dados de teste
# Copie e cole o conteúdo de database/seed.sql
```

### 2. Configurar Variáveis de Ambiente

Crie arquivo `.dev.vars`:
```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

### 3. Instalar Dependências

```bash
cd /home/user/webapp
npm install
```

### 4. Executar em Desenvolvimento

```bash
# Build do projeto
npm run build

# Iniciar servidor com PM2 (recomendado)
pm2 start ecosystem.config.cjs

# Ou iniciar diretamente
npm run dev:sandbox
```

Acesse: http://localhost:3000

### 5. Credenciais de Teste

```
Email: admin@supermercado.com.br
Senha: senha123
```

## 📁 Estrutura do Projeto

```
webapp/
├── src/
│   ├── index.tsx              # Aplicação principal Hono
│   ├── lib/
│   │   ├── db.ts              # Conexão PostgreSQL (Neon)
│   │   └── auth.ts            # Utilitários de autenticação
│   ├── middleware/
│   │   └── auth.ts            # Middlewares (requireAuth, requireRole)
│   ├── routes/
│   │   ├── auth.ts            # Rotas de autenticação
│   │   ├── products.ts        # CRUD de produtos
│   │   ├── sales.ts           # Vendas/PDV
│   │   └── stock.ts           # Gestão de estoque
│   └── types/
│       └── index.ts           # Tipos TypeScript
├── public/
│   └── static/
│       ├── app.js             # Frontend JavaScript
│       └── styles.css         # CSS customizado
├── database/
│   ├── schema.sql             # Schema completo do banco
│   └── seed.sql               # Dados de teste
├── ecosystem.config.cjs       # Configuração PM2
├── .dev.vars                  # Variáveis de ambiente (local)
├── wrangler.jsonc             # Configuração Cloudflare
├── vite.config.ts             # Configuração Vite
└── package.json
```

## 🌐 APIs Disponíveis

### Autenticação
```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Cadastrar usuário
POST   /api/auth/forgot-password # Recuperar senha
POST   /api/auth/reset-password # Resetar senha
GET    /api/auth/me            # Dados do usuário atual
```

### Produtos
```
GET    /api/products            # Listar produtos (paginado)
GET    /api/products/:id        # Buscar por ID
POST   /api/products            # Criar produto
PUT    /api/products/:id        # Atualizar produto
DELETE /api/products/:id        # Deletar produto (soft delete)
GET    /api/products/barcode/:barcode # Buscar por código de barras
```

### Vendas
```
POST   /api/sales               # Criar venda
GET    /api/sales               # Listar vendas (com filtros)
GET    /api/sales/:id           # Detalhes da venda
```

### Estoque
```
GET    /api/stock               # Saldo de estoque (com filtros)
POST   /api/stock/adjustment    # Ajuste de estoque
GET    /api/stock/movements     # Movimentações (kardex)
```

## 🔐 Níveis de Permissão

| Papel       | Descrição                                    |
|-------------|----------------------------------------------|
| `admin`     | Acesso total ao sistema                      |
| `manager`   | Gerente - cadastros e relatórios             |
| `cashier`   | Operador de caixa - PDV e vendas             |
| `read_only` | Apenas consulta - sem alterações             |

## 📊 Dados de Teste (Seed)

O sistema já vem com dados de teste:

- **1 Empresa**: Supermercado Exemplo LTDA
- **3 Filiais**: Matriz, Filial Jardins, Filial Shopping
- **5 Usuários**: Admin, Gerente, 2 Caixas, 1 Consulta (todos senha: senha123)
- **16 Produtos**: Alimentos, bebidas, limpeza, higiene
- **4 Clientes** e **3 Fornecedores**
- **Estoque inicial** distribuído nas 3 filiais
- **4 Vendas de exemplo**
- **2 Fechamentos de caixa**

## 🚀 Deploy em Produção

### 1. Configurar Cloudflare

```bash
# Login no Cloudflare
npx wrangler login

# Criar projeto Pages
npx wrangler pages project create webapp --production-branch main
```

### 2. Configurar Secrets

```bash
# Adicionar DATABASE_URL
npx wrangler pages secret put DATABASE_URL --project-name webapp

# Adicionar JWT_SECRET
npx wrangler pages secret put JWT_SECRET --project-name webapp
```

### 3. Deploy

```bash
npm run deploy:prod
```

A aplicação estará disponível em: `https://webapp.pages.dev`

## 📝 Próximos Passos (Roadmap)

### Funcionalidades Pendentes

#### 1. **Integração Fiscal (NF-e/NFC-e)**
- [ ] Integração com APIs fiscais (Focus NFe, Tiny ERP, etc)
- [ ] Emissão de NF-e (Nota Fiscal Eletrônica)
- [ ] Emissão de NFC-e (Nota Fiscal de Consumidor Eletrônica)
- [ ] Geração de DANFE (PDF da nota)
- [ ] Cancelamento e inutilização de notas
- [ ] Configuração de certificado digital A1
- [ ] Ambiente de homologação/produção

#### 2. **Módulo Financeiro**
- [ ] Contas a pagar/receber
- [ ] Fluxo de caixa
- [ ] Conciliação bancária
- [ ] Boletos (integração com APIs)

#### 3. **Módulo de Compras**
- [ ] Pedidos de compra
- [ ] Controle de fornecedores
- [ ] Entrada de mercadorias
- [ ] Importação de XML de NF-e

#### 4. **Relatórios Avançados**
- [ ] Curva ABC de produtos
- [ ] Análise de vendas por período
- [ ] Comissões de vendedores
- [ ] Exportação para Excel
- [ ] Gráficos interativos (Chart.js)

#### 5. **Melhorias de UX**
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Impressão térmica (via Bluetooth/USB)
- [ ] Leitor de código de barras via câmera
- [ ] Teclado numérico para PDV
- [ ] Atalhos de teclado

#### 6. **Recursos Adicionais**
- [ ] Multi-idioma (i18n)
- [ ] Temas (claro/escuro)
- [ ] Backup automático
- [ ] Importação de produtos via CSV/Excel
- [ ] Integração com e-commerce
- [ ] API REST pública para integrações

### Checklist de Integração NF-e/NFC-e

Para integração fiscal futura, você precisará:

**Requisitos:**
1. ✅ CNPJ da empresa cadastrado
2. ✅ Produtos com NCM (Nomenclatura Comum do Mercosul)
3. ✅ Dados de cliente (CPF/CNPJ)
4. ✅ Vendas com totalizadores corretos
5. ⚠️ Certificado Digital A1 (necessário adquirir)
6. ⚠️ Credenciais de API fiscal (Focus NFe, etc)

**Dados Fiscais Adicionais Necessários:**
- Regime tributário da empresa (Simples Nacional, Lucro Real, etc)
- CST/CSOSN (Código de Situação Tributária)
- CFOP (Código Fiscal de Operações)
- NCM dos produtos (8 dígitos)
- Alíquotas de impostos (ICMS, PIS, COFINS, etc)

**Fluxo de Emissão:**
```
Venda Concluída → Gerar XML NF-e → Assinar com Certificado
→ Enviar para SEFAZ → Receber Autorização → Gerar DANFE
→ Salvar XML Autorizado → Enviar por Email
```

## 🤝 Contribuindo

Este é um projeto de demonstração. Para uso em produção:

1. Altere as senhas padrão
2. Configure SSL/HTTPS
3. Implemente backup do banco de dados
4. Adicione testes automatizados
5. Configure monitoramento (Sentry, etc)
6. Revise as permissões de RBAC

## 📄 Licença

MIT License - Use como quiser!

## 🐛 Problemas Conhecidos

- [ ] Seed usa senha em texto simples (para desenvolvimento apenas)
- [ ] Falta validação de CNPJ/CPF
- [ ] Sem rate limiting nas APIs
- [ ] Sem paginação em algumas listagens
- [ ] Impressão de recibo ainda não implementada

## 📞 Suporte

Para dúvidas sobre o projeto:
- Documentação: Este README
- Issues: Abra uma issue no repositório
- Email: (adicione se aplicável)

---

**Desenvolvido com ❤️ usando Hono + Cloudflare + PostgreSQL**

---

## 🎯 Quick Start para Desenvolvedores

```bash
# 1. Clone e instale
git clone <repo>
cd webapp
npm install

# 2. Configure o banco de dados
# - Crie conta no Neon.tech
# - Execute database/schema.sql
# - Execute database/seed.sql

# 3. Configure variáveis
cp .dev.vars.example .dev.vars
# Edite .dev.vars com sua DATABASE_URL

# 4. Build e execute
npm run build
pm2 start ecosystem.config.cjs

# 5. Acesse
# http://localhost:3000
# Email: admin@supermercado.com.br
# Senha: senha123
```

**Pronto! 🚀**
