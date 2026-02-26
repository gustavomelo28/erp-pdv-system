# 🚀 GUIA DE DEPLOY - Vercel (2 minutos)

## ✅ Projeto Pronto para Deploy

Todos os arquivos estão configurados em `/home/user/webapp/`

---

## 📋 Método 1: Deploy via GitHub (MAIS FÁCIL - RECOMENDADO)

### Passo 1: Fazer Push para GitHub

Se ainda não tem repositório:

```bash
cd /home/user/webapp

# Criar repositório no GitHub primeiro
# Vá em: https://github.com/new
# Nome sugerido: erp-pdv-system

# Depois conecte e envie o código:
git remote add origin https://github.com/SEU-USUARIO/erp-pdv-system.git
git branch -M main
git push -u origin main
```

### Passo 2: Importar no Vercel

1. Acesse: https://vercel.com/new
2. Faça login (pode usar conta GitHub)
3. Clique em "Import Project"
4. Selecione seu repositório `erp-pdv-system`
5. Configure as variáveis de ambiente:

**Environment Variables (IMPORTANTE!):**
```
DATABASE_URL=postgresql://neondb_owner:npg_dmGzNnsx6tf0@ep-divine-mouse-acs7dan0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=erp-pdv-secret-key-production-2026

NODE_ENV=production
```

6. Clique em "Deploy"
7. Aguarde 2-3 minutos
8. ✅ Pronto! URL será gerada automaticamente

---

## 📋 Método 2: Deploy via CLI Vercel

```bash
cd /home/user/webapp

# Login no Vercel (abrirá navegador)
npx vercel login

# Deploy para produção
npx vercel --prod

# Durante o processo, responda:
# - Setup and deploy? Yes
# - Which scope? (sua conta)
# - Link to existing project? No
# - Project name? erp-pdv-system
# - Directory? ./ (Enter)
# - Override settings? No

# Aguarde o build e deploy
# URL será exibida no final!
```

---

## 📋 Método 3: Railway.app (Alternativa)

Railway inclui PostgreSQL gratuito:

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Inicializar projeto
cd /home/user/webapp
railway init

# 4. Adicionar PostgreSQL (opcional - você já tem Neon)
railway add

# 5. Configurar variáveis
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_dmGzNnsx6tf0@ep-divine-mouse-acs7dan0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
railway variables set JWT_SECRET="erp-pdv-secret-key-production-2026"

# 6. Deploy
railway up
```

---

## 🎯 Após o Deploy

### Testar o Sistema

Acesse a URL gerada (exemplo: `https://erp-pdv-system.vercel.app`)

**Faça login com:**
```
Email: admin@supermercado.com.br
Senha: senha123
```

### URLs Disponíveis

- **Frontend**: https://SEU-PROJETO.vercel.app
- **API Health**: https://SEU-PROJETO.vercel.app/api/health
- **Login**: https://SEU-PROJETO.vercel.app/api/auth/login

---

## 🔧 Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão no package.json
- Execute: `npm install` localmente

### Erro: "DATABASE_URL not set"
- Certifique-se que adicionou as Environment Variables no Vercel
- Vá em: Project Settings > Environment Variables

### Erro: "Build failed"
- Verifique os logs no Vercel dashboard
- Build pode demorar 2-3 minutos na primeira vez

---

## ✅ Checklist Pré-Deploy

- [x] Código commitado no Git
- [x] package.json atualizado
- [x] vercel.json configurado
- [x] Banco PostgreSQL Neon funcionando
- [x] Migrations executadas
- [x] Dados de teste inseridos
- [ ] Push para GitHub (se usar método 1)
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy executado

---

## 📊 O Que Acontece no Deploy

1. **Vercel clona seu código**
2. **Executa `npm install`** (instala dependências)
3. **Executa `npm run build`** (compila TypeScript)
4. **Gera URL pública** com HTTPS automático
5. **Conecta ao banco PostgreSQL Neon**
6. **Sistema fica online!**

**Tempo total:** 2-3 minutos

---

## 🎉 Resultado Final

Após deploy bem-sucedido, você terá:

- ✅ Sistema ERP/PDV online
- ✅ HTTPS automático
- ✅ URL pública compartilhável
- ✅ Conectado ao seu banco PostgreSQL
- ✅ Gratuito até 100GB bandwidth/mês
- ✅ Auto-deploy em novos commits (se usar GitHub)

---

## 🆘 Precisa de Ajuda?

**Documentação Vercel:** https://vercel.com/docs

**Documentação Railway:** https://docs.railway.app

**Suporte:** 
- Vercel Discord: https://vercel.com/discord
- Railway Discord: https://discord.gg/railway

---

## 📝 Próximos Passos Após Deploy

1. Testar todas as funcionalidades
2. Criar novos usuários
3. Cadastrar produtos reais
4. Configurar domínio customizado (opcional)
5. Implementar módulos adicionais (NF-e, etc)

---

**🚀 Pronto para deploy! Escolha o método e siga os passos acima.**
