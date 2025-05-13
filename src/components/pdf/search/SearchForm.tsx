
import SearchLoader from '@/components/SearchLoader';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import React from 'react';

/**
 * Interface para as propriedades do componente SearchForm
 * @interface SearchFormProps
 * @property {string} searchText - Texto de busca atual
 * @property {function} setSearchText - Função para atualizar o texto de busca
 * @property {function} handleSearch - Manipulador para o evento de busca
 * @property {boolean} isSearching - Indica se uma busca está em andamento
 * @property {function} clearSearch - Função para limpar a busca
 */
interface SearchFormProps {
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  clearSearch: () => void;
}

/**
 * Componente de formulário de busca para PDFs
 * @param {SearchFormProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 */
const SearchForm: React.FC<SearchFormProps> = ({
  searchText,
  setSearchText,
  handleSearch,
  isSearching,
  clearSearch
}) => {
  return (
    <form onSubmit={handleSearch} className="flex items-center space-x-2">
      <div className="relative w-64">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar no documento..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-8 rounded-md h-9 bg-ufac-lightBlue"
        />
        {searchText && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
             {isSearching ? (
          <SearchLoader className="mx-auto" />
        ) : (
          <X className="h-4 w-4 text-gray-500" />
        )}  
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchForm;
