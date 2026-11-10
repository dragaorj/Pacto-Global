import { config, collection, singleton, fields } from '@keystatic/core';

/**
 * CMS do site Pacto Global — Keystatic (open-source, gratuito, Git-based).
 * Todo conteúdo vira arquivo dentro de src/content/ e é versionado junto com o código.
 * Painel: http://localhost:4321/keystatic
 *
 * storage "local": edita os arquivos no seu computador (desenvolvimento).
 * Para editar online em produção, troque para { kind: 'github', repo: 'usuario/repo' }.
 */

// Imagens vão para src/assets/images/<dir> — o Astro gera AVIF/WebP em vários tamanhos no build.
const imagem = (label: string, dir: string) =>
  fields.image({
    label,
    directory: `src/assets/images/${dir}`,
    publicPath: `/src/assets/images/${dir}/`,
  });

const traducao = () =>
  fields.object(
    {
      titulo: fields.text({ label: 'Título' }),
      destaque: fields.text({ label: 'Trecho em dourado' }),
      descricao: fields.text({ label: 'Descrição', multiline: true }),
    },
    { label: 'Tradução' }
  );

const temas = [
  { label: 'Direitos Humanos', value: 'direitos-humanos' },
  { label: 'Meio Ambiente', value: 'meio-ambiente' },
  { label: 'Anticorrupção', value: 'anticorrupcao' },
  { label: 'Trabalho', value: 'trabalho' },
] as const;

// No seu computador: edita os arquivos locais.
// No site publicado: salva direto no GitHub (defina PUBLIC_KEYSTATIC_REPO="usuario/repositorio" no Vercel).
const repo = import.meta.env.PUBLIC_KEYSTATIC_REPO as `${string}/${string}` | undefined;

