# 🚂 Deploy no Railway.app (RECOMENDADO)

## Por que Railway em vez de Vercel?

O **Railway.app** é mais adequado para este projeto porque:
- ✅ Suporta Node.js completo (sem limitações de Edge Runtime)
- ✅ Suporta bibliotecas como `pg`, `bcryptjs` nativamente
- ✅ Deploy mais simples (sem conflitos de dependências)
- ✅ Conexão direta com PostgreSQL (Neon.tech)
- ✅ Plano gratuito generoso ($5/mês de crédito)

---

## 🎯 Passo a Passo - Deploy no Railway

### 1️⃣ Criar Conta no Railway
1. Acesse https://railway.app
2. Clique em **"Start a New Project"**
3. Faça login com GitHub
4. Autorize o Railway a acessar seus repositórios

### 2️⃣ Importar Projeto do GitHub
1. No Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório **`gustavomelo28/erp-pdv-system`**
4. Railway detectará automaticamente o projeto Node.js

### 3️⃣ Configurar Variáveis de Ambiente
Vá em **Variables** e adicione:

```env
DATABASE_URL=postgresql://neondb_owner:npg_dmGzNnsx6tf0@ep-divine-mouse-acs7dan0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=erp-pdv-secret-key-production-2026
NODE_ENV=production
PORT=3000
```

### 4️⃣ Configurar Build e Start
Railway detecta automaticamente o `package.json`, mas caso precise ajustar:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
node dist/_worker.js
```

### 5️⃣ Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos (Railway faz build e deploy automático)
3. Railway fornecerá uma URL pública (ex: `https://erp-pdv-system-production.up.railway.app`)

### 6️⃣ Acessar Sistema
1. Abra a URL fornecida pelo Railway
2. Faça login com:
   - **Email:** `admin@supermercado.com.br`
   - **Senha:** `senha123`

---

## 🔧 Configurações Adicionais (Opcional)

### Custom Domain
Se quiser usar domínio próprio:
1. Vá em **Settings → Domains**
2. Clique em **"Generate Domain"** ou **"Custom Domain"**
3. Configure o DNS conforme instruções

### Logs e Monitoramento
- Acesse a aba **"Deployments"** para ver logs em tempo real
- Railway mostra CPU, memória e tráfego de rede
- Alertas automáticos em caso de falha

### Scaling (se necessário)
- Railway escala automaticamente até o limite do plano
- Para mais recursos: Settings → Plan → Upgrade

---

## 🆘 Troubleshooting

### Erro de Build
```bash
# Se o build falhar, tente localmente:
cd /home/user/webapp
npm run build
git add dist/
git commit -m "fix: Rebuild dist"
git push origin main
```

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correta (incluindo `?sslmode=require`)
- Teste conexão no Neon.tech (dashboard → Query Editor)

### Erro 500 no Login
- Verifique logs no Railway: Deployments → View Logs
- Confirme que `JWT_SECRET` foi definida
- Verifique se migrations foram aplicadas no banco

---

## 📊 Comparação Railway vs Vercel

| Recurso | Railway | Vercel |
|---------|---------|--------|
| Node.js Completo | ✅ Sim | ❌ Edge Runtime apenas |
| Bibliotecas nativas | ✅ Sim (`pg`, `bcryptjs`) | ❌ Limitado |
| Deploy Simples | ✅ Muito fácil | ⚠️ Requer ajustes |
| Plano Gratuito | ✅ $5/mês crédito | ✅ Limitado |
| PostgreSQL | ✅ Suporte nativo | ⚠️ Requer adaptações |
| Build Time | ~2-3 min | ~2-3 min |
| **Recomendação** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## ✅ Checklist de Deploy

- [ ] Conta Railway criada
- [ ] Projeto importado do GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] URL pública acessível
- [ ] Login funcionando
- [ ] Dashboard carregando dados
- [ ] PDV operacional

---

## 🎉 Próximos Passos Após Deploy

1. **Testar Funcionalidades:**
   - Login com diferentes perfis
   - Cadastrar novo produto
   - Fazer uma venda no PDV
   - Gerar relatório CSV

2. **Personalizar:**
   - Alterar logo da empresa
   - Ajustar temas/cores
   - Adicionar mais usuários

3. **Integração NF-e:**
   - Seguir guia em `docs/INTEGRACAO_NFE.md`
   - Configurar certificado digital
   - Testar emissão em homologação

4. **Monitoramento:**
   - Configurar alertas no Railway
   - Backup periódico do banco Neon
   - Logs de auditoria

---

## 📞 Suporte

- **Documentação Railway:** https://docs.railway.app
- **Discord Railway:** https://discord.gg/railway
- **Neon PostgreSQL Docs:** https://neon.tech/docs

---

**🚀 Deploy Simplificado - Railway FTW!**
