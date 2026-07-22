import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminActivity from "./views/admin/AdminActivity";
import AdminHome from "./views/admin/AdminHome";
import AdminShell from "./views/admin/AdminShell";
import ContentBrowser from "./views/admin/ContentBrowser";
import EditalDetail from "./views/EditalDetail";
import Index from "./views/Index";
import NotFound from "./views/NotFound";
import PdfViewerPage from "./views/PdfViewerPage";
import ProReitoriaDetail from "./views/ProReitoriaDetail";
import ProReitorias from "./views/ProReitorias";
import SearchResults from "./views/SearchResults";
import SetorPage from "./views/SetorPage";

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

              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<AdminHome />} />
                <Route path="atividade" element={<AdminActivity />} />
                <Route
                  path="para-publicar"
                  element={<AdminActivity preset="toPublish" />}
                />
                <Route path="meus" element={<AdminActivity preset="mine" />} />
                <Route path="conteudo" element={<ContentBrowser />} />
                <Route path="conteudo/*" element={<ContentBrowser />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
