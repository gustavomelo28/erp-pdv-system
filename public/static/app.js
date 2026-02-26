// ERP/POS Frontend Application
// Main JavaScript file

// Global state management
const appState = {
  user: null,
  token: null,
  currentCompany: null,
  currentBranch: null,
  currentPage: 'login',
  cart: [],
  // Add more state as needed
};

// API Configuration
const API_BASE = window.location.origin + '/api';

// Axios default config
axios.defaults.baseURL = API_BASE;
axios.interceptors.request.use((config) => {
  if (appState.token) {
    config.headers.Authorization = `Bearer ${appState.token}`;
  }
  return config;
});

// Utility functions
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function clearStorage() {
  localStorage.clear();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

function showNotification(message, type = 'info') {
  // Simple notification implementation
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Authentication functions
async function login(email, password) {
  try {
    const response = await axios.post('/auth/login', { email, password });
    const { token, user, companies } = response.data;
    
    appState.token = token;
    appState.user = user;
    appState.companies = companies;
    
    // Set default company
    if (companies.length > 0) {
      appState.currentCompany = companies[0];
    }
    
    // Save to localStorage
    saveToStorage('token', token);
    saveToStorage('user', user);
    saveToStorage('companies', companies);
    
    showNotification('Login realizado com sucesso!', 'success');
    navigateTo('dashboard');
  } catch (error) {
    console.error('Login error:', error);
    showNotification(error.response?.data?.error || 'Erro ao fazer login', 'error');
  }
}

async function logout() {
  appState.token = null;
  appState.user = null;
  appState.currentCompany = null;
  clearStorage();
  navigateTo('login');
  showNotification('Logout realizado com sucesso', 'info');
}

function checkAuth() {
  const token = getFromStorage('token');
  const user = getFromStorage('user');
  const companies = getFromStorage('companies');
  
  if (token && user) {
    appState.token = token;
    appState.user = user;
    appState.companies = companies || [];
    if (appState.companies.length > 0) {
      appState.currentCompany = appState.companies[0];
    }
    return true;
  }
  return false;
}

// Navigation functions
function navigateTo(page, params = {}) {
  appState.currentPage = page;
  
  // Check auth for protected pages
  if (page !== 'login' && !checkAuth()) {
    navigateTo('login');
    return;
  }
  
  renderPage(page, params);
}

// Main render function
function renderPage(page, params = {}) {
  const app = document.getElementById('app');
  
  switch (page) {
    case 'login':
      app.innerHTML = renderLoginPage();
      break;
    case 'dashboard':
      app.innerHTML = renderDashboardPage();
      break;
    case 'products':
      app.innerHTML = renderProductsPage();
      loadProducts();
      break;
    case 'pos':
      app.innerHTML = renderPOSPage();
      break;
    case 'stock':
      app.innerHTML = renderStockPage();
      loadStock();
      break;
    case 'sales':
      app.innerHTML = renderSalesPage();
      loadSales();
      break;
    default:
      app.innerHTML = '<div class="p-8 text-center"><h1 class="text-2xl">Página não encontrada</h1></div>';
  }
}

// Page Templates
function renderLoginPage() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <i class="fas fa-store text-5xl text-primary-600 mb-4"></i>
          <h1 class="text-3xl font-heading font-bold text-gray-900">ERP/PDV</h1>
          <p class="text-gray-600 mt-2">Sistema de Gestão Empresarial</p>
        </div>
        
        <form onsubmit="handleLogin(event)" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input 
              type="email" 
              id="login-email" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input 
              type="password" 
              id="login-password" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition duration-200"
          >
            Entrar
          </button>
        </form>
        
        <p class="text-center text-sm text-gray-600 mt-6">
          <a href="#" onclick="showNotification('Funcionalidade em desenvolvimento', 'info')" class="text-primary-600 hover:underline">
            Esqueceu sua senha?
          </a>
        </p>
        
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            <strong>Credenciais de teste:</strong><br>
            Email: admin@supermercado.com.br<br>
            Senha: senha123
          </p>
        </div>
      </div>
    </div>
  `;
}

function renderDashboardPage() {
  return `
    ${renderLayout(`
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Vendas Hoje</p>
              <p class="text-2xl font-bold text-gray-900">R$ 1.250,00</p>
            </div>
            <i class="fas fa-cash-register text-3xl text-green-500"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Produtos</p>
              <p class="text-2xl font-bold text-gray-900">156</p>
            </div>
            <i class="fas fa-box text-3xl text-blue-500"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Estoque Baixo</p>
              <p class="text-2xl font-bold text-gray-900">8</p>
            </div>
            <i class="fas fa-exclamation-triangle text-3xl text-yellow-500"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Caixa Aberto</p>
              <p class="text-2xl font-bold text-gray-900">R$ 500,00</p>
            </div>
            <i class="fas fa-wallet text-3xl text-purple-500"></i>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Vendas Recentes</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center border-b pb-2">
              <div>
                <p class="font-medium">VND-00001</p>
                <p class="text-sm text-gray-600">João Caixa - 14:30</p>
              </div>
              <p class="font-bold text-green-600">R$ 50,97</p>
            </div>
            <div class="flex justify-between items-center border-b pb-2">
              <div>
                <p class="font-medium">VND-00002</p>
                <p class="text-sm text-gray-600">Ana Caixa - 13:15</p>
              </div>
              <p class="font-bold text-green-600">R$ 35,67</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Produtos com Estoque Baixo</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center border-b pb-2">
              <div>
                <p class="font-medium">Arroz Branco 5kg</p>
                <p class="text-sm text-gray-600">Estoque: 15 UN</p>
              </div>
              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Baixo</span>
            </div>
          </div>
        </div>
      </div>
    `)}
  `;
}

// Layout wrapper with sidebar
function renderLayout(content) {
  return `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <div id="sidebar" class="sidebar fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white z-40">
        <div class="p-6 border-b border-gray-800">
          <div class="flex items-center space-x-3">
            <i class="fas fa-store text-2xl text-primary-400"></i>
            <div>
              <h2 class="font-heading font-bold text-lg">ERP/PDV</h2>
              <p class="text-xs text-gray-400">${appState.currentCompany?.name || 'Sistema'}</p>
            </div>
          </div>
        </div>
        
        <nav class="p-4 space-y-2">
          <a href="#" onclick="navigateTo('dashboard')" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 ${appState.currentPage === 'dashboard' ? 'bg-gray-800' : ''}">
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
          </a>
          
          <a href="#" onclick="navigateTo('pos')" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 ${appState.currentPage === 'pos' ? 'bg-gray-800' : ''}">
            <i class="fas fa-cash-register"></i>
            <span>PDV / Caixa</span>
          </a>
          
          <div class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-500 uppercase">Cadastros</p>
          </div>
          
          <a href="#" onclick="navigateTo('products')" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 ${appState.currentPage === 'products' ? 'bg-gray-800' : ''}">
            <i class="fas fa-box"></i>
            <span>Produtos</span>
          </a>
          
          <a href="#" onclick="showNotification('Em desenvolvimento', 'info')" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800">
            <i class="fas fa-users"></i>
            <span>Clientes</span>
          </a>
          
          <div class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-500 uppercase">Movimentações</p>
          </div>
          
          <a href="#" onclick="navigateTo('stock')" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 ${appState.currentPage === 'stock' ? 'bg-gray-800' : ''}">
            <i class="fas fa-warehouse"></i>
            <span>Estoque</span>
          </a>
          
          <a href="#" onclick="navigateTo('sales')" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 ${appState.currentPage === 'sales' ? 'bg-gray-800' : ''}">
            <i class="fas fa-receipt"></i>
            <span>Vendas</span>
          </a>
          
          <div class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-500 uppercase">Relatórios</p>
          </div>
          
          <a href="#" onclick="showNotification('Em desenvolvimento', 'info')" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800">
            <i class="fas fa-chart-bar"></i>
            <span>Relatórios</span>
          </a>
        </nav>
        
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i class="fas fa-user-circle text-2xl"></i>
              <div>
                <p class="text-sm font-medium">${appState.user?.name || 'Usuário'}</p>
                <p class="text-xs text-gray-400">${appState.user?.role || ''}</p>
              </div>
            </div>
            <button onclick="logout()" class="text-gray-400 hover:text-white">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 lg:ml-0">
        <!-- Top Bar -->
        <div class="bg-white shadow-sm border-b sticky top-0 z-30">
          <div class="px-6 py-4 flex items-center justify-between">
            <button onclick="toggleSidebar()" class="lg:hidden text-gray-600">
              <i class="fas fa-bars text-xl"></i>
            </button>
            <div class="flex items-center space-x-4">
              <div class="hidden md:block">
                <p class="text-sm text-gray-600">Filial Ativa</p>
                <p class="font-medium">${appState.currentBranch?.name || 'Matriz - Centro'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Page Content -->
        <div class="p-6">
          ${content}
        </div>
      </div>
    </div>
  `;
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

// Event handlers
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  login(email, password);
}

// Products page
function renderProductsPage() {
  return renderLayout(`
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-heading font-bold text-gray-900">Produtos</h1>
        <button onclick="showNotification('Em desenvolvimento', 'info')" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <i class="fas fa-plus mr-2"></i>Novo Produto
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b">
          <input 
            type="search" 
            placeholder="Buscar produtos..." 
            class="w-full px-4 py-2 border rounded-lg"
            onkeyup="searchProducts(this.value)"
          />
        </div>
        <div id="products-list" class="p-4">
          <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>
  `);
}

async function loadProducts() {
  try {
    const response = await axios.get('/products');
    const { data } = response.data;
    
    const listHtml = data.map(product => `
      <div class="flex items-center justify-between border-b py-3 hover:bg-gray-50">
        <div class="flex-1">
          <p class="font-medium">${product.name}</p>
          <p class="text-sm text-gray-600">SKU: ${product.sku} ${product.barcode ? '| EAN: ' + product.barcode : ''}</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-green-600">${formatCurrency(product.sale_price)}</p>
          <p class="text-sm text-gray-600">Custo: ${formatCurrency(product.cost_price)}</p>
        </div>
      </div>
    `).join('');
    
    document.getElementById('products-list').innerHTML = listHtml || '<p class="text-center text-gray-600 py-8">Nenhum produto encontrado</p>';
  } catch (error) {
    console.error('Load products error:', error);
    showNotification('Erro ao carregar produtos', 'error');
  }
}

function searchProducts(query) {
  // Implement search functionality
  loadProducts();
}

// POS Page
function renderPOSPage() {
  return renderLayout(`
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Products/Scanner -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow p-6 mb-4">
          <input 
            type="text" 
            id="barcode-input"
            placeholder="Digite o código de barras ou nome do produto..." 
            class="w-full px-4 py-3 border rounded-lg text-lg"
            onkeypress="handleBarcodeInput(event)"
          />
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-bold text-lg mb-4">Itens da Venda</h3>
          <div id="cart-items">
            <p class="text-center text-gray-600 py-8">Nenhum item adicionado</p>
          </div>
        </div>
      </div>
      
      <!-- Cart Summary -->
      <div>
        <div class="bg-white rounded-lg shadow p-6 sticky top-24">
          <h3 class="font-bold text-lg mb-4">Resumo</h3>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span id="cart-subtotal">R$ 0,00</span>
            </div>
            <div class="flex justify-between">
              <span>Desconto:</span>
              <span id="cart-discount">R$ 0,00</span>
            </div>
            <div class="flex justify-between text-xl font-bold border-t pt-3">
              <span>Total:</span>
              <span id="cart-total">R$ 0,00</span>
            </div>
          </div>
          
          <button 
            onclick="showNotification('Em desenvolvimento', 'info')" 
            class="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 mb-2"
          >
            <i class="fas fa-check mr-2"></i>Finalizar Venda
          </button>
          
          <button 
            onclick="clearCart()" 
            class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            <i class="fas fa-times mr-2"></i>Cancelar
          </button>
        </div>
      </div>
    </div>
  `);
}

function handleBarcodeInput(event) {
  if (event.key === 'Enter') {
    const barcode = event.target.value;
    // Add product to cart logic
    showNotification('Funcionalidade em desenvolvimento', 'info');
    event.target.value = '';
  }
}

function clearCart() {
  appState.cart = [];
  showNotification('Carrinho limpo', 'info');
}

// Stock page
function renderStockPage() {
  return renderLayout(`
    <div>
      <h1 class="text-2xl font-heading font-bold text-gray-900 mb-6">Controle de Estoque</h1>
      
      <div class="bg-white rounded-lg shadow">
        <div id="stock-list" class="p-4">
          <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>
  `);
}

async function loadStock() {
  try {
    const response = await axios.get('/stock');
    const { data } = response.data;
    
    const listHtml = data.map(item => `
      <div class="flex items-center justify-between border-b py-3">
        <div class="flex-1">
          <p class="font-medium">${item.product_name}</p>
          <p class="text-sm text-gray-600">${item.branch_name}</p>
        </div>
        <div class="text-right">
          <p class="font-bold">${item.quantity} ${item.unit}</p>
          <p class="text-sm ${item.quantity < item.min_stock ? 'text-red-600' : 'text-gray-600'}">
            ${item.quantity < item.min_stock ? 'Estoque Baixo' : 'OK'}
          </p>
        </div>
      </div>
    `).join('');
    
    document.getElementById('stock-list').innerHTML = listHtml || '<p class="text-center text-gray-600 py-8">Nenhum item em estoque</p>';
  } catch (error) {
    console.error('Load stock error:', error);
    showNotification('Erro ao carregar estoque', 'error');
  }
}

// Sales page
function renderSalesPage() {
  return renderLayout(`
    <div>
      <h1 class="text-2xl font-heading font-bold text-gray-900 mb-6">Vendas</h1>
      
      <div class="bg-white rounded-lg shadow">
        <div id="sales-list" class="p-4">
          <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>
  `);
}

async function loadSales() {
  try {
    const response = await axios.get('/sales');
    const { data } = response.data;
    
    const listHtml = data.map(sale => `
      <div class="flex items-center justify-between border-b py-3 hover:bg-gray-50">
        <div class="flex-1">
          <p class="font-medium">${sale.sale_number}</p>
          <p class="text-sm text-gray-600">
            ${sale.cashier_name} - ${sale.branch_name}
            <br>${formatDate(sale.created_at)}
          </p>
        </div>
        <div class="text-right">
          <p class="font-bold text-green-600">${formatCurrency(sale.total)}</p>
          <p class="text-sm text-gray-600">${sale.payment_method}</p>
        </div>
      </div>
    `).join('');
    
    document.getElementById('sales-list').innerHTML = listHtml || '<p class="text-center text-gray-600 py-8">Nenhuma venda encontrada</p>';
  } catch (error) {
    console.error('Load sales error:', error);
    showNotification('Erro ao carregar vendas', 'error');
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    navigateTo('dashboard');
  } else {
    navigateTo('login');
  }
});