export default config({
  storage: repo ? { kind: 'github', repo } : { kind: 'local' },
  ui: {
    brand: { name: 'Pacto Global · Rede Brasil' },
    navigation: {
      Conteúdo: ['noticias', 'eventos', 'publicacoes'],
      Institucional: ['plataformas', 'movimentos', 'parceiros'],
      Páginas: ['home', 'configuracoes'],
    },
  },

  collections: {
    noticias: collection({
      label: 'Notícias',
      slugField: 'titulo',
      path: 'src/content/noticias/*',
      format: { contentField: 'conteudo' },
      entryLayout: 'content',
      columns: ['titulo', 'data'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        data: fields.date({ label: 'Data de publicação', validation: { isRequired: true } }),
        resumo: fields.text({ label: 'Resumo', multiline: true }),
        tag: fields.text({ label: 'Tag', defaultValue: 'SDGs' }),
        capa: imagem('Imagem de capa', 'noticias'),
        destaque: fields.checkbox({ label: 'Destaque na Home', defaultValue: false }),
        conteudo: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),

    eventos: collection({
      label: 'Eventos',
      slugField: 'titulo',
      path: 'src/content/eventos/*',
      format: { data: 'yaml' },
      columns: ['titulo', 'data'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        data: fields.date({ label: 'Data', validation: { isRequired: true } }),
        local: fields.select({
          label: 'Formato',
          options: [
            { label: 'Online', value: 'online' },
            { label: 'Presencial', value: 'presencial' },
            { label: 'Híbrido', value: 'hibrido' },
          ],
          defaultValue: 'online',
        }),
        tema: fields.text({ label: 'Tema (ex.: Direitos Humanos)' }),
        link: fields.url({ label: 'Link de inscrição' }),
        capa: imagem('Imagem', 'eventos'),
      },
    }),

    publicacoes: collection({
      label: 'Publicações',
      slugField: 'titulo',
      path: 'src/content/publicacoes/*',
      format: { contentField: 'conteudo' },
      entryLayout: 'content',
      columns: ['titulo', 'data'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Infográfico', value: 'infografico' },
            { label: 'Guia', value: 'guia' },
            { label: 'Orientações', value: 'orientacoes' },
            { label: 'Relatório', value: 'relatorio' },
            { label: 'Estudo', value: 'estudo' },
          ],
          defaultValue: 'infografico',
        }),
        tema: fields.select({ label: 'Tema', options: temas, defaultValue: 'direitos-humanos' }),
        data: fields.date({ label: 'Data (evento ou lançamento)' }),
        resumo: fields.text({ label: 'Resumo', multiline: true }),
        idioma: fields.text({ label: 'Idioma', defaultValue: 'Português' }),
        link: fields.url({ label: 'Link para baixar / acessar (PDF ou landing page)' }),
        exigeCadastro: fields.checkbox({ label: 'O download exige cadastro (formulário)', defaultValue: false }),
        arquivo: fields.file({
          label: 'Arquivo (PDF) hospedado no site',
          directory: 'public/files/publicacoes',
          publicPath: '/files/publicacoes/',
        }),
        capa: imagem('Capa', 'publicacoes'),
        paginas: fields.array(imagem('Página', 'publicacoes/paginas'), {
          label: 'Páginas do infográfico (imagens exibidas na página)',
          itemLabel: (p) => p.value?.filename ?? 'Página',
        }),
        conteudo: fields.markdoc({ label: 'Conteúdo da página' }),
      },
    }),

    plataformas: collection({
      label: 'Plataformas de Ação',
      slugField: 'titulo',
      path: 'src/content/plataformas/*',
      format: { data: 'yaml' },
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        cor: fields.select({
          label: 'Cor da plataforma',
          options: [
            { label: 'Clima (azul)', value: 'clima' },
            { label: 'Anticorrupção (vermelho)', value: 'anticorrupcao' },
            { label: 'Agricultura (verde)', value: 'agricultura' },
            { label: 'Direitos Humanos (magenta)', value: 'direitos-humanos' },
            { label: 'Comunicação (laranja)', value: 'comunicacao' },
            { label: 'Água (ciano)', value: 'agua' },
          ],
          defaultValue: 'clima',
        }),
        descricao: fields.text({ label: 'Descrição', multiline: true }),
        ods: fields.array(fields.integer({ label: 'ODS', validation: { min: 1, max: 17 } }), {
          label: 'ODS relacionados',
          itemLabel: (p) => `ODS ${p.value ?? ''}`,
        }),
        ordem: fields.integer({ label: 'Ordem', defaultValue: 0 }),
      },
    }),

    movimentos: collection({
      label: 'Movimentos',
      slugField: 'nome',
      path: 'src/content/movimentos/*',
      format: { data: 'yaml' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        cor: fields.text({ label: 'Cor (hex)', defaultValue: '#ccb146' }),
        logo: imagem('Logotipo', 'movimentos'),
        link: fields.url({ label: 'Link' }),
        ordem: fields.integer({ label: 'Ordem', defaultValue: 0 }),
      },
    }),

    parceiros: collection({
      label: 'Parceiros',
      slugField: 'nome',
      path: 'src/content/parceiros/*',
      format: { data: 'yaml' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        logo: imagem('Logo', 'parceiros'),
        site: fields.url({ label: 'Site' }),
      },
    }),
  },

  singletons: {
    home: singleton({
      label: 'Home',
      path: 'src/content/paginas/home',
      format: { data: 'yaml' },
      schema: {
        hero: fields.array(
          fields.object({
            categoria: fields.text({ label: 'Categoria', defaultValue: 'Eventos' }),
            titulo: fields.text({ label: 'Título' }),
            destaque: fields.text({ label: 'Trecho em dourado' }),
            descricao: fields.text({ label: 'Descrição', multiline: true }),
            link: fields.text({ label: 'Link "Saiba mais"', defaultValue: '#' }),
            video: fields.text({ label: 'Link do vídeo (opcional)' }),
            imagem: imagem('Imagem de fundo', 'hero'),
            posicao: fields.select({
              label: 'Enquadramento da imagem',
              options: [
                { label: 'Centro', value: 'center' },
                { label: 'Direita', value: 'right' },
                { label: 'Esquerda', value: 'left' },
              ],
              defaultValue: 'center',
            }),
            en: traducao(),
            es: traducao(),
          }),
          { label: 'Slides do hero', itemLabel: (p) => p.fields.titulo.value || 'Slide' }
        ),
        magnitude: fields.object(
          {
            titulo: fields.text({ label: 'Título', defaultValue: 'A maior iniciativa de' }),
            destaque: fields.text({ label: 'Destaque', defaultValue: 'sustentabilidade corporativa do mundo.' }),
            descricao: fields.text({ label: 'Descrição', multiline: true }),
            numeros: fields.array(
              fields.object({
                valor: fields.text({ label: 'Valor' }),
                rotulo: fields.text({ label: 'Rótulo' }),
                sublegenda: fields.text({ label: 'Sublegenda' }),
                icone: fields.select({
                  label: 'Ícone',
                  options: [
                    { label: 'Empresas', value: 'building' },
                    { label: 'Países', value: 'globe' },
                    { label: 'Instituições', value: 'landmark' },
                    { label: 'Local', value: 'map-pin' },
                    { label: 'Pessoas', value: 'users' },
                  ],
                  defaultValue: 'building',
                }),
              }),
              { label: 'Números', itemLabel: (p) => `${p.fields.valor.value} ${p.fields.rotulo.value}` }
            ),
          },
          { label: 'Nossa Magnitude' }
        ),
      },
    }),

    configuracoes: singleton({
      label: 'Configurações gerais',
      path: 'src/content/paginas/configuracoes',
      format: { data: 'yaml' },
      schema: {
        linkedin: fields.url({ label: 'LinkedIn' }),
        instagram: fields.url({ label: 'Instagram' }),
        youtube: fields.url({ label: 'YouTube' }),
        x: fields.url({ label: 'X / Twitter' }),
        linkAderir: fields.url({ label: 'Link "Quero aderir"' }),
      },
    }),
  },
});
