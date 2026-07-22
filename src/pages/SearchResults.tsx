import EditalCard from '@/components/EditalCard';
import FileTypeIcon, {
  FILE_KIND_STYLES,
  getFileKind,
} from '@/components/icons/FileTypeIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import { SearchSection } from '@/components/SearchFilter';
import SearchLoader from '@/components/SearchLoader';
import {
  AssuntosEstudantisIcon,
  CentroIdiomasIcon,
  ColegioAplicacaoIcon,
  ExtensaoIcon,
  GestaoPessoasIcon,
  GraduacaoIcon,
  PesquisaIcon,
  ProReitoriasIcon,
} from '@/components/sidebar/SidebarIcons';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { cn } from '@/lib/utils';
import { toEditalHref } from '@/services/editalService';
import {
  SearchResult,
  extractFileNameFromUrl,
  isPdf,
  searchDocuments,
} from '@/services/searchService';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Folder,
  Settings2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RESULTS_PER_PAGE = 12;

const SECTION_OPTIONS: Array<{
  value: SearchSection;
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'graduacao', label: 'Graduação' },
  { value: 'pos-graduacao', label: 'Pesquisa e Pós-graduação' },
  { value: 'extensao', label: 'Extensão e Cultura' },
  { value: 'estudantis', label: 'Assuntos Estudantis' },
  { value: 'pessoas', label: 'Gestão de Pessoas' },
  { value: 'idiomas', label: 'Centro de Idiomas' },
  { value: 'colegio', label: 'Colégio de Aplicação' },
  { value: 'reitoria', label: 'Conselho Universitário' },
  { value: 'centros', label: 'Centros de Ensino' },
  { value: 'cooperacao-interinstitucional', label: 'Cooperação Interinstitucional' },
  { value: 'dce', label: 'DCE' },
  { value: 'niead', label: 'Niead' },
  { value: 'nups', label: 'Núcleo de Processo Seletivo – NUPS' },
  { value: 'outros', label: 'Outros' },
];

const formatCardDate = (dateString?: string): { date: string; hour: string } => {
  if (!dateString) return { date: '', hour: '' };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { date: '', hour: '' };

  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');

  return {
    date: `${dia}/${mes}/${ano}`,
    hour: `${horas}:${minutos}`,
  };
};

const SectionIcon: React.FC<{ section: string; className?: string }> = ({
  section,
  className,
}) => {
  const icon = (() => {
    switch (section) {
      case 'graduacao':
        return <GraduacaoIcon />;
      case 'pos-graduacao':
        return <PesquisaIcon />;
      case 'extensao':
        return <ExtensaoIcon />;
      case 'estudantis':
        return <AssuntosEstudantisIcon />;
      case 'pessoas':
        return <GestaoPessoasIcon />;
      case 'idiomas':
        return <CentroIdiomasIcon />;
      case 'colegio':
        return <ColegioAplicacaoIcon />;
      case 'reitoria':
        return <ProReitoriasIcon />;
      case 'all':
        return <Settings2 className="h-full w-full text-ufac-blue" />;
      default:
        return <Folder className="h-full w-full text-ufac-blue" strokeWidth={2} />;
    }
  })();

  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden [&>svg]:h-full [&>svg]:w-full',
        className
      )}
    >
      {icon}
    </span>
  );
};

