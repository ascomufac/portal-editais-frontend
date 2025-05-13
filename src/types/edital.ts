
import { ReactNode } from 'react';

export type EditalType = {
  id: string;
  title: string;
  description: string;
  color?: string;
  icon?: ReactNode;
  href: string;
  modified?: string;
  effective?: string;
  author?: string;
  section?: string;
  items_total?: number;
  is_folderish?: boolean;
  '@type'?: string;
};

export type EditalDocumentType = {
  id: string;
  title: string;
  description?: string;
  author?: string;
  Creator?: string;
  type?: string;
  lastModified?: string;
  modified?: string;
  created?: string;
  effective?: string;
  url: string;
  isFolder?: boolean;
  '@id'?: string;
  '@type'?: string;
  parentId?: string | null;
  children?: EditalDocumentType[];
  items_total?: number;
  is_folderish?: boolean;
};

// Adding the missing types that were causing build errors
export type CategoryDataType = {
  id?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  color?: string;
  editais: EditalType[];
};

export type CategoryDataMapType = Record<string, CategoryDataType>;
