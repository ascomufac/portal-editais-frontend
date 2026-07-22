import FileTypeIcon, {
  getFileKind,
} from '@/components/icons/FileTypeIcon';
import { cn } from '@/lib/utils';
import {
  getContentDisplayName,
  getReviewState,
  isFolderishContent,
  resolveContentType,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { Folder, Layers, Link2, Lock } from 'lucide-react';
import React from 'react';

type AdminDriveIconProps = {
  item: PloneContentItem;
  compact?: boolean;
  className?: string;
};

const PrivateBadge: React.FC = () => (
  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-600">
    <Lock className="h-2 w-2 fill-none text-white" strokeWidth={2.5} aria-hidden />
  </span>
);

/**
 * Ícones estilo Google Drive para o admin:
 * pasta / link / PDF·DOC·XLS… / página Plone.
 */
const AdminDriveIcon: React.FC<AdminDriveIconProps> = ({
  item,
  compact = false,
  className,
}) => {
  const privateItem = getReviewState(item) === 'private';
  const type = resolveContentType(item);
  const folderish = isFolderishContent(item);
  const name = getContentDisplayName(item);
  const fileMeta = item.file;
  const filename =
    (fileMeta && typeof fileMeta === 'object' && 'filename' in fileMeta
      ? String(fileMeta.filename || '')
      : '') || '';

  const box = cn(
    compact
      ? 'relative flex h-8 w-8 shrink-0 items-center justify-center'
      : 'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
    className
  );
  const icon = 'h-5 w-5';

  if (
    folderish ||
    type === 'Folder' ||
    type === 'Plone Site' ||
    type === 'Collection'
  ) {
    const isCollection = type === 'Collection';
    return (
      <span
        className={cn(
          box,
          !compact && (privateItem ? 'bg-slate-100' : 'bg-sky-50')
        )}
      >
        {isCollection ? (
          <Layers
            className={cn(
              icon,
              privateItem ? 'text-slate-500' : 'text-sky-600'
            )}
          />
        ) : (
          <Folder
            className={cn(
              icon,
              privateItem
                ? 'fill-slate-400/90 text-slate-500'
                : 'fill-sky-400 text-sky-500'
            )}
            strokeWidth={1.5}
          />
        )}
        {privateItem && <PrivateBadge />}
      </span>
    );
  }

  if (type === 'Link') {
    return (
      <span
        className={cn(
          box,
          !compact && (privateItem ? 'bg-slate-100' : 'bg-sky-50')
        )}
      >
        <Link2
          className={cn(icon, privateItem ? 'text-slate-500' : 'text-sky-600')}
        />
        {privateItem && <PrivateBadge />}
      </span>
    );
  }

  // Arquivo binário / imagem: ícone por extensão (PDF vermelho, DOC azul, …)
  if (type === 'File' || type === 'Image') {
    const kind =
      type === 'Image'
        ? 'img'
        : getFileKind(filename, name, item.id, item['@id']);
    return (
      <span className={cn(box, !compact && 'bg-transparent')}>
        <FileTypeIcon
          kind={kind}
          source={filename || name}
          sources={[filename, name, item.id, item['@id']]}
          size={compact ? 20 : 22}
          withBackground={!compact}
          className={compact ? undefined : 'rounded-lg'}
        />
        {privateItem && <PrivateBadge />}
      </span>
    );
  }

  // Página Plone / notícia → documento azul (estilo Google Docs)
  if (type === 'Document' || type === 'NewsItem' || type === 'News Item') {
    return (
      <span className={cn(box, !compact && 'bg-transparent')}>
        <FileTypeIcon
          kind="doc"
          size={compact ? 20 : 22}
          withBackground={!compact}
          className={compact ? undefined : 'rounded-lg'}
        />
        {privateItem && <PrivateBadge />}
      </span>
    );
  }

  // Fallback: tenta extensão no nome; senão arquivo genérico
  const kind = getFileKind(filename, name, item.id, item['@id']);
  return (
    <span className={cn(box, !compact && 'bg-transparent')}>
      <FileTypeIcon
        kind={kind}
        source={filename || name}
        sources={[filename, name, item.id, item['@id']]}
        size={compact ? 20 : 22}
        withBackground={!compact}
        className={compact ? undefined : 'rounded-lg'}
      />
      {privateItem && <PrivateBadge />}
    </span>
  );
};

export default AdminDriveIcon;
