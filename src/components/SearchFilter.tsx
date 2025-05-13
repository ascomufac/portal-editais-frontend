
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
 * @returns {JSX.Element} Componente React renderizado
 */
const SearchFilter: React.FC<SearchFilterProps> = ({ selectedSection, onSectionChange }) => {
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
          className="h-8 gap-1 text-xs font-medium text-gray-600 hover:text-ufac-blue hover:bg-transparent focus:ring-0"
        >
          {selectedOption?.icon ? (
            <div className="w-9 h-9 p-2 flex items-center justify-center bg-ufac-lightBlue rounded-full [&_svg]:w-full [&_svg]:h-full [&_svg]:shrink-0">
              {selectedOption.icon}
            </div>
          ) : (
            selectedOption?.label || 'Todos'
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="p-2 rounded-3xl shadow-lg max-h-[60vh] overflow-y-auto">
        <div className="space-y-1">
          {sections.map((section) => (
            <Button
              key={section.value}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start text-left font-normal rounded-2xl py-6",
                selectedSection === section.value
                  ? "bg-ufac-lightBlue text-ufac-blue"
                  : "text-gray-700"
              )}
              onClick={() => handleChange(section.value)}
            >
              {section.icon && (
                <span className="!w-8 !h-8 min-w-8 max-w-8 p-2 flex items-center justify-center bg-ufac-lightBlue rounded-full [&_svg]:w-full [&_svg]:h-full [&_svg]:shrink-0">
                  {section.icon}
                </span>
              )}
              {section.label}
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
