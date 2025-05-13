
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarClock,
  CalendarDays
} from 'lucide-react';
import React from 'react';

/**
 * Tipo para as opções de ordenação
 * @typedef {string} SortOption
 */
export type SortOption = 'title-asc' | 'title-desc' | 'date-newest' | 'date-oldest';

/**
 * Interface para as propriedades do componente FilterToolbar
 * @interface FilterToolbarProps
 * @property {function} [onFilterChange] - Callback quando o filtro de texto muda
 * @property {function} onSortChange - Callback quando a opção de ordenação muda
 * @property {function} [onCategorySelect] - Callback quando uma categoria é selecionada
 * @property {string[]} [categories] - Lista de categorias disponíveis
 * @property {string} [filterText] - Texto de filtro atual
 * @property {SortOption} sortOption - Opção de ordenação atual
 * @property {string} [selectedCategory] - Categoria selecionada
 * @property {boolean} [showCategoryFilter] - Se deve mostrar o filtro de categoria
 * @property {string} [className] - Classes CSS adicionais
 */
interface FilterToolbarProps {
  onFilterChange?: (filterText: string) => void;
  onSortChange: (sortOption: SortOption) => void;
  onCategorySelect?: (category: string) => void;
  categories?: string[];
  filterText?: string;
  sortOption: SortOption;
  selectedCategory?: string;
  showCategoryFilter?: boolean;
  className?: string;
}

/**
 * Componente de barra de ferramentas para filtros e ordenação
 * @param {FilterToolbarProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 */
const FilterToolbar: React.FC<FilterToolbarProps> = ({
  onSortChange,
  onCategorySelect,
  categories = [],
  sortOption,
  selectedCategory,
  showCategoryFilter = false,
  className
}) => {
  return (
    <div className={`flex flex-row justify-end pa gap-3 mb-4 ${className}`}>
      <div className="flex gap-2">
        {showCategoryFilter && categories.length > 0 && (
          <Select
            value={selectedCategory}
            onValueChange={onCategorySelect}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-[24px] text-ufac-blue">
              {sortOption === 'title-asc' && <ArrowUpAZ className=" stroke-ufac-blue h-4 w-4 mr-2" />}
              {sortOption === 'title-desc' && <ArrowDownAZ className=" stroke-ufac-blue h-4 w-4 mr-2" />}
              {sortOption === 'date-newest' && <CalendarClock className=" stroke-ufac-blue h-4 w-4 mr-2" />}
              {sortOption === 'date-oldest' && <CalendarDays className=" stroke-ufac-blue h-4 w-4 mr-2" />}
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="gap-2 p-3 rounded-[24px]">
            <DropdownMenuItem onClick={() => onSortChange('title-asc')} className="gap-2 py-3 rounded-2xl py-3 px-5">
              <ArrowUpAZ className="stroke-ufac-blue h-4 w-4 mr-2" /> A-Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('title-desc')} className="gap-2 py-3 rounded-2xl py-3 px-5">
              <ArrowDownAZ className="stroke-ufac-blue h-4 w-4 mr-2" /> Z-A
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('date-newest')} className="gap-2 py-3 rounded-2xl py-3 px-5">
              <CalendarClock className="stroke-ufac-blue h-4 w-4 mr-2" /> Mais recentes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('date-oldest')} className="gap-2 py-3 rounded-2xl py-3 px-5">
              <CalendarDays className="stroke-ufac-blue h-4 w-4 mr-2" /> Mais antigos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FilterToolbar;
