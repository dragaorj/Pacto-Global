import type { ImageMetadata } from 'astro';

/**
 * Mapa de todas as imagens em src/assets/images.
 * O CMS salva o caminho ("/src/assets/images/noticias/foto.jpg");
 * aqui convertemos para ImageMetadata, e o <Picture> do Astro gera AVIF/WebP responsivos.
 */
const all = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
});

export function asset(path?: string | null): ImageMetadata | undefined {
  if (!path) return undefined;
  return all[path]?.default;
}
