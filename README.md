# Controle de Salário Maternidade — versão Supabase

Versão standalone do app, pronta para ser hospedada fora do Claude (Vercel, Netlify,
servidor próprio etc.), com login de verdade e banco de dados real. Cada cliente que
você vender essa ferramenta cria sua própria conta e só enxerga os próprios registros
— o isolamento é garantido pelo banco (Row Level Security), não pelo código.

## 1. Criar o projeto no Supabase

1. Crie uma conta em https://supabase.com e clique em "New project".
2. Anote a senha do banco que você definir (só serve para acesso administrativo direto).
3. Espere o projeto terminar de provisionar (leva 1–2 minutos).

## 2. Criar as tabelas

1. No painel do projeto, abra **SQL Editor > New query**.
2. Copie todo o conteúdo do arquivo `schema.sql` (na raiz deste projeto) e cole lá.
3. Clique em **Run**. Isso cria as tabelas `beneficios` e `partos_futuros`, já com
   Row Level Security ativado — cada usuário só acessa as próprias linhas.

## 3. Pegar as chaves da API

1. No painel, vá em **Project Settings > API**.
2. Copie a **Project URL** e a chave **anon public**.
3. Copie o arquivo `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 4. Ativar login por e-mail/senha

No painel do Supabase, vá em **Authentication > Providers** e confirme que
"Email" está habilitado (já vem habilitado por padrão). Se quiser pular a
confirmação por e-mail durante os testes, em **Authentication > Settings**
desative "Confirm email" temporariamente.

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).
Crie uma conta pela própria tela de cadastro do app para testar.

## 6. Publicar (hospedar de verdade)

A forma mais simples é a **Vercel**:

```bash
npm install -g vercel
vercel
```

Durante o processo, quando perguntado, adicione as duas variáveis de ambiente
(`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) com os mesmos valores do seu
`.env`. Ao final, a Vercel te dá um link público — esse é o link que você pode
vender/compartilhar com os escritórios de advocacia.

Alternativas: Netlify (`netlify deploy`) ou qualquer hospedagem de site estático,
já que o resultado de `npm run build` é só HTML/CSS/JS puro (pasta `dist/`).

## Estrutura de arquivos

```
schema.sql              → script SQL para criar as tabelas no Supabase
.env.example             → modelo das variáveis de ambiente
src/supabaseClient.js    → conexão com o Supabase
src/mapping.js           → conversão entre o formato do app e as colunas do banco
src/useSupabaseTable.js  → hook genérico de CRUD (buscar/criar/editar/excluir)
src/Auth.jsx             → tela de login e cadastro
src/App.jsx              → aplicativo (dashboard, tabelas, formulários)
```

## O que muda em relação à versão dentro do Claude

- Em vez do `window.storage` do artefato, os dados agora vivem num banco Postgres
  de verdade, com backup e sem risco de sumir se você "despublicar" algo no Claude.
- Cada cliente cria a própria conta (e-mail/senha) e vê só os próprios dados —
  antes isso já acontecia com o armazenamento "pessoal", agora é reforçado por
  regras no próprio banco (Row Level Security).
- Sem limite prático de 20 MB por artefato: o plano gratuito do Supabase já
  aguenta uma quantidade grande de registros, e dá pra migrar de plano conforme
  o negócio cresce.
