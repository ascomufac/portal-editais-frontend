import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  adminDriveMenuContentClass,
  adminDriveMenuIconClass,
  adminDriveMenuItemClass,
  adminDriveMenuSeparatorClass,
} from '@/components/admin/adminDriveMenuStyles';
import { cn } from '@/lib/utils';
import {
  ArrowDownToLine,
  ArrowUpDown,
  ArrowUpToLine,
  CheckCheck,
  ClipboardPaste,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Scissors,
  Settings2,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import React from 'react';

export type SortKey = 'position' | 'name' | 'modified' | 'type' | 'owner';

type SelectionToolbarProps = {
  count: number;
  canPaste: boolean;
  canPublish: boolean;
  canRetract: boolean;
  clipboardMode?: 'cut' | 'copy' | null;
  sortKey: SortKey;
  onClear: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onRetract: () => void;
  onShare: () => void;
  onView?: () => void;
  onEdit: () => void;
  onSort: (key: SortKey) => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
  onSelectAllContained?: () => void;
  singleSelected: boolean;
  canView?: boolean;
};

/**
 * Barra contextual que aparece ao selecionar itens (padrão Google Drive / Plone).
 */
const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  count,
  canPaste,
  canPublish,
  canRetract,
  clipboardMode,
  sortKey,
  onClear,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onPublish,
  onRetract,
  onShare,
  onView,
  onEdit,
  onSort,
  onMoveToTop,
  onMoveToBottom,
  onSelectAllContained,
  singleSelected,
  canView = false,
}) => {
  const iconBtn =
    'h-9 w-9 rounded-full text-slate-700 hover:bg-slate-100 disabled:opacity-40';

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-[#e9eef6] px-2 py-1.5 sm:gap-2 sm:px-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={iconBtn}
        onClick={onClear}
        title="Limpar seleção"
      >
        <X className="h-4 w-4" />
      </Button>

      <span className="mr-1 text-sm font-medium text-slate-800">
        {count} selecionado{count === 1 ? '' : 's'}
      </span>

      <div className="mx-1 hidden h-5 w-px bg-slate-300 sm:block" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={iconBtn}
        onClick={onCut}
        title="Recortar"
      >
        <Scissors className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={iconBtn}
        onClick={onCopy}
        title="Copiar"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(iconBtn, canPaste && 'text-ufac-blue')}
        onClick={onPaste}
        disabled={!canPaste}
        title={
          canPaste
            ? clipboardMode === 'cut'
              ? 'Colar (mover)'
              : 'Colar (copiar)'
            : 'Nada na área de transferência'
        }
      >
        <ClipboardPaste className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(iconBtn, 'hover:bg-red-50 hover:text-red-600')}
        onClick={onDelete}
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {canPublish && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            iconBtn,
            'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
          )}
          onClick={onPublish}
          title="Publicar"
        >
          <Globe className="h-4 w-4" />
        </Button>
      )}

      {canRetract && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            iconBtn,
            'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
          )}
          onClick={onRetract}
          title="Tornar privado"
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      )}

      {singleSelected && (
        <>
          <div className="mx-1 hidden h-5 w-px bg-slate-300 sm:block" />
          {canView && onView && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(iconBtn, 'text-ufac-blue hover:bg-ufac-lightBlue/60')}
              onClick={onView}
              title="Visualizar"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={iconBtn}
            onClick={onEdit}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={iconBtn}
            onClick={onShare}
            title="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </>
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(iconBtn, 'data-[state=open]:bg-white data-[state=open]:text-ufac-blue')}
            title="Mais ações"
            aria-label="Mais ações"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={adminDriveMenuContentClass}>
          <DropdownMenuItem className={adminDriveMenuItemClass} onClick={onCut}>
            <Scissors className={adminDriveMenuIconClass} />
            Recortar
          </DropdownMenuItem>
          <DropdownMenuItem className={adminDriveMenuItemClass} onClick={onCopy}>
            <Copy className={adminDriveMenuIconClass} />
            Copiar
          </DropdownMenuItem>
          {onMoveToTop && (
            <DropdownMenuItem className={adminDriveMenuItemClass} onClick={onMoveToTop}>
              <ArrowUpToLine className={adminDriveMenuIconClass} />
              Mover para o topo da pasta
            </DropdownMenuItem>
          )}
          {onMoveToBottom && (
            <DropdownMenuItem className={adminDriveMenuItemClass} onClick={onMoveToBottom}>
              <ArrowDownToLine className={adminDriveMenuIconClass} />
              Mover para o final da pasta
            </DropdownMenuItem>
          )}
          {onSelectAllContained && (
            <>
              <DropdownMenuSeparator className={adminDriveMenuSeparatorClass} />
              <DropdownMenuItem
                className={adminDriveMenuItemClass}
                onClick={onSelectAllContained}
              >
                <CheckCheck className={adminDriveMenuIconClass} />
                Selecionar todos os itens
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-full px-3 text-slate-700"
            >
              <ArrowUpDown className="mr-1.5 h-4 w-4" />
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            {(
              [
                ['position', 'Posição na pasta'],
                ['name', 'Nome'],
                ['modified', 'Modificação'],
                ['type', 'Tipo'],
                ['owner', 'Proprietário'],
              ] as const
            ).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => onSort(key)}
                className={sortKey === key ? 'bg-ufac-lightBlue text-ufac-blue' : ''}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SelectionToolbar;
