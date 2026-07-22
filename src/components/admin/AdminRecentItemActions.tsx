import { Button } from '@/components/ui/button';
import {
  adminDriveMenuContentClass,
  adminDriveMenuIconClass,
  adminDriveMenuItemClass,
  adminDriveMenuSeparatorClass,
} from '@/components/admin/adminDriveMenuStyles';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  adminContentHref,
  ApiError,
  downloadPloneFile,
  isFolderishContent,
  parentPlonePath,
  resolveContentType,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import {
  Download,
  Eye,
  FolderOpen,
  History,
  Link2,
  MoreVertical,
  Pencil,
  Share2,
} from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type AdminContentOpenAction = 'preview' | 'edit' | 'share' | 'history';

const canViewContent = (item: PloneContentItem) => {
  const type = resolveContentType(item);
  return type === 'File' || type === 'Image' || type === 'Link' || type === 'Document';
};

const canDownloadContent = (item: PloneContentItem) => {
  const type = resolveContentType(item);
  return type === 'File' || type === 'Image';
};

type ActionHandlers = {
  onOpen: () => void;
  onOpenFolder: () => void;
  onAction: (action: AdminContentOpenAction) => void;
  onCopyLink: () => void;
  onDownload: () => void;
};

const useActionHandlers = (item: PloneContentItem): ActionHandlers => {
  const navigate = useNavigate();

  const onOpen = useCallback(() => {
    const path = toPlonePath(item['@id']);
    if (isFolderishContent(item)) {
      navigate(adminContentHref(path));
      return;
    }
    navigate(adminContentHref(parentPlonePath(path)), {
      state: { focusPath: path },
    });
  }, [item, navigate]);

  const onOpenFolder = useCallback(() => {
    const path = toPlonePath(item['@id']);
    const folderPath = isFolderishContent(item) ? path : parentPlonePath(path);
    navigate(adminContentHref(folderPath));
  }, [item, navigate]);

  const onAction = useCallback(
    (action: AdminContentOpenAction) => {
      const type = resolveContentType(item);
      if (action === 'preview') {
        if (type === 'Link') {
          const url =
            (typeof item.remoteUrl === 'string' && item.remoteUrl) || item['@id'];
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
          return;
        }
        if (type === 'Document') {
          window.open(item['@id'], '_blank', 'noopener,noreferrer');
          return;
        }
      }

      const path = toPlonePath(item['@id']);
      if (isFolderishContent(item)) {
        const parent = parentPlonePath(path);
        navigate(adminContentHref(parent), {
          state: { focusPath: path, openAction: action },
        });
        return;
      }
      navigate(adminContentHref(parentPlonePath(path)), {
        state: { focusPath: path, openAction: action },
      });
    },
    [item, navigate]
  );

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(item['@id']);
      toast.success('Link copiado.');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  }, [item]);

  const onDownload = useCallback(async () => {
    try {
      await downloadPloneFile(item);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Falha ao baixar o arquivo.'
      );
    }
  }, [item]);

  return useMemo(
    () => ({ onOpen, onOpenFolder, onAction, onCopyLink, onDownload }),
    [onOpen, onOpenFolder, onAction, onCopyLink, onDownload]
  );
};

const ActionItems: React.FC<
  ActionHandlers & {
    item: PloneContentItem;
    Item: typeof DropdownMenuItem | typeof ContextMenuItem;
    Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator;
  }
> = ({
  item,
  onOpen,
  onOpenFolder,
  onAction,
  onCopyLink,
  onDownload,
  Item,
  Separator,
}) => {
  const folderish = isFolderishContent(item);
  const viewable = canViewContent(item);
  const downloadable = canDownloadContent(item);

  return (
    <>
      <Item className={adminDriveMenuItemClass} onClick={onOpen}>
        <FolderOpen className={adminDriveMenuIconClass} />
        {folderish ? 'Abrir' : 'Mostrar na pasta'}
      </Item>
      {!folderish && (
        <Item className={adminDriveMenuItemClass} onClick={onOpenFolder}>
          <FolderOpen className={adminDriveMenuIconClass} />
          Abrir pasta
        </Item>
      )}
      {viewable && (
        <Item className={adminDriveMenuItemClass} onClick={() => onAction('preview')}>
          <Eye className={adminDriveMenuIconClass} />
          Visualizar
        </Item>
      )}
      <Item className={adminDriveMenuItemClass} onClick={() => onAction('edit')}>
        <Pencil className={adminDriveMenuIconClass} />
        Editar
      </Item>
      <Item className={adminDriveMenuItemClass} onClick={() => onAction('share')}>
        <Share2 className={adminDriveMenuIconClass} />
        Compartilhar
      </Item>
      <Item className={adminDriveMenuItemClass} onClick={() => onAction('history')}>
        <History className={adminDriveMenuIconClass} />
        Histórico
      </Item>
      <Separator className={adminDriveMenuSeparatorClass} />
      <Item className={adminDriveMenuItemClass} onClick={onCopyLink}>
        <Link2 className={adminDriveMenuIconClass} />
        Copiar link
      </Item>
      {downloadable && (
        <Item className={adminDriveMenuItemClass} onClick={() => void onDownload()}>
          <Download className={adminDriveMenuIconClass} />
          Fazer download
        </Item>
      )}
    </>
  );
};

type Props = {
  item: PloneContentItem;
  children: React.ReactNode;
  /** Conteúdo após o botão ⋮ (ex.: horário). */
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * Linha com clique direito + botão ⋮ (ações estilo Drive / hover card escuro).
 * Ordem: children → ⋮ → trailing.
 * O ⋮ fica fora do ContextMenuTrigger para o dropdown abrir corretamente.
 */
const AdminRecentItemActions: React.FC<Props> = ({
  item,
  children,
  trailing,
  className,
}) => {
  const handlers = useActionHandlers(item);

  return (
    <div className={className}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex min-w-0 flex-1 items-center overflow-visible">
            {children}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className={adminDriveMenuContentClass}>
          <ActionItems
            item={item}
            Item={ContextMenuItem}
            Separator={ContextMenuSeparator}
            {...handlers}
          />
        </ContextMenuContent>
      </ContextMenu>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full text-slate-500 opacity-70 transition-opacity hover:bg-slate-200/80 hover:opacity-100 focus-visible:opacity-100 data-[state=open]:bg-slate-200/80 data-[state=open]:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            title="Ações"
            aria-label="Ações"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className={adminDriveMenuContentClass}
          onClick={(e) => e.stopPropagation()}
        >
          <ActionItems
            item={item}
            Item={DropdownMenuItem}
            Separator={DropdownMenuSeparator}
            {...handlers}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {trailing}
    </div>
  );
};

export default AdminRecentItemActions;
