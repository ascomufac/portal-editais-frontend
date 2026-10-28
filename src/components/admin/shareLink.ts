import { toEditalHref } from '@/services/editalService';
import {
  isFolderishContent,
  resolveContentType,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { toast } from 'sonner';

/**
 * Link para compartilhar: pastas/páginas abrem no portal público (/edital/...);
 * arquivos e imagens usam a URL do próprio arquivo no Plone.
 */
export const getShareLink = (item: PloneContentItem): string => {
  const type = resolveContentType(item);
  if (isFolderishContent(item) || type === 'Document') {
    return `${window.location.origin}${toEditalHref(item['@id'])}`;
  }
  return item['@id'];
};

export const copyShareLink = async (item: PloneContentItem): Promise<void> => {
  try {
    await navigator.clipboard.writeText(getShareLink(item));
    toast.success('Link copiado.');
  } catch {
    toast.error('Não foi possível copiar o link.');
  }
};
