#!/usr/bin/env node

// Script para executar migrations no Neon PostgreSQL usando pg
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dmGzNnsx6tf0@ep-divine-mouse-acs7dan0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function runMigrations() {
  console.log('🚀 Iniciando migrations no Neon PostgreSQL...\n');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');
    
    // Ler arquivo de schema
    console.log('📖 Lendo schema.sql...');
    const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    console.log('⚙️  Executando schema (criando tabelas, views, triggers)...');
    console.log('   Isso pode levar alguns segundos...\n');
    await client.query(schema);
    console.log('✅ Schema executado com sucesso!\n');
    
    // Ler arquivo de seed
    console.log('📖 Lendo seed.sql...');
    const seedPath = join(__dirname, '..', 'database', 'seed.sql');
    const seed = readFileSync(seedPath, 'utf-8');
    
    console.log('🌱 Executando seed (inserindo dados de teste)...');
    console.log('   Isso pode levar alguns segundos...\n');
    await client.query(seed);
    console.log('✅ Seed executado com sucesso!\n');
    
    // Verificar dados inseridos
    console.log('🔍 Verificando dados inseridos...\n');
    
    const companies = await client.query('SELECT COUNT(*) as count FROM companies');
    console.log(`   ✓ Empresas: ${companies.rows[0].count}`);
    
    const branches = await client.query('SELECT COUNT(*) as count FROM branches');
    console.log(`   ✓ Filiais: ${branches.rows[0].count}`);
    
    const users = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`   ✓ Usuários: ${users.rows[0].count}`);
    
    const products = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`   ✓ Produtos: ${products.rows[0].count}`);
    
    const stock = await client.query('SELECT COUNT(*) as count FROM stock_balance');
    console.log(`   ✓ Itens em estoque: ${stock.rows[0].count}`);
    
    const sales = await client.query('SELECT COUNT(*) as count FROM sales');
    console.log(`   ✓ Vendas: ${sales.rows[0].count}`);
    
    const auditLogs = await client.query('SELECT COUNT(*) as count FROM audit_logs');
    console.log(`   ✓ Logs de auditoria: ${auditLogs.rows[0].count}`);
    
    console.log('\n🎉 Migrations concluídas com sucesso!');
    console.log('\n📋 Credenciais de teste:');
    console.log('   Email: admin@supermercado.com.br');
    console.log('   Senha: senha123\n');
    console.log('   Email: gerente@supermercado.com.br');
    console.log('   Senha: senha123\n');
    console.log('   Email: caixa1@supermercado.com.br');
    console.log('   Senha: senha123');
    console.log('\n🔗 Banco de dados Neon:');
    console.log('   Host: ep-divine-mouse-acs7dan0-pooler.sa-east-1.aws.neon.tech');
    console.log('   Database: neondb');
    console.log('\n🚀 Próximos passos:');
    console.log('   1. npm run build');
    console.log('   2. pm2 start ecosystem.config.cjs');
    console.log('   3. Acesse http://localhost:3000');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar migrations:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Algumas tabelas já existem. Isso pode ser normal.');
      console.log('   Para resetar o banco, delete todas as tabelas manualmente');
      console.log('   no console do Neon e execute este script novamente.');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Conexão fechada.');
  }
}

runMigrations();