const getResultHref = (result: SearchResult): string => {
  if (isPdf(result.url)) {
    return `/visualizar-pdf/${encodeURIComponent(result.url)}`;
  }
  try {
    return toEditalHref(result.url);
  } catch {
    return result.url;
  }
};

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const query = searchParams.get('q') || '';
  const sectionParam = searchParams.get('section') || 'all';
  const [section, setSection] = useState<SearchSection>(sectionParam as SearchSection);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        setLoading(true);
        try {
          const response = await searchDocuments(query, section);
          setResults(response.items);
          setTotalResults(response.total);
        } catch (error) {
          console.error('Error fetching search results:', error);
          toast({
            title: 'Erro na busca',
            description: 'Ocorreu um erro ao buscar. Tente novamente mais tarde.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setTotalResults(0);
      }
    };

    fetchResults();
    setCurrentPage(1);
  }, [query, section]);

  const getTitle = (result: SearchResult) =>
    result.title || extractFileNameFromUrl(result.url);

  const getDescription = (result: SearchResult) => {
    if (result.description) return result.description;

    const urlParts = result.url.split('/');
    const possibleYears = urlParts.filter((part) => /^\d{4}$/.test(part));
    if (possibleYears.length > 0) {
      return `Documento do ano ${possibleYears[0]}`;
    }

    return '';
  };

  const getSectionLabel = (sectionValue: string): string =>
    SECTION_OPTIONS.find((opt) => opt.value === sectionValue)?.label || 'Todos';

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = results.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSectionChange = (newSection: string) => {
    setSection(newSection as SearchSection);
    navigate(
      `/resultados-busca?q=${encodeURIComponent(query)}&section=${newSection}`,
      { replace: true }
    );
  };

  const getPageNumbers = () => {
    const pageNumbers: Array<number | 'ellipsis'> = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) endPage = 4;
      else if (currentPage >= totalPages - 1) startPage = totalPages - 3;

      if (startPage > 2) pageNumbers.push('ellipsis');
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <MainLayout pageTitle="Resultados da Busca">
      <div className="max-w-6xl mx-auto">
        <header className="mb-4 md:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 h-9 shrink-0 gap-1.5 px-2 text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} className="shrink-0" />
                Voltar
              </Button>
              <span className="hidden h-5 w-px shrink-0 bg-gray-200 sm:block" aria-hidden />
              <p className="min-w-0 text-sm text-gray-600 sm:truncate">
                {loading
                  ? 'Carregando resultados...'
                  : `${totalResults} resultados encontrados para "${query}"`}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:shrink-0">
              <Filter size={16} className="shrink-0 text-gray-500" aria-hidden />
              <Select value={section} onValueChange={handleSectionChange}>
                <SelectTrigger className="h-10 w-full min-w-[200px] bg-white text-sm sm:w-[240px]">
                  <SelectValue placeholder="Filtrar por seção">
                    <span className="flex items-center gap-2">
                      <SectionIcon section={section} />
                      <span className="truncate">{getSectionLabel(section)}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[60vh] overflow-y-auto rounded-xl">
                  {SECTION_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="rounded-lg py-2.5"
                    >
                      <span className="flex items-center gap-2.5">
                        <SectionIcon section={opt.value} />
                        <span className="truncate">{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {section !== 'all' && (
            <div className="mt-4 rounded-xl bg-ufac-lightBlue px-4 py-2.5">
              <p className="flex items-center gap-2 text-sm text-ufac-blue">
                <span>Filtrando por:</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <SectionIcon section={section} />
                  {getSectionLabel(section)}
                </span>
              </p>
            </div>
          )}
        </header>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex items-center justify-center gap-3">
              <SearchIcon />
              <SearchLoader size={40} />
            </div>
            <p className="text-gray-600">Carregando resultados...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {paginatedResults.map((result) => {
                const { date, hour } = formatCardDate(result.date);
                const fileKind = getFileKind(result.url, result.title);
                const showAsFolder =
                  result.type === 'Folder' || result.type === 'Collection';

                return (
                  <EditalCard
                    key={result.id}
                    title={getTitle(result)}
                    description={getDescription(result)}
                    href={getResultHref(result)}
                    date={date}
                    hour={hour}
                    icon={
                      showAsFolder ? (
                        <Folder strokeWidth={1} className="h-8 w-8 text-ufac-blue" />
                      ) : (
                        <FileTypeIcon
                          kind={fileKind}
                          withBackground={false}
                          size={28}
                          className="h-8 w-8"
                        />
                      )
                    }
                    color={
                      showAsFolder
                        ? 'bg-blue-50'
                        : FILE_KIND_STYLES[fileKind].bgSoft
                    }
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination className="my-6">
                <PaginationContent className="flex-wrap justify-center">
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  <PaginationItem className="sm:hidden">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>

                  <div className="mx-2 flex items-center text-sm sm:hidden">
                    Página {currentPage} de {totalPages}
                  </div>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={`page-${index}`} className="hidden sm:inline-block">
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages && handlePageChange(currentPage + 1)
                      }
                      className={
                        currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>

                  <PaginationItem className="sm:hidden">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        currentPage < totalPages && handlePageChange(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-6">
              <SearchLoader size={80} noResults className="mx-auto" />
            </div>
            <h2 className="mb-2 text-lg font-medium text-gray-800 md:text-xl">
              Nenhum resultado encontrado
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              {section !== 'all'
                ? `Não foram encontrados editais para "${query}" na seção ${getSectionLabel(section)}. Tente buscar em todas as seções.`
                : `Não foram encontrados editais para "${query}". Tente novamente com termos diferentes.`}
            </p>
            {section !== 'all' && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleSectionChange('all')}
              >
                Buscar em todas as seções
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchResults;
