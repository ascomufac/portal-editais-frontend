
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Folder, Settings2 } from 'lucide-react';
import React, { useState } from 'react';
import {
  AssuntosEstudantisIcon,
  CentroIdiomasIcon,
  ColegioAplicacaoIcon,
  ExtensaoIcon,
  GestaoPessoasIcon,
  GraduacaoIcon,
  PesquisaIcon
} from './sidebar/SidebarIcons';

/**
 * Tipo para as seções de busca disponíveis
 * @typedef {string} SearchSection
 */
export type SearchSection =
  | 'all'
  | 'graduacao'
  | 'pos-graduacao'
  | 'extensao'
  | 'estudantis'
  | 'pessoas'
  | 'idiomas'
  | 'colegio'
  | 'reitoria'
  | 'centros'
  | 'cooperacao-interinstitucional'
  | 'dce'
  | 'niead'
  | 'nups'
  | 'outros';

/**
 * Interface para as propriedades do componente SearchFilter
 * @interface SearchFilterProps
 * @property {SearchSection} selectedSection - Seção selecionada
 * @property {function} onSectionChange - Callback quando a seção é alterada
 */
interface SearchFilterProps {
  selectedSection: SearchSection;
  onSectionChange: (section: SearchSection) => void;
  compact?: boolean;
}

/**
 * Interface para uma opção de seção
 * @interface SectionOption
 * @property {SearchSection} value - Valor da seção
 * @property {string} label - Rótulo da seção
 * @property {React.ReactNode} icon - Ícone da seção
 */
interface SectionOption {
  value: SearchSection;
  label: string;
  icon: React.ReactNode;
}

/**
 * Lista de seções disponíveis para filtro
 * @type {SectionOption[]}
 */
const sections: SectionOption[] = [
  { value: 'all', label: 'Todos', icon: <Settings2 /> },
  { value: 'graduacao', label: 'Graduação', icon: <GraduacaoIcon /> },
  { value: 'pos-graduacao', label: 'Pesquisa e Pós-graduação', icon: <PesquisaIcon /> },
  { value: 'extensao', label: 'Extensão e Cultura', icon: <ExtensaoIcon /> },
  { value: 'estudantis', label: 'Assuntos Estudantis', icon: <AssuntosEstudantisIcon /> },
  { value: 'pessoas', label: 'Gestão de Pessoas', icon: <GestaoPessoasIcon /> },
  { value: 'idiomas', label: 'Centro de Idiomas', icon: <CentroIdiomasIcon /> },
  { value: 'colegio', label: 'Colégio de Aplicação', icon: <ColegioAplicacaoIcon /> },
  { value: 'reitoria', label: 'Conselho Universitário', icon: <Folder className="text-ufac-blue" /> },
  { value: 'centros', label: 'Centros de Ensino', icon: <Folder className="text-ufac-blue" /> },
  { value: 'cooperacao-interinstitucional', label: 'Cooperação Interinstitucional', icon: <Folder className="text-ufac-blue" /> },
  { value: 'dce', label: 'DCE', icon: <Folder className="text-ufac-blue" /> },
  { value: 'niead', label: 'Niead', icon: <Folder className="text-ufac-blue" /> },
  { value: 'nups', label: 'Núcleo de Processo Seletivo – NUPS', icon: <Folder className="text-ufac-blue" /> },
  { value: 'outros', label: 'Outros', icon: <Folder className="text-ufac-blue" /> },
];

/**
 * Componente de filtro para busca por seção
 * @param {SearchFilterProps} props - Propriedades do componente
 * @returns {React.JSX.Element} Componente React renderizado
 */
const SearchFilter: React.FC<SearchFilterProps> = ({
  selectedSection,
  onSectionChange,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const selectedOption = sections.find((section) => section.value === selectedSection);

  const handleChange = (section: SearchSection) => {
    onSectionChange(section);
    setOpen(false); // Fecha o popover
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-0.5 text-xs font-medium text-gray-600 hover:text-ufac-blue hover:bg-transparent focus:ring-0',
            compact ? 'h-8 px-1' : 'h-8 gap-1'
          )}
          aria-label="Filtrar seção da busca"
        >
          {selectedOption?.icon ? (
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-ufac-lightBlue [&_svg]:h-full [&_svg]:w-full [&_svg]:shrink-0',
                compact ? 'h-7 w-7 p-1.5' : 'h-9 w-9 p-2'
              )}
            >
              {selectedOption.icon}
            </div>
          ) : (
            selectedOption?.label || 'Todos'
          )}
          <ChevronDown className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={compact ? 'bottom' : 'top'}
        align="end"
        collisionPadding={12}
        className="p-2 rounded-3xl shadow-lg max-h-[60vh] overflow-y-auto w-[min(100vw-1.5rem,20rem)]"
      >
        <div className="space-y-1">
          {sections.map((section) => (
            <Button
              key={section.value}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start gap-2.5 rounded-2xl py-2.5 text-left font-normal',
                selectedSection === section.value
                  ? 'bg-ufac-lightBlue text-ufac-blue'
                  : 'text-gray-700'
              )}
              onClick={() => handleChange(section.value)}
            >
              {section.icon && (
                <span className="flex h-8 w-8 min-h-8 min-w-8 max-h-8 max-w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ufac-lightBlue p-1.5 [&>svg]:h-full [&>svg]:w-full [&>svg]:shrink-0">
                  {section.icon}
                </span>
              )}
              <span className="truncate">{section.label}</span>
              {selectedSection === section.value && (
                <Check className="ml-auto h-4 w-4 text-ufac-blue" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchFilter;
