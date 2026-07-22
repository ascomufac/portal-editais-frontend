
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminPage from "./pages/AdminPage";
import EditalDetail from "./pages/EditalDetail";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PdfViewerPage from "./pages/PdfViewerPage";
import ProReitoriaDetail from "./pages/ProReitoriaDetail";
import ProReitorias from "./pages/ProReitorias";
import SearchResults from "./pages/SearchResults";
import SetorPage from "./pages/SetorPage";

const queryClient = new QueryClient();

/**
 * Rotas amigáveis antigas → setor Plone correspondente
 */
const categoryRedirects: Record<string, string> = {
  graduacao: 'prograd',
  'pos-graduacao': 'propeg',
  extensao: 'proex',
  estudantis: 'proaes',
  pessoas: 'prodgep',
  idiomas: 'centro-idiomas',
  colegio: 'colegio-de-aplicacao',
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pro-reitorias" element={<ProReitorias />} />
              <Route path="/pro-reitorias/:proReitoriaId" element={<ProReitoriaDetail />} />

              {Object.entries(categoryRedirects).map(([from, to]) => (
                <Route
                  key={from}
                  path={`/${from}`}
                  element={<Navigate to={`/setor/${to}`} replace />}
                />
              ))}

              <Route path="/resultados-busca" element={<SearchResults />} />
              <Route path="/edital/*" element={<EditalDetail />} />
              <Route path="/visualizar-pdf/:pdfUrl" element={<PdfViewerPage />} />
              <Route path="/setor/:setor/:page?" element={<SetorPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
