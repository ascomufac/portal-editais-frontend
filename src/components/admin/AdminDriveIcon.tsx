import FileTypeIcon, {
  getFileKind,
} from '@/components/icons/FileTypeIcon';
import { resolveMenuIconKey, getSectorMenuIcon } from '@/components/sidebar/menuIcons';
import { cn } from '@/lib/utils';
import {
  getContentDisplayName,
  getReviewState,
  isFolderishContent,
  resolveContentType,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { Folder, FolderOpen, Layers, Link2, Lock } from 'lucide-react';
import React from 'react';

type AdminDriveIconProps = {
  item: PloneContentItem;
  compact?: boolean;
  /** Pasta expandida na árvore (ícone de pasta aberta, estilo Drive). */
  open?: boolean;
  className?: string;
};

const PrivateBadge: React.FC = () => (
  <span className="absolute -bottom-0.5 -left-0.5 z-[1] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-600 ring-2 ring-white">
    <Lock className="h-2 w-2 fill-none text-white" strokeWidth={2.5} aria-hidden />
  </span>
);

const SectorFolderBadge: React.FC<{ sectorKey: string }> = ({ sectorKey }) => {
  const glyph = getSectorMenuIcon(sectorKey);
  if (!glyph) return null;
  return (
    <span
      className="absolute -bottom-1 -right-0.5 z-[1] flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-sky-200/80"
      aria-hidden
    >
      <span className="flex h-3 w-3 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
        {glyph}
      </span>
    </span>
  );
};

/**
 * Reserva espaço para badges que saem do ícone, sem reduzir o glifo.
 * Assim o círculo do cadeado não é cortado por pais com overflow-hidden.
 */
const withBadgeRoom = (node: React.ReactNode, needsRoom: boolean) => {
  if (!needsRoom) return node;
  return (
    <span className="relative inline-flex shrink-0 overflow-visible p-1 -m-1">
      {node}
    </span>
  );
};

/**
 * Ícones estilo Google Drive para o admin:
 * pasta / link / PDF·DOC·XLS… / página Plone.
 * Pastas de setor: pasta + ícone da pró-reitoria sobreposto.
 */
const AdminDriveIcon: React.FC<AdminDriveIconProps> = ({
  item,
  compact = false,
  open = false,
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
    'relative overflow-visible',
    compact
      ? 'flex h-8 w-8 shrink-0 items-center justify-center'
      : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
    className
  );
  const icon = 'h-5 w-5';
  const folderTone = privateItem
    ? 'fill-slate-400/90 text-slate-500'
    : 'fill-sky-400 text-sky-500';

  if (
    folderish ||
    type === 'Folder' ||
    type === 'Plone Site' ||
    type === 'Collection'
  ) {
    const isCollection = type === 'Collection';
    const sectorKey = !isCollection
      ? resolveMenuIconKey(item.id, name)
      : null;
    const showSector =
      Boolean(sectorKey) && sectorKey !== 'home' && sectorKey !== null;

    if (isCollection) {
      return withBadgeRoom(
        <span
          className={cn(
            box,
            !compact && (privateItem ? 'bg-slate-100' : 'bg-sky-50')
          )}
        >
          <Layers
            className={cn(icon, privateItem ? 'text-slate-500' : 'text-sky-600')}
          />
          {privateItem && <PrivateBadge />}
        </span>,
        privateItem
      );
    }

    const FolderGlyph = open ? FolderOpen : Folder;

    return withBadgeRoom(
      <span
        className={cn(
          box,
          !compact &&
            !showSector &&
            (privateItem ? 'bg-slate-100' : 'bg-sky-50')
        )}
      >
        <FolderGlyph className={cn(icon, folderTone)} strokeWidth={1.5} />
        {showSector && <SectorFolderBadge sectorKey={sectorKey!} />}
        {privateItem && <PrivateBadge />}
      </span>,
      privateItem || showSector
    );
  }

  if (type === 'Link') {
    return withBadgeRoom(
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
      </span>,
      privateItem
    );
  }

  // Arquivo binário / imagem: ícone por extensão (PDF vermelho, DOC azul, …)
  if (type === 'File' || type === 'Image') {
    const kind =
      type === 'Image'
        ? 'img'
        : getFileKind(filename, name, item.id, item['@id']);
    return withBadgeRoom(
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
      </span>,
      privateItem
    );
  }

  // Página Plone / notícia → documento azul (estilo Google Docs)
  if (type === 'Document' || type === 'NewsItem' || type === 'News Item') {
    return withBadgeRoom(
      <span className={cn(box, !compact && 'bg-transparent')}>
        <FileTypeIcon
          kind="doc"
          size={compact ? 20 : 22}
          withBackground={!compact}
          className={compact ? undefined : 'rounded-lg'}
        />
        {privateItem && <PrivateBadge />}
      </span>,
      privateItem
    );
  }

  // Fallback: tenta extensão no nome; senão arquivo genérico
  const kind = getFileKind(filename, name, item.id, item['@id']);
  return withBadgeRoom(
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
    </span>,
    privateItem
  );
};

export default AdminDriveIcon;
