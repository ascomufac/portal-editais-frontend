import RequireAuth from '@/components/auth/RequireAuth';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, FolderOpen, Loader2, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type SiteRoot = {
  title?: string;
  description?: string;
  '@id'?: string;
};

/**
 * Painel administrativo inicial (autenticado via Plone JWT).
 * Base para futuras ações de gestão de conteúdo.
 */
const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [site, setSite] = useState<SiteRoot | null>(null);
  const [loadingSite, setLoadingSite] = useState(true);
  const [siteError, setSiteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingSite(true);
      setSiteError(null);
      try {
        const data = await apiRequest<SiteRoot>('/');

        if (!cancelled) setSite(data);
      } catch (err) {
        if (!cancelled) {
          setSiteError(
            err instanceof Error ? err.message : 'Falha ao carregar dados autenticados.'
          );
        }
      } finally {
        if (!cancelled) setLoadingSite(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.fullname || user?.username || 'Usuário';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-sm font-medium text-ufac-blue">Administração</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Olá, {displayName}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Sessão autenticada no Plone via API. Em breve: criar e editar editais por
          aqui.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-ufac-blue" />
              Conta
            </CardTitle>
            <CardDescription>Dados do usuário autenticado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Usuário:</span>{' '}
              <span className="font-medium">{user?.username}</span>
            </p>
            {user?.email && (
              <p>
                <span className="text-slate-500">E-mail:</span>{' '}
                <span className="font-medium">{user.email}</span>
              </p>
            )}
            {user?.roles && user.roles.length > 0 && (
              <div>
                <p className="text-slate-500">Papéis:</p>
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {user.roles.map((role) => (
                    <li
                      key={role}
                      className="rounded-full bg-ufac-lightBlue px-2 py-0.5 text-xs font-medium text-ufac-blue"
                    >
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => logout()}
            >
              Sair
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-ufac-blue" />
              API autenticada
            </CardTitle>
            <CardDescription>Chamada ao portal com Bearer JWT</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {loadingSite ? (
              <p className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando…
              </p>
            ) : siteError ? (
              <p className="text-red-600">{siteError}</p>
            ) : (
              <div className="space-y-2">
                <p>
                  <span className="text-slate-500">Portal:</span>{' '}
                  <span className="font-medium">{site?.title || 'UFAC'}</span>
                </p>
                {site?.description && (
                  <p className="text-slate-600">{site.description}</p>
                )}
                <p className="text-xs text-emerald-700">
                  Autenticação OK — a API aceitou o token.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos passos</CardTitle>
          <CardDescription>
            Escopo sugerido para as próximas iterações do painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
            <li>Listar pastas/editais que o usuário pode modificar</li>
            <li>Criar e editar documentos via POST/PATCH na API Plone</li>
            <li>Upload de PDFs (TUS / @@download)</li>
            <li>Publicar / despublicar (workflow)</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Voltar ao portal</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://www3.ufac.br/editais"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir Plone clássico
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminPage: React.FC = () => (
  <MainLayout pageTitle="Administração">
    <RequireAuth>
      <AdminDashboard />
    </RequireAuth>
  </MainLayout>
);

export default AdminPage;
