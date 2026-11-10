import type { APIRoute } from 'astro';
import { cms } from '../lib/cms';

/** Índice da busca do site — gerado no build a partir do CMS (arquivo estático e leve). */
export const prerender = true;

export const GET: APIRoute = async () => {
  const [noticias, eventos, publicacoes, plataformas, movimentos] = await Promise.all([
    cms.collections.noticias.all(),
    cms.collections.eventos.all(),
    cms.collections.publicacoes.all(),
    cms.collections.plataformas.all(),
    cms.collections.movimentos.all(),
  ]);
  const items = [
    ...noticias.map((n) => ({ type: 'noticia', title: n.entry.titulo, text: n.entry.resumo, url: `/noticias/${n.slug}`, date: n.entry.data })),
    ...eventos.map((e) => ({ type: 'evento', title: e.entry.titulo, text: `${e.entry.tema ?? ''} · ${e.entry.local} · ${e.entry.data}`, url: e.entry.link || '/#eventos', date: e.entry.data })),
    ...publicacoes.map((p) => ({ type: 'publicacao', title: p.entry.titulo, text: p.entry.resumo, url: `/publicacoes/${p.slug}`, date: p.entry.data })),
    { type: 'pagina', title: 'Publicações', text: 'Todas as publicações: guias, infográficos e pesquisas.', url: '/publicacoes' },
    ...plataformas.map((p) => ({ type: 'plataforma', title: p.entry.titulo, text: p.entry.descricao, url: '/#plataformas' })),
    ...movimentos.map((m) => ({ type: 'movimento', title: `Movimento ${m.entry.nome}`, text: '', url: m.entry.link || '/#movimentos' })),
    { type: 'pagina', title: 'Quem somos · Dez Princípios', text: 'Direitos Humanos, Trabalho, Meio Ambiente, Anticorrupção. Maior iniciativa de sustentabilidade corporativa do mundo.', url: '/#quem-somos' },
    { type: 'pagina', title: 'Como aderir ao Pacto Global', text: 'Empresas e organizações de todos os portes podem aderir aos Dez Princípios.', url: '/#aderir' },
    { type: 'pagina', title: 'Nossa magnitude', text: 'Empresas comprometidas, países, redes locais e participantes.', url: '/#magnitude' },
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
