
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Páginas
import CategoryPage from "./pages/CategoryPage";
import EditalDetail from "./pages/EditalDetail";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PdfViewerPage from "./pages/PdfViewerPage";
import ProReitoriaDetail from "./pages/ProReitoriaDetail";
import ProReitorias from "./pages/ProReitorias";
import SearchResults from "./pages/SearchResults";
import SetorPage from "./pages/SetorPage";

/**
 * Cliente de consulta para React Query
 */
const queryClient = new QueryClient();

/**
 * Componente principal da aplicação
 * Define as rotas e provedores de contexto
 * @returns {JSX.Element} Componente React renderizado
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pro-reitorias" element={<ProReitorias />} />
            <Route path="/pro-reitorias/:proReitoriaId" element={<ProReitoriaDetail />} />
            <Route path="/graduacao" element={<CategoryPage />} />
            <Route path="/pos-graduacao" element={<CategoryPage />} />
            <Route path="/extensao" element={<CategoryPage />} />
            <Route path="/estudantis" element={<CategoryPage />} />
            <Route path="/pessoas" element={<CategoryPage />} />
            <Route path="/idiomas" element={<CategoryPage />} />
            <Route path="/colegio" element={<CategoryPage />} />
            <Route path="/resultados-busca" element={<SearchResults />} />
            <Route path="/edital/:setor/:editalId/*" element={<EditalDetail />} />
            <Route path="/visualizar-pdf/:pdfUrl" element={<PdfViewerPage />} />
            {/* Rota dinâmica para setores */}
            <Route path="setor/:setor/:page?" element={<SetorPage />} />
            {/* ADICIONE TODAS AS ROTAS PERSONALIZADAS ACIMA DA ROTA CURINGA "*" */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
