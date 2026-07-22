import RequireAuth from '@/components/auth/RequireAuth';
import AdminScrollToTop from '@/components/admin/AdminScrollToTop';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  ExternalLink,
  FileText,
  Folder,
  HardDrive,
  History,
  Home,
  Link2,
  LogOut,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

export type AdminCreateIntent =
  | { kind: 'upload' }
  | { kind: 'create'; type: string };

/**
 * Layout inspirado no Google Drive atual (claro + identidade UFAC).
 */
const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const displayName = user?.fullname || user?.username || 'Usuário';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase();

  const onContent = location.pathname.startsWith('/admin/conteudo');
  const onActivity = location.pathname.startsWith('/admin/atividade');
  const compactMain = onContent || onActivity;

  const goWithIntent = (intent: AdminCreateIntent) => {
    const target = location.pathname.startsWith('/admin/conteudo')
      ? location.pathname
      : '/admin/conteudo';
    navigate(target, { state: { intent } });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = search.trim();
    navigate(q ? `/admin/conteudo?q=${encodeURIComponent(q)}` : '/admin/conteudo');
  };

  const navItem = (to: string, label: string, icon: React.ReactNode, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-ufac-lightBlue text-ufac-blue'
            : 'text-slate-700 hover:bg-slate-100'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#f0f4f9]">
      {/* Top bar Drive-like */}
      <header className="flex h-16 shrink-0 items-center gap-3 px-3 sm:px-4">
        <Link
          to="/admin"
          className="flex shrink-0 items-center gap-2 px-1"
          aria-label="UFAC Editais"
        >
          <img src="/logo-ufac.svg" alt="" className="h-7 w-auto" />
        </Link>

        <form onSubmit={handleSearch} className="mx-auto w-full max-w-2xl flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar editais"
              className="h-12 rounded-full border-0 bg-[#e9eef6] pl-12 pr-4 text-base shadow-none placeholder:text-slate-500 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-ufac-blue/30"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex" asChild>
            <Link to="/">
              <Home className="mr-1.5 h-4 w-4" />
              Portal
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
          <div
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-ufac-blue text-sm font-semibold text-white"
            title={displayName}
          >
            {initial}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-0 px-2 pb-2 sm:gap-2 sm:px-3 sm:pb-3">
        {/* Sidebar */}
        <aside className="flex w-[72px] shrink-0 flex-col sm:w-60">
          <div className="px-1 pb-3 sm:px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-14 w-full justify-center gap-2 rounded-2xl bg-white px-3 text-base font-medium text-slate-800 shadow-md shadow-slate-300/40 hover:bg-slate-50 sm:justify-start sm:px-5">
                  <Plus className="h-6 w-6 text-ufac-blue" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Novo</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2">
                <DropdownMenuLabel>Criar</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-xl"
                  onClick={() => goWithIntent({ kind: 'create', type: 'Folder' })}
                >
                  <Folder className="mr-2 h-4 w-4 text-amber-500" />
                  Nova pasta
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl"
                  onClick={() => goWithIntent({ kind: 'upload' })}
                >
                  <Upload className="mr-2 h-4 w-4 text-ufac-blue" />
                  Enviar arquivos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-xl"
                  onClick={() => goWithIntent({ kind: 'create', type: 'Document' })}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Página
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl"
                  onClick={() => goWithIntent({ kind: 'create', type: 'Link' })}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1 sm:px-2">
            {navItem('/admin', 'Início', <HardDrive className="h-5 w-5 shrink-0" />, true)}
            {navItem(
              '/admin/conteudo',
              'Editais',
              <Folder className="h-5 w-5 shrink-0" />
            )}
            <NavLink
              to="/admin/atividade"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-ufac-lightBlue text-ufac-blue'
                    : 'text-slate-700 hover:bg-slate-100'
                )
              }
            >
              <History className="h-5 w-5 shrink-0" />
              <span className="hidden sm:inline">Últimas interações</span>
            </NavLink>
            <a
              href="https://www3.ufac.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ExternalLink className="h-5 w-5 shrink-0" />
              <span className="hidden sm:inline">Ufac clássico</span>
            </a>
          </nav>

          <div className="mt-auto hidden px-4 py-3 text-xs text-slate-500 sm:block">
            <p className="font-medium text-slate-700">{displayName}</p>
            <p className="truncate">@{user?.username}</p>
          </div>
        </aside>

        {/* Main panel */}
        <main
          ref={mainRef}
          className={cn(
            'min-h-0 min-w-0 flex-1 overflow-y-auto rounded-3xl bg-white',
            compactMain ? 'px-4 py-4 sm:px-6 sm:py-5' : 'px-5 py-6 sm:px-8 sm:py-8'
          )}
        >
          <Outlet
            context={useMemo(
              () => ({
                headerSearch: search,
              }),
              [search]
            )}
          />
          <AdminScrollToTop scrollRef={mainRef} />
        </main>
      </div>
    </div>
  );
};

const AdminShell: React.FC = () => (
  <RequireAuth>
    <AdminLayout />
  </RequireAuth>
);

export default AdminShell;
