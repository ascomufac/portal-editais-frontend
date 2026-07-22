import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  ArrowUpDown,
  ClipboardPaste,
  Copy,
  EyeOff,
  Globe,
  MoreHorizontal,
  Pencil,
  Scissors,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import React from 'react';

export type SortKey = 'name' | 'modified' | 'type' | 'owner';

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
  onRename: () => void;
  onShare: () => void;
  onEdit: () => void;
  onSort: (key: SortKey) => void;
  singleSelected: boolean;
};

/**
 * Barra contextual que aparece ao selecionar itens (padrão Google Drive).
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
  onRename,
  onShare,
  onEdit,
  onSort,
  singleSelected,
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={iconBtn}
            onClick={onRename}
            title="Renomear"
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={iconBtn}
            onClick={onEdit}
            title="Editar"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </>
      )}

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
