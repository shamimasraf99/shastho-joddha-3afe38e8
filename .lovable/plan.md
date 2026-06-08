# Plano completo de SEO, Acessibilidade e Performance

Domínio canônico do projeto: **https://helthpidia.pp.ua**

## 1. Arquivos de descoberta (raiz)

- **`public/robots.txt`** — `User-agent: *` + `Allow: /` + `Sitemap: https://helthpidia.pp.ua/sitemap.xml`.
- **`public/llms.txt`** — H1 + descrição + links para páginas públicas (home, encyclopedia, doctors, hospitals, labs, donors, news, qa, tools, body, videos, podcasts, myths, about, contact, privacy, terms). Excluir `/auth`, `/admin/*`, `/_authenticated/*`.
- **`src/routes/sitemap[.]xml.ts`** — server route que lista as rotas estáticas + entradas dinâmicas de `articles` (news/encyclopedia/blog publicados), `body_parts`, `categories`, `hospitals`, `doctors`, `labs` (somente registros ativos/publicados) via `supabaseAdmin` dentro do handler.

## 2. Meta tags por rota (head() do TanStack)

Adicionar em cada rota pública (`about`, `contact`, `privacy`, `terms`, `doctors`, `hospitals`, `labs`, `donors`, `encyclopedia`, `news`, `qa`, `tools`, `body`, `videos`, `podcasts`, `myths`, `search`):
- `title` único (<60 chars) e `description` única (50-160 chars)
- `og:title`, `og:description`, `og:url` absoluto, `og:type`
- `<link rel="canonical">` absoluto **apenas na folha** (nunca em `__root.tsx`)

Rotas dinâmicas (`article.$slug`, `hospital.$slug`, `body.$slug`, `category.$slug`) — usar `loader` para buscar título/excerpt/cover e injetar em `head()` (title, description, og:title, og:description, og:url, og:image quando houver `cover_image`, `og:type=article`).

Remover `og:image` global de `__root.tsx` (placeholder do gpt-engineer) — só mantém em folhas com imagem real.

## 3. Dados estruturados (JSON-LD)

- `__root.tsx` → `WebSite` + `Organization` (nome স্বাস্থ্যপিডিয়া, url, logo).
- `article.$slug` → `Article` (headline, datePublished, image, author).
- `qa.tsx` → `FAQPage` com Q&A publicados.
- `doctors.tsx`, `hospitals.tsx`, `labs.tsx` → `ItemList` de `MedicalBusiness`/`Physician`/`Hospital`/`MedicalClinic`.
- `hospital.$slug` → `Hospital` (name, address, telephone, geo).
- Rotas profundas → `BreadcrumbList`.

## 4. Acessibilidade (a11y)

- `aria-label="খুঁজুন"` em todos os inputs `type="search"` em: `SiteHeader.tsx` (desktop+mobile), `index.tsx` hero, `encyclopedia.tsx`, `doctors.tsx`, `hospitals.tsx`, `labs.tsx`, `donors.tsx`.
- `<main>` único — envolver `<Outlet />` em `__root.tsx` (e remover `<main>` duplicados das páginas que tenham).
- `alt` descritivo em todos os `<img>` (logo, cover, ícones decorativos com `alt=""`).
- `aria-label` em botões só de ícone (menu hambúrguer, X de fechar) — já existem em alguns.

## 5. Performance / Core Web Vitals

- Imagem LCP da home (logo / cover de notícias): `width`, `height` explícitos + `fetchpriority="high"` + remover `loading="lazy"` da primeira do feed.
- Demais `<img>` (notícias, doctors, hospitals): `loading="lazy"` + `decoding="async"`.
- Google Fonts já com `&display=swap` ✓ (manter).
- `aspect-*` wrappers para evitar CLS.

## 6. Headings (H1-H6)

- Garantir 1 `<h1>` por página (home tem ✓). Auditar `about`, `contact`, `privacy`, `terms`, `tools`, `videos`, `podcasts`, `myths` e adicionar `<h1>` se faltar. Subseções em `<h2>` / `<h3>` em ordem.

## 7. URLs amigáveis

- Já estão em slugs Bangla/ASCII (`/doctors`, `/article/:slug`, `/hospital/:slug`). Nenhuma mudança estrutural.

## 8. Link building interno

- `SiteFooter` — adicionar bloco "Explore" com links para encyclopedia, doctors, hospitals, labs, donors, qa, news (alguns já existem; completar).
- Em `article.$slug` — bloco "সম্পর্কিত আর্টিকেল" (related: mesma categoria, 4 itens).
- Em `category.$slug` — destaque para artigos da categoria.
- Breadcrumbs visíveis em rotas profundas (`/article/:slug`, `/hospital/:slug`, `/body/:slug`, `/category/:slug`).

## 9. Atualização de findings

Após implementar, marcar `http:robots`, `http:sitemap`, `http:llms_txt`, `lighthouse:lighthouse_performance`, `agent_content:content`, `agent_metadata:metadata_quality`, `agent_metadata:social_preview`, `agent_metadata:structured_data` como `fixed`. `gsc:gsc` permanece (requer ação do usuário para conectar o Google Search Console).

## Detalhes técnicos

- Sitemap usa `supabaseAdmin` dentro do `.handler()` via `await import("@/integrations/supabase/client.server")` para respeitar `tanstack-supabase-import-graph`.
- Canonical SOMENTE em folhas (issue TanStack/router#6719 — `links` concatena).
- `og:image` SOMENTE em folhas que têm imagem real; remover do `__root.tsx`.

## Fora do escopo (precisa do usuário)

- Conectar Google Search Console (requer OAuth do usuário).
- Geração de imagens OG por rota (posso gerar depois se desejar).
