import {
  AssuntosEstudantisIcon,
  CentroIdiomasIcon,
  ColegioAplicacaoIcon,
  ExtensaoIcon,
  GestaoPessoasIcon,
  GraduacaoIcon,
  HomeIcon,
  PesquisaIcon,
  ProReitoriasIcon,
} from '@/components/sidebar/SidebarIcons';
import { Building, Folder } from 'lucide-react';
import React from 'react';

const FolderIcon = (
  <Folder className="h-full w-full text-ufac-blue" strokeWidth={2} />
);

const normalizeId = (itemId: string): string =>
  itemId
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .pop() || itemId.toLowerCase();

/** Aliases de ID Plone → chave canônica do ícone. */
const ID_ALIASES: Record<string, string> = {
  home: 'home',
  inicio: 'home',
  'pro-reitorias': 'pro-reitorias',
  prograd: 'prograd',
  graduacao: 'prograd',
  propeg: 'propeg',
  'pos-graduacao': 'propeg',
  proex: 'proex',
  extensao: 'proex',
  proaes: 'proaes',
  estudantis: 'proaes',
  prodgep: 'prodgep',
  pessoas: 'prodgep',
  'centro-idiomas': 'centro-idiomas',
  idiomas: 'centro-idiomas',
  'colegio-de-aplicacao': 'colegio-de-aplicacao',
  colegio: 'colegio-de-aplicacao',
  cap: 'colegio-de-aplicacao',
  proplan: 'proplan',
};

const TITLE_TO_KEY: Record<string, string> = {
  Início: 'home',
  'Pró-reitorias': 'pro-reitorias',
  Graduação: 'prograd',
  Prograd: 'prograd',
  'Pesquisa e Pós-graduação': 'propeg',
  Propeg: 'propeg',
  'Extensão e Cultura': 'proex',
  Proex: 'proex',
  'Assuntos Estudantis': 'proaes',
  Proaes: 'proaes',
  'Gestão de Pessoas': 'prodgep',
  Prodgep: 'prodgep',
  'Centro de Idiomas': 'centro-idiomas',
  'Colégio de Aplicação': 'colegio-de-aplicacao',
  Proplan: 'proplan',
};

const iconsForKey = (key: string): React.ReactNode | null => {
  const map: Record<string, React.ReactNode> = {
    home: <HomeIcon />,
    'pro-reitorias': <ProReitoriasIcon />,
    prograd: <GraduacaoIcon />,
    propeg: <PesquisaIcon />,
    proex: <ExtensaoIcon />,
    proaes: <AssuntosEstudantisIcon />,
    prodgep: <GestaoPessoasIcon />,
    'centro-idiomas': <CentroIdiomasIcon />,
    'colegio-de-aplicacao': <ColegioAplicacaoIcon />,
    proplan: <Building className="h-full w-full text-ufac-blue" strokeWidth={2} />,
  };
  return map[key] ?? null;
};

/**
 * Chave canônica do ícone de setor (ou null se for pasta genérica /
 * se não houver glifo dedicado — ex.: Centros de Ensino).
 */
export const resolveMenuIconKey = (
  itemId?: string | null,
  title?: string | null
): string | null => {
  let key: string | null = null;

  if (itemId) {
    const id = normalizeId(itemId);
    if (ID_ALIASES[id]) key = ID_ALIASES[id];
    else if (id.includes('colegio') || id === 'cap') key = 'colegio-de-aplicacao';
    else if (id.includes('idioma')) key = 'centro-idiomas';
  }

  if (!key && title) {
    const exact = TITLE_TO_KEY[title];
    if (exact) key = exact;
    else {
      const lower = title.toLowerCase();
      if (lower.includes('colégio de aplicação') || lower.includes('colegio de aplicacao')) {
        key = 'colegio-de-aplicacao';
      } else if (lower.includes('centro de idiomas')) {
        key = 'centro-idiomas';
      }
    }
  }

  // Só retorna chave com ícone real (evita pasta outline como “setor”).
  if (!key || !iconsForKey(key)) return null;
  return key;
};

/** Ícone de setor sem fallback de pasta (para badge sobre pasta). */
export const getSectorMenuIcon = (key: string): React.ReactNode | null =>
  iconsForKey(key);

/**
 * Ícone do menu por ID do item Plone — compartilhado entre sidebar e título da página.
 * Itens sem ícone específico usam pasta; Proplan mantém o ícone de prédio.
 */
export const getMenuIcon = (itemId?: string | null): React.ReactNode => {
  const key = resolveMenuIconKey(itemId);
  if (!key) return FolderIcon;
  return iconsForKey(key) ?? FolderIcon;
};

/** Resolve ícone a partir do título (fallback quando não há ID) */
export const getMenuIconByTitle = (title: string): React.ReactNode => {
  const key = resolveMenuIconKey(null, title) || TITLE_TO_KEY[title];
  if (!key) return getMenuIcon(title);
  return iconsForKey(key) ?? FolderIcon;
};
