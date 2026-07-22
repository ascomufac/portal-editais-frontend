import { cn } from '@/lib/utils';
import {
  getContentDisplayName,
  getContentTypeLabel,
  getImmediateParentLocation,
  isFolderishContent,
  resolveContentType,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { FileText, Folder, HardDrive, History, Link2, User } from 'lucide-react';
import React from 'react';

const formatEditedAt = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const date = d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Editado em ${date}`;
};

const HoverIcon: React.FC<{ item: Pick<PloneContentItem, '@type' | 'portal_type' | 'is_folderish'> }> = ({
  item,
}) => {
  const type = resolveContentType(item);
  const folderish = isFolderishContent(item);
  if (folderish || type === 'Folder' || type === 'Collection' || type === 'Plone Site') {
    return <Folder className="h-5 w-5 shrink-0 fill-sky-400/90 text-sky-400" strokeWidth={1.5} />;
  }
  if (type === 'Link') {
    return <Link2 className="h-5 w-5 shrink-0 text-sky-300" />;
  }
  if (type === 'File' || type === 'Image') {
    return <FileText className="h-5 w-5 shrink-0 text-red-400" />;
  }
  return <FileText className="h-5 w-5 shrink-0 text-sky-300" />;
};

type Props = {
  item: PloneContentItem;
  children: React.ReactNode;
  /** Texto de localização (padrão: pasta pai do item). */
  locationLabel?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  /** Atraso antes de abrir (ms). */
  openDelay?: number;
};

/**
 * Cartão de preview ao hover (estilo Google Drive).
 */
const AdminItemHoverCard: React.FC<Props> = ({
  item,
  children,
  locationLabel,
  side = 'top',
  align = 'center',
  className,
  openDelay = 280,
}) => {
  const name = getContentDisplayName(item);
  const edited = formatEditedAt(item.modified);
  const location =
    locationLabel ??
    (() => {
      const loc = getImmediateParentLocation(item);
      return loc.fullPath || loc.label;
    })();
  const typeLabel = getContentTypeLabel(item);

  return (
    <HoverCard openDelay={openDelay} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        sideOffset={8}
        className={cn(
          'w-72 border-0 bg-slate-800 p-3.5 text-white shadow-2xl shadow-black/40 rounded-2xl',
          className
        )}
      >
        <div className="flex items-start gap-2.5">
          <HoverIcon item={item} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-snug text-white">{name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-400">{typeLabel}</p>
          </div>
        </div>

        <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300">
          {edited && (
            <p className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{edited}</span>
            </p>
          )}
          {location && (
            <p className="flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate" title={location}>
                {location}
              </span>
            </p>
          )}
          {item.Creator && (
            <p className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate">{item.Creator}</span>
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default AdminItemHoverCard;
