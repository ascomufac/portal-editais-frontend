/**
 * Roteiros dos tours guiados (portal público e painel administrativo).
 *
 * Cada passo aponta para um elemento marcado com `data-tour="<target>"`.
 * Passos sem `target` aparecem centralizados. Passos cujo alvo não está
 * visível (ex.: menu lateral fechado no celular) são pulados.
 *
 * Ao mudar um roteiro de forma relevante (novidades), mude a `version` dele
 * para que quem já viu o tour o receba de novo.
 */

export interface TourStep {
  target?: string;
  title: string;
  body: string;
}

export interface TourDefinition {
  /** Identifica o tour (registro de "já visto", evento e `?tour=<id>`). */
  id: string;
  version: string;
  steps: TourStep[];
}

export interface TourStartDetail {
  id: string;
}

export const TOUR_SEEN_KEY = 'portal-editais:tour-visto';
export const TOUR_START_EVENT = 'portal-editais:iniciar-tour';
/** Parâmetro de URL que abre um tour: `?tour=<id>`. */
export const TOUR_QUERY_PARAM = 'tour';

/** Chave no localStorage; o tour da home mantém a chave original. */
export const tourSeenKey = (id: string) =>
  id === 'home' ? TOUR_SEEN_KEY : `${TOUR_SEEN_KEY}:${id}`;

/** Abre o tour indicado, se ele estiver montado na tela atual. */
export const startTour = (id: string) =>
  window.dispatchEvent(
    new CustomEvent<TourStartDetail>(TOUR_START_EVENT, { detail: { id } })
  );

const HOME_TOUR_STEPS: TourStep[] = [
  {
    title: 'Boas-vindas ao novo Portal de Editais',
    body: 'Em poucos passos, mostramos o que mudou para você encontrar editais da Ufac mais rápido.',
  },
  {
    target: 'home-search',
    title: 'Busca em destaque',
    body: 'Pesquise por número do edital, curso, setor ou palavra-chave direto da página inicial.',
  },
  {
    target: 'home-shortcuts',
    title: 'Atalhos por período',
    body: 'Veja só o que foi publicado hoje, nesta semana ou neste mês. O atalho filtra a lista de atualizações.',
  },
  {
    target: 'home-sectors',
    title: 'Navegue por setor',
    body: 'Acesse as pró-reitorias e unidades com um clique, incluindo a Proafe — Pró-Reitoria de Ações Afirmativas e Equidade.',
  },
  {
    target: 'home-featured',
    title: 'Cards mais fáceis de ler',
    body: 'O número do edital aparece em cima e o assunto em destaque. Toque na estrela para salvar nos favoritos.',
  },
  {
    target: 'home-updates',
    title: 'Atualizações por dia',
    body: 'As novas publicações aparecem agrupadas por dia, com a etiqueta do setor. Nas páginas de setor há também um feed RSS.',
  },
  {
    target: 'home-favorites',
    title: 'Seus favoritos',
    body: 'Os editais marcados com estrela ficam aqui e em “Favoritos” no menu, salvos neste dispositivo, sem precisar de login.',
  },
  {
    target: 'sidebar-menu',
    title: 'Menu com todas as pastas',
    body: 'Cada setor mostra suas pastas em árvore, com ícones que diferenciam pastas, páginas e links.',
  },
  {
    target: 'tour-button',
    title: 'Rever o tour',
    body: 'Quando quiser, clique aqui para ver este roteiro de novo.',
  },
];

export const HOME_TOUR: TourDefinition = {
  id: 'home',
  version: '2026-11',
  steps: HOME_TOUR_STEPS,
};

/** Painel administrativo: visão geral (aparece no início do painel). */
export const ADMIN_TOUR: TourDefinition = {
  id: 'admin',
  version: '2026-11',
  steps: [
    {
      title: 'Boas-vindas ao painel de editais',
      body: 'Aqui você publica e organiza os editais do seu setor. Veja em poucos passos onde fica cada coisa.',
    },
    {
      target: 'admin-search',
      title: 'Busca',
      body: 'Encontre pastas, arquivos e links pelo nome em todo o portal, sem precisar navegar pelas pastas.',
    },
    {
      target: 'admin-new',
      title: 'Botão Novo',
      body: 'Envie arquivos ou crie pastas, páginas, links e coleções. O item é criado na pasta que estiver aberta.',
    },
    {
      target: 'admin-tree',
      title: 'Pastas do portal',
      body: 'A mesma estrutura do site público. Abra a pasta do seu setor para ver e gerenciar os editais dela. Arraste a borda para alargar o painel.',
    },
    {
      target: 'admin-feeds',
      title: 'Acompanhamento',
      body: '“Últimas interações” mostra o que foi alterado recentemente, “Para publicar” reúne os itens ainda privados e “Meus editais” lista o que você criou.',
    },
    {
      target: 'admin-recent',
      title: 'Recentes',
      body: 'Os últimos itens que você mexeu, para retomar o trabalho rapidamente.',
    },
    {
      target: 'admin-portal',
      title: 'Ver como o público vê',
      body: 'Abre o portal público para conferir como o edital ficou depois de publicado.',
    },
    {
      target: 'tour-button',
      title: 'Rever o tour',
      body: 'Quando quiser, clique aqui para ver este roteiro de novo. Dentro de uma pasta, o botão mostra o tour da tela de conteúdo.',
    },
  ],
};

/** Painel administrativo: tela de conteúdo de uma pasta. */
export const ADMIN_CONTENT_TOUR: TourDefinition = {
  id: 'admin-conteudo',
  version: '2026-11',
  steps: [
    {
      target: 'admin-content-title',
      title: 'Onde você está',
      body: 'O caminho mostra a pasta aberta. Clique no nome da pasta para copiar o link, editá-la ou atualizar a lista.',
    },
    {
      target: 'admin-content-view',
      title: 'Lista ou grade',
      body: 'Alterne entre a lista, com mais detalhes, e a grade, com cards maiores.',
    },
    {
      target: 'admin-content-items',
      title: 'Ações de cada item',
      body: 'Clique com o botão direito em um item, ou no menu ⋮ ao passar o mouse, para publicar, tornar privado, renomear, ver o histórico ou copiar o link.',
    },
    {
      target: 'admin-content-items',
      title: 'Vários itens de uma vez',
      body: 'Marque as caixas de seleção para recortar e colar em outra pasta, copiar, publicar, tornar privado ou excluir vários itens juntos. As ações aparecem numa barra acima da lista.',
    },
    {
      target: 'admin-new',
      title: 'Adicionar nesta pasta',
      body: 'Use o botão Novo para enviar arquivos ou criar itens dentro da pasta aberta.',
    },
  ],
};
