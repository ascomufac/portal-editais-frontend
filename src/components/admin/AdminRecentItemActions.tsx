import { Button } from '@/components/ui/button';
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
  isFolderishContent,
  parentPlonePath,
  resolveContentType,
  toPlonePath,
  type PloneContentItem,
} from '@/services/ploneContentService';
import {
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

type ActionHandlers = {
  onOpen: () => void;
  onOpenFolder: () => void;
  onAction: (action: AdminContentOpenAction) => void;
  onCopyLink: () => void;
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

  return useMemo(
    () => ({ onOpen, onOpenFolder, onAction, onCopyLink }),
    [onOpen, onOpenFolder, onAction, onCopyLink]
  );
};

const ActionItems: React.FC<
  ActionHandlers & {
    item: PloneContentItem;
    Item: typeof DropdownMenuItem | typeof ContextMenuItem;
    Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator;
  }
> = ({ item, onOpen, onOpenFolder, onAction, onCopyLink, Item, Separator }) => {
  const folderish = isFolderishContent(item);
  const viewable = canViewContent(item);

  return (
    <>
      <Item onClick={onOpen}>
        <FolderOpen className="mr-2 h-4 w-4" />
        {folderish ? 'Abrir' : 'Mostrar na pasta'}
      </Item>
      {!folderish && (
        <Item onClick={onOpenFolder}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Abrir pasta
        </Item>
      )}
      {viewable && (
        <Item onClick={() => onAction('preview')}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </Item>
      )}
      <Item onClick={() => onAction('edit')}>
        <Pencil className="mr-2 h-4 w-4" />
        Editar
      </Item>
      <Item onClick={() => onAction('share')}>
        <Share2 className="mr-2 h-4 w-4" />
        Compartilhar
      </Item>
      <Item onClick={() => onAction('history')}>
        <History className="mr-2 h-4 w-4" />
        Histórico
      </Item>
      <Separator />
      <Item onClick={onCopyLink}>
        <Link2 className="mr-2 h-4 w-4" />
        Copiar link
      </Item>
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
 * Linha com clique direito + botão ⋮ (ações estilo Drive).
 * Ordem: children → ⋮ → trailing.
 */
const AdminRecentItemActions: React.FC<Props> = ({
  item,
  children,
  trailing,
  className,
}) => {
  const handlers = useActionHandlers(item);

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={className}>
          {children}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-slate-500 opacity-60 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                onClick={stop}
                onPointerDown={stop}
                title="Ações"
                aria-label="Ações"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl" onClick={stop}>
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
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 rounded-xl">
        <ActionItems
          item={item}
          Item={ContextMenuItem}
          Separator={ContextMenuSeparator}
          {...handlers}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default AdminRecentItemActions;
