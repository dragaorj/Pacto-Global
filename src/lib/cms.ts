import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

/** Leitor do CMS — use nas páginas: `const noticias = await cms.collections.noticias.all()` */
export const cms = createReader(process.cwd(), keystaticConfig);

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR') : '';
