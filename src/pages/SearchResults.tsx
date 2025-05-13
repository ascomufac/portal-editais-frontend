
import FileIcon from '@/components/icons/FileIcon';
import PdfIcon from '@/components/icons/PdfIcon';
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
  ProReitoriasIcon
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
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { cn } from '@/lib/utils';
import { SearchResult, extractFileNameFromUrl, isPdf, searchDocuments } from '@/services/searchService';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink, Filter, Folder } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RESULTS_PER_PAGE = 5;

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
            title: "Erro na busca",
            description: "Ocorreu um erro ao buscar. Tente novamente mais tarde.",
            variant: "destructive",
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
    setCurrentPage(1); // Reset page when search changes
  }, [query, section]);

  const getTitle = (result: SearchResult) => {
    return result.title || extractFileNameFromUrl(result.url);
  };

  const getDescription = (result: SearchResult) => {
    if (result.description) return result.description;
    
    const urlParts = result.url.split('/');
    const possibleYears = urlParts.filter(part => /^\d{4}$/.test(part));
    
    if (possibleYears.length > 0) {
      return `Documento do ano ${possibleYears[0]}`;
    }
    
    return 'Clique para visualizar o documento';
  };

  const getFormattedDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = results.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page in history
  };

  const handleSectionChange = (newSection: string) => {
    setSection(newSection as SearchSection);
    navigate(`/resultados-busca?q=${encodeURIComponent(query)}&section=${newSection}`, { replace: true });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      if (startPage > 2) {
        pageNumbers.push('ellipsis');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const getSectionLabel = (sectionValue: string): string => {
    switch(sectionValue) {
      case 'graduacao': return 'Graduação';
      case 'pos-graduacao': return 'Pesquisa e Pós-graduação';
      case 'extensao': return 'Extensão e Cultura';
      case 'estudantis': return 'Assuntos Estudantis';
      case 'pessoas': return 'Gestão de Pessoas';
      case 'idiomas': return 'Centro de Idiomas';
      case 'colegio': return 'Colégio de Aplicação';
      case 'reitoria': return 'Conselho Universitário';
      case 'centros': return 'Centros de Ensino';
      case 'cooperacao-interinstitucional': return 'Cooperação Interinstitucional';
      case 'dce': return 'DCE';
      case 'niead': return 'Niead';
      case 'nups': return 'Núcleo de Processo Seletivo – NUPS';
      case 'outros': return 'Outros';
      default: return 'Todos';
    }
  };

  const getSectionIcon = (sectionValue: string): React.ReactNode => {
    switch(sectionValue) {
      case 'graduacao': return <GraduacaoIcon />;
      case 'pos-graduacao': return <PesquisaIcon />;
      case 'extensao': return <ExtensaoIcon />;
      case 'estudantis': return <AssuntosEstudantisIcon />;
      case 'pessoas': return <GestaoPessoasIcon />;
      case 'idiomas': return <CentroIdiomasIcon />;
      case 'colegio': return <ColegioAplicacaoIcon />;
      case 'reitoria': return <ProReitoriasIcon />;
      default: return <Folder className="text-ufac-blue" />;
    }
  };

  return (
    <MainLayout pageTitle="Resultados da Busca">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            onClick={handleGoBack}
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Button>
        </div>
        
        <header className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
            <p className="text-sm md:text-base text-gray-600">
              {loading ? 'Carregando resultados...' : `${totalResults} resultados encontrados para "${query}"`}
            </p>
            
            <div className="flex items-center md:ml-auto">
              <Filter size={16} className="mr-2 text-gray-500" />
              <Select value={section} onValueChange={handleSectionChange}>
                <SelectTrigger className="w-[200px] h-9 text-sm bg-white">
                  <SelectValue placeholder="Filtrar por seção">
                    <div className="flex items-center gap-2">
                      {getSectionIcon(section) && (
                        <span className="h-4 w-4">{getSectionIcon(section)}</span>
                      )}
                      {getSectionLabel(section)}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[60vh] overflow-y-auto">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="graduacao" className="flex items-center gap-2">
                    <span className="mr-2"><GraduacaoIcon /></span>
                    Graduação
                  </SelectItem>
                  <SelectItem value="pos-graduacao">
                    <span className="mr-2"><PesquisaIcon /></span>
                    Pesquisa e Pós-graduação
                  </SelectItem>
                  <SelectItem value="extensao">
                    <span className="mr-2"><ExtensaoIcon /></span>
                    Extensão e Cultura
                  </SelectItem>
                  <SelectItem value="estudantis">
                    <span className="mr-2"><AssuntosEstudantisIcon /></span>
                    Assuntos Estudantis
                  </SelectItem>
                  <SelectItem value="pessoas">
                    <span className="mr-2"><GestaoPessoasIcon /></span>
                    Gestão de Pessoas
                  </SelectItem>
                  <SelectItem value="idiomas">
                    <span className="mr-2"><CentroIdiomasIcon /></span>
                    Centro de Idiomas
                  </SelectItem>
                  <SelectItem value="colegio">
                    <span className="mr-2"><ColegioAplicacaoIcon /></span>
                    Colégio de Aplicação
                  </SelectItem>
                  <SelectItem value="reitoria">
                    <span className="mr-2"><ProReitoriasIcon /></span>
                    Conselho Universitário
                  </SelectItem>
                  <SelectItem value="centros">
                    <span className="mr-2"><Folder className="text-ufac-blue" /></span>
                    Centros de Ensino
                  </SelectItem>
                  <SelectItem value="cooperacao-interinstitucional">
                    <span className="mr-2"><Folder className="text-ufac-blue" /></span>
                    Cooperação Interinstitucional
                  </SelectItem>
                  <SelectItem value="dce">
                    <span className="mr-2"><Folder className="text-ufac-blue" /></span>
                    DCE
                  </SelectItem>
                  <SelectItem value="niead">
                    <span className="mr-2"><Folder className="text-ufac-blue" /></span>
                    Niead
                  </SelectItem>
                  <SelectItem value="nups">
                    <span className="mr-2"><Folder className="text-ufac-blue" /></span>
                    Núcleo de Processo Seletivo – NUPS
                  </SelectItem>
                  <SelectItem value="outros">
                    <span className="mr-2"><Folder className="text-ufac-blue" /></span>
                    Outros
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {section !== 'all' && (
            <div className="bg-ufac-lightBlue px-4 py-2 rounded-md mb-4">
              <p className="text-sm text-ufac-blue flex items-center gap-2">
                <span>Filtrando resultados da seção:</span>
                <span className="font-medium flex items-center gap-1">
                  {getSectionIcon(section) && (
                    <span className="h-4 w-4">{getSectionIcon(section)}</span>
                  )}
                  {getSectionLabel(section)}
                </span>
              </p>
            </div>
          )}
        </header>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <SearchIcon />
              <SearchLoader size={40} />
            </div>
            <p className="text-gray-600">Carregando resultados...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
              {paginatedResults.map((result, index) => (
                <div 
                  key={result.id} 
                  className={cn(
                    "p-3 md:p-4 flex items-start gap-3 md:gap-4 hover:bg-ufac-lightBlue transition-colors duration-150",
                    index % 2 === 0 ? "bg-white" : "bg-[#F6F6F7]",
                    index !== paginatedResults.length - 1 && "border-b border-gray-100"
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {isPdf(result.url) ? <PdfIcon /> : <FileIcon />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base md:text-lg font-medium text-gray-800 break-words">{getTitle(result)}</h2>
                    <p className="text-sm md:text-base text-gray-600 mt-1">{getDescription(result)}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.section && result.section !== 'all' && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {getSectionLabel(result.section)}
                      </span>
                    )}
                    {result.date && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {getFormattedDate(result.date)}
                      </span>
                    )}
                    {result.type && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {result.type}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2 text-xs md:text-sm"
                      onClick={() => window.open(result.url, '_blank')}
                    >
                      <ExternalLink size={16} />
                      <span className="whitespace-nowrap">Visualizar</span>
                    </Button>
                    
                    {isPdf(result.url) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-2 text-xs md:text-sm"
                        onClick={() => window.open(result.url, '_blank', 'download')}
                      >
                        <Download size={16} />
                        <span className="whitespace-nowrap">Baixar</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="my-4 md:my-6">
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem className="hidden sm:inline-block">
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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

                <div className="mx-2 sm:hidden flex items-center text-sm">
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
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                  
                <PaginationItem className="sm:hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
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
        <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
            <div className="mb-6">
              <SearchLoader size={80} noResults={true} className="mx-auto" />
            </div>
            <h2 className="text-lg md:text-xl font-medium text-gray-800 mb-2">Nenhum resultado encontrado</h2>
            <p className="text-sm md:text-base text-gray-600">
              {section !== 'all' 
                ? `Não foram encontrados editais para "${query}" na seção ${getSectionLabel(section)}. Tente buscar em todas as seções.`
                : `Não foram encontrados editais para "${query}". Tente novamente com termos diferentes.`
              }
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
