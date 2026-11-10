# Pacto Global – Rede Brasil · Site

Astro 7 + **Keystatic** (CMS open-source e gratuito; todo o conteúdo fica em arquivos em `src/content/`).

## Rodar
```bash
npm install
npm run dev
```
- Home: http://localhost:4321 · `/en/` · `/es/`
- Design System: http://localhost:4321/design-system
- CMS (painel): http://localhost:4321/keystatic

## O que a Home tem
- **Banner de destaque** em tela cheia com menu fixo por cima; slider com 4 destaques (CMS), pausa, teclado e swipe.
- **Menu fixo** (transparente no banner → branco com blur ao rolar); gaveta no mobile.
- **Idiomas PT / EN / ES** (`src/i18n/ui.ts`; slides do banner têm tradução no CMS).
- **Modo claro / escuro** (segue o sistema; escolha salva no navegador).
- **Busca real** (Ctrl/⌘+K ou "/"): índice `search-index.json` gerado do CMS no build, sem acento, com destaque.
- **Acessibilidade**: tamanho de texto, alto contraste, destacar links, espaçamento de leitura, pausar animações, cursor grande, correção para daltonismo (protanopia, deuteranopia, tritanopia, tons de cinza) e tradutor de **Libras (VLibras)** carregado só quando ativado. Link "pular para o conteúdo", foco visível, contraste WCAG AA.
- **Animações GSAP** (ScrollTrigger) carregadas só após o load e desligadas com "reduzir movimento".
- **Imagens otimizadas**: AVIF/WebP responsivos gerados no build a partir de `src/assets/images`; fonte Outfit hospedada localmente.

## Lighthouse (build de produção, com compressão)
| Página | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Mobile | 90–98 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Relatórios em `docs/lighthouse/`.

## Estrutura
| Caminho | O quê |
|---|---|
| `src/styles/tokens.css` · `global.css` | Tokens (espelham as variáveis do Figma), tema escuro e classes de acessibilidade |
| `src/components/site/` | Header, Footer, SearchDialog, A11yPanel |
| `src/components/home/` | Seções da Home |
| `src/components/ui/` · `cards/` | Componentes do Design System |
| `src/scripts/site.ts` · `animations.ts` | Interações e animações |
| `keystatic.config.ts` | Modelos do CMS |

## Publicar
Recomendado: Vercel ou Netlify (gratuitos; já servem com compressão e cache longo).
1. Suba o projeto para um repositório no GitHub.
2. Troque o adapter `@astrojs/node` pelo da plataforma em `astro.config.mjs`.
3. Em `keystatic.config.ts`, mude `storage` para `{ kind: 'github', repo: 'org/repo' }` para editar o conteúdo online.
