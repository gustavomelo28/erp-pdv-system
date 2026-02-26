# 🎯 RAILWAY - CONFIGURAÇÃO DE PORTA CORRETA

## ✅ Atualização Aplicada

Foi adicionado um servidor Node.js (`server.mjs`) que:
- ✅ Lê a variável `PORT` do ambiente Railway
- ✅ Usa porta 3000 como padrão
- ✅ Suporta deploy em Railway, Render, Vercel
- ✅ Commit: `57827a0`

---

## 🚀 Como Gerar o Domínio no Railway

### **Opção 1: Porta Fixa (Recomendado)**

Na tela atual do Railway:

1. **Target port:** Digite **`3000`**
2. Clique em **"Generate Domain"**
3. Aguarde 30 segundos
4. Railway fornecerá URL como: `https://erp-pdv-system-production.up.railway.app`

### **Opção 2: Porta Dinâmica**

Se Railway sugerir outra porta:

1. **Feche** a janela de "Generate Domain"
2. Vá em **"Variables"** (aba superior)
3. Adicione:
   - **Key:** `PORT`
   - **Value:** `3000`
4. Volte em **"Settings"** → **"Networking"**
5. Clique em **"Generate Domain"**
6. Aceite a porta sugerida (será 3000)

---

## 🔄 Rebuild Automático

Após o push do commit `57827a0`:
- ✅ Railway detecta automaticamente
- ✅ Faz rebuild em ~1-2 minutos
- ✅ Servidor agora usa `npm start` → `node server.mjs`
- ✅ Porta configurável via `$PORT`

---

## 📋 Verificação

Após gerar o domínio, teste:

### **1. Health Check:**
```bash
curl https://sua-url.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-02-26T...",
  "version": "1.0.0"
}
```

### **2. Logs do Railway:**
Deve mostrar:
```
🚀 Starting server on port 3000...
✅ Server listening on http://localhost:3000
📊 Environment: production
🗄️  Database: Connected
```

### **3. Acesso Frontend:**
```
https://sua-url.railway.app/
```

Deve abrir a tela de login

---

## 🎯 Resumo das Mudanças

### **Antes:**
- ❌ Usava `wrangler pages dev` (Cloudflare Workers)
- ❌ Não tinha servidor HTTP explícito
- ❌ Porta hardcoded 3000

### **Depois:**
- ✅ Usa `@hono/node-server` (Node.js puro)
- ✅ Servidor HTTP explícito em `server.mjs`
- ✅ Porta dinâmica via `process.env.PORT`
- ✅ Compatível com Railway, Render, Vercel

---

## 🔧 Configurações do Railway

### **Settings → Deploy:**
- **Build Command:** `npm run build` (automático)
- **Start Command:** `npm start` (automático via package.json)
- **Root Directory:** `/` (padrão)

### **Variables:**
- `DATABASE_URL` ✅ (já configurada)
- `JWT_SECRET` ✅ (já configurada)
- `NODE_ENV=production` ✅ (já configurada)
- `PORT=3000` ⬜ (opcional, Railway define automaticamente)

---

## 🎉 Próximo Passo

**AGORA SIM:**
1. Na tela atual do Railway, digite **`3000`** no campo "Target port"
2. Clique em **"Generate Domain"**
3. Aguarde 30-60 segundos
4. Copie a URL gerada
5. Teste o acesso

---

**Me avise quando tiver a URL! 🚀**
