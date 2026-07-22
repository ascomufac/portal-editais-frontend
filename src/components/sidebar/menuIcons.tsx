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

/**
 * Ícone do menu por ID do item Plone — compartilhado entre sidebar e título da página.
 * Itens sem ícone específico usam pasta; Proplan mantém o ícone de prédio.
 */
export const getMenuIcon = (itemId?: string | null): React.ReactNode => {
  if (!itemId) {
    return FolderIcon;
  }

  const id = itemId.toLowerCase().replace(/^\/+|\/+$/g, '').split('/').pop() || itemId;

  const iconsMap: Record<string, React.ReactNode> = {
    home: <HomeIcon />,
    inicio: <HomeIcon />,
    'pro-reitorias': <ProReitoriasIcon />,
    prograd: <GraduacaoIcon />,
    graduacao: <GraduacaoIcon />,
    propeg: <PesquisaIcon />,
    'pos-graduacao': <PesquisaIcon />,
    proex: <ExtensaoIcon />,
    extensao: <ExtensaoIcon />,
    proaes: <AssuntosEstudantisIcon />,
    estudantis: <AssuntosEstudantisIcon />,
    prodgep: <GestaoPessoasIcon />,
    pessoas: <GestaoPessoasIcon />,
    'centro-idiomas': <CentroIdiomasIcon />,
    'colegio-de-aplicacao': <ColegioAplicacaoIcon />,
    proplan: <Building className="h-full w-full text-ufac-blue" strokeWidth={2} />,
  };

  return iconsMap[id] || FolderIcon;
};

/** Resolve ícone a partir do título (fallback quando não há ID) */
export const getMenuIconByTitle = (title: string): React.ReactNode => {
  const titleMap: Record<string, string> = {
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
    'Centros de Ensino': 'centros',
    Proplan: 'proplan',
  };

  return getMenuIcon(titleMap[title] || title);
};
