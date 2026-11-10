// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// Páginas do site são estáticas (pré-renderizadas); só o painel /keystatic roda no servidor.
export default defineConfig({
  site: 'https://www.pactoglobal.org.br',
  integrations: [react(), markdoc(), keystatic()],
  adapter: vercel({ imageService: false }),
  i18n: {
    locales: ['pt', 'en', 'es'],
    defaultLocale: 'pt',
    routing: { prefixDefaultLocale: false },
  },
  image: {
    layout: 'constrained',
  },
  build: { inlineStylesheets: 'always' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
