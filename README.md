# 🌰 UÁRI Marketplace

O ecossistema digital do comércio de Tefé-AM e região.

## 📁 Estrutura do Monorepo

*   `apps/`
    *   `uari-mobile/`: App Mobile unificado do Consumidor e Lojista (Expo/React Native)
    *   `lojista-web/`: Painel de Gestão do Lojista (Next.js)
    *   `admin-web/`: Painel de Curadoria e Finanças Admin (Next.js)
*   `packages/`
    *   `database/`: Schemas, tipos gerados e scripts do Supabase
    *   `ui/`: Design System compartilhado

## 🛠️ Tecnologias Principais

*   **Frontend**: React, Next.js, Expo / React Native
*   **Backend & DB**: Supabase (PostgreSQL, Realtime, Storage, Edge Functions)
*   **Deploy**: Vercel & Expo EAS
*   **Orquestração**: Turborepo

## 🚀 Como Iniciar Localmente

### Pré-requisitos
*   Node.js v20+
*   NPM ou PNPM

### Instalação
```bash
# Instalar dependências raiz
npm install
```

### Rodar em Desenvolvimento
```bash
# Rodar todos os apps simultaneamente
npm run dev
```
