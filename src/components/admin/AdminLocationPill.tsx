import AdminItemHoverCard from '@/components/admin/AdminItemHoverCard';
import { cn } from '@/lib/utils';
import {
  adminContentHref,
  getImmediateParentLocation,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { Folder } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  item: PloneContentItem;
  className?: string;
  /** Compacto para grade / espaços apertados. */
  compact?: boolean;
};

/**
 * Atalho estilo Drive: pill com pasta pai + hover card; clique abre a pasta.
 */
const AdminLocationPill: React.FC<Props> = ({ item, className, compact = false }) => {
  const navigate = useNavigate();
  const location = getImmediateParentLocation(item);

  const folderItem = useMemo((): PloneContentItem => {
    const path = location.path;
    const base = item['@id'].replace(/\/?$/, '');
    // @id do pai: remove o último segmento do item
    const parentAtId = path
      ? base.replace(/\/[^/]+\/?$/, '') || base
      : base.replace(/\/[^/]+\/?$/, '') || item['@id'];
    return {
      '@id': parentAtId,
      '@type': 'Folder',
      title: location.label,
      type_title: 'Pasta',
      is_folderish: true,
    };
  }, [item, location.label, location.path]);

  const goToFolder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(adminContentHref(location.path));
  };

  return (
    <AdminItemHoverCard
      item={folderItem}
      locationLabel={location.fullPath || 'Editais'}
      side="top"
      align="end"
      openDelay={220}
    >
      <button
        type="button"
        onClick={goToFolder}
        className={cn(
          'inline-flex max-w-[9rem] shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-ufac-blue sm:max-w-[12rem]',
          compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
          className
        )}
      >
        <Folder
          className={cn(
            'shrink-0 fill-sky-400/90 text-sky-500',
            compact ? 'h-3 w-3' : 'h-3.5 w-3.5'
          )}
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="truncate font-medium">{location.label}</span>
      </button>
    </AdminItemHoverCard>
  );
};

export default AdminLocationPill;
