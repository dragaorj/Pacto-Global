import { cms } from './cms';
import { asset } from './images';

export const tipos: Record<string, string> = {
  infografico: 'Infográfico',
  guia: 'Guia',
  orientacoes: 'Orientações',
  relatorio: 'Relatório',
  estudo: 'Estudo',
};

export const temaLabel: Record<string, string> = {
  'direitos-humanos': 'Direitos Humanos',
  'meio-ambiente': 'Meio Ambiente',
  anticorrupcao: 'Anticorrupção',
  trabalho: 'Trabalho',
};

/** Todas as publicações, mais recentes primeiro (sem data vão para o fim, por título). */
export async function getPublicacoes() {
  const all = await cms.collections.publicacoes.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      href: `/publicacoes/${slug}`,
      titulo: entry.titulo,
      tipo: entry.tipo,
      tipoLabel: tipos[entry.tipo] ?? entry.tipo,
      tema: entry.tema,
      temaLabel: temaLabel[entry.tema] ?? entry.tema,
      data: entry.data,
      resumo: entry.resumo,
      idioma: entry.idioma,
      link: entry.arquivo || entry.link || null,
      exigeCadastro: entry.exigeCadastro,
      capa: asset(entry.capa),
      paginas: entry.paginas.map((p) => asset(p)).filter((p): p is NonNullable<typeof p> => !!p),
      conteudo: entry.conteudo,
    }))
    .sort((a, b) => {
      if (a.data && b.data) return b.data.localeCompare(a.data);
      if (a.data) return -1;
      if (b.data) return 1;
      return a.titulo.localeCompare(b.titulo, 'pt');
    });
}

export const formatDataLonga = (iso?: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
