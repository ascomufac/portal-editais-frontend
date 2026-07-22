'use client';

import AdminActivity from '@/views/admin/AdminActivity';
import AdminHome from '@/views/admin/AdminHome';
import AdminShell from '@/views/admin/AdminShell';
import ContentBrowser from '@/views/admin/ContentBrowser';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

/**
 * Admin permanece em React Router (paths absolutos /admin/*),
 * montado apenas sob as rotas Next /admin.
 */
export default function AdminRouter() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
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
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
