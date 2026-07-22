import RequireAuth from '@/components/auth/RequireAuth';
import AdminFolderTree from '@/components/admin/AdminFolderTree';
import AdminScrollToTop from '@/components/admin/AdminScrollToTop';
import AdminSearchBar from '@/components/admin/AdminSearchBar';
import {
  adminDriveMenuContentClass,
  adminDriveMenuIconClass,
  adminDriveMenuItemClass,
  adminDriveMenuLabelClass,
  adminDriveMenuSeparatorClass,
} from '@/components/admin/adminDriveMenuStyles';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
  ClipboardList,
  ExternalLink,
  FileText,
  Folder,
  HardDrive,
  History,
  Home,
  Layers,
  Link2,
  LogOut,
  GripVertical,
  Plus,
  Upload,
  User,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const SIDEBAR_WIDTH_KEY = 'ufac-admin-sidebar-width';
const SIDEBAR_EXPANDED_WIDTH_KEY = 'ufac-admin-sidebar-width-expanded';
const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 520;
const SIDEBAR_DEFAULT = 240;

const clampSidebarWidth = (n: number) =>
  Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, n));

const readSidebarWidth = () => {
  try {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const n = raw ? Number(raw) : SIDEBAR_DEFAULT;
    if (!Number.isFinite(n)) return SIDEBAR_DEFAULT;
    return clampSidebarWidth(n);
  } catch {
    return SIDEBAR_DEFAULT;
  }
};

const readExpandedSidebarWidth = () => {
  try {
    const raw = localStorage.getItem(SIDEBAR_EXPANDED_WIDTH_KEY);
    const n = raw ? Number(raw) : SIDEBAR_DEFAULT;
    if (!Number.isFinite(n)) return SIDEBAR_DEFAULT;
    return clampSidebarWidth(n);
  } catch {
    return SIDEBAR_DEFAULT;
  }
};

/**
 * Layout inspirado no Google Drive atual (claro + identidade UFAC).
 */
const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(readSidebarWidth);
  const [resizing, setResizing] = useState(false);
  const [treeExpanded, setTreeExpanded] = useState(true);
  const displayName = user?.fullname || user?.username || 'Usuário';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase();

  const onContent = location.pathname.startsWith('/admin/conteudo');
  const onFeed =
    location.pathname.startsWith('/admin/atividade') ||
    location.pathname.startsWith('/admin/para-publicar') ||
    location.pathname.startsWith('/admin/meus');
  const compactMain = onContent || onFeed;

  const goWithIntent = (intent: AdminCreateIntent) => {
    const target = location.pathname.startsWith('/admin/conteudo')
      ? location.pathname
      : '/admin/conteudo';
    navigate(target, { state: { intent } });
  };

  const onResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragRef.current = { startX: event.clientX, startWidth: sidebarWidth };
      setResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [sidebarWidth]
  );

  const onResizeMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta = event.clientX - dragRef.current.startX;
    const next = clampSidebarWidth(dragRef.current.startWidth + delta);
    setSidebarWidth(next);
  }, []);

  const onResizeEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setResizing(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const handleTreeExpandedChange = useCallback((expanded: boolean) => {
    setTreeExpanded((wasExpanded) => {
      if (wasExpanded === expanded) return expanded;
      if (!expanded) {
        // Fechou a árvore → largura normal
        setSidebarWidth((w) => {
          if (w > SIDEBAR_DEFAULT) {
            try {
              localStorage.setItem(SIDEBAR_EXPANDED_WIDTH_KEY, String(w));
            } catch {
              // ignore
            }
          }
          return SIDEBAR_DEFAULT;
        });
      } else {
        // Abriu de novo → restaura largura ampliada, se houver
        setSidebarWidth(readExpandedSidebarWidth());
      }
      return expanded;
    });
  }, []);

  useEffect(() => {
    if (resizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
      if (treeExpanded && sidebarWidth > SIDEBAR_DEFAULT) {
        localStorage.setItem(SIDEBAR_EXPANDED_WIDTH_KEY, String(sidebarWidth));
      }
    } catch {
      // ignore
    }
  }, [sidebarWidth, treeExpanded]);

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
      <header className="relative z-[60] flex h-16 shrink-0 items-center gap-3 overflow-visible px-3 sm:px-4">
        <Link
          to="/admin"
          className="flex shrink-0 items-center gap-2 px-1"
          aria-label="UFAC Editais"
        >
          <img src="/logo-ufac.svg" alt="" className="h-7 w-auto" />
        </Link>

        <AdminSearchBar currentUsername={user?.username} />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex" asChild>
            <Link to="/">
              <Home className="mr-1.5 h-4 w-4" />
              Portal
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-ufac-blue text-sm font-semibold text-white outline-none ring-offset-2 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ufac-blue/40 data-[state=open]:ring-2 data-[state=open]:ring-ufac-blue/40"
                title={displayName}
                aria-label={`Conta de ${displayName}`}
              >
                {initial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className={cn(adminDriveMenuContentClass, 'w-60')}
            >
              <DropdownMenuLabel className={cn(adminDriveMenuLabelClass, 'font-normal')}>
                <div className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-slate-900">
                    {displayName}
                  </span>
                  {user?.username && (
                    <span className="truncate text-xs text-slate-500">
                      @{user.username}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={adminDriveMenuSeparatorClass} />
              <DropdownMenuItem
                className={adminDriveMenuItemClass}
                onClick={() => navigate('/admin/meus')}
              >
                <User className={adminDriveMenuIconClass} />
                Meus editais
              </DropdownMenuItem>
              <DropdownMenuItem className={adminDriveMenuItemClass} asChild>
                <Link to="/">
                  <Home className={adminDriveMenuIconClass} />
                  Portal público
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className={adminDriveMenuSeparatorClass} />
              <DropdownMenuItem
                className={adminDriveMenuItemClass}
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
              >
                <LogOut className={adminDriveMenuIconClass} />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-0 px-2 pb-2 sm:gap-0 sm:px-3 sm:pb-3">
        {/* Sidebar */}
        <aside
          className={cn(
            'relative flex w-[72px] shrink-0 flex-col sm:w-[var(--admin-sidebar-w)]',
            !resizing && 'sm:transition-[width] sm:duration-200 sm:ease-out'
          )}
          style={
            {
              ['--admin-sidebar-w' as string]: `${sidebarWidth}px`,
            } as React.CSSProperties
          }
        >
          <div className="px-1 pb-3 sm:px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-14 w-full justify-center gap-2 rounded-2xl bg-white px-3 text-base font-medium text-slate-800 shadow-md shadow-slate-300/40 hover:bg-slate-50 sm:justify-start sm:px-5">
                  <Plus className="h-6 w-6 text-ufac-blue" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Novo</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                alignOffset={0}
                className={cn(adminDriveMenuContentClass, 'w-56')}
              >
                <DropdownMenuLabel className={adminDriveMenuLabelClass}>
                  Adicionar item…
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={adminDriveMenuSeparatorClass} />
                <DropdownMenuItem
                  className={adminDriveMenuItemClass}
                  onClick={() => goWithIntent({ kind: 'upload' })}
                >
                  <Upload className={adminDriveMenuIconClass} />
                  Arquivo
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={adminDriveMenuItemClass}
                  onClick={() => goWithIntent({ kind: 'create', type: 'Collection' })}
                >
                  <Layers className={adminDriveMenuIconClass} />
                  Coleção
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={adminDriveMenuItemClass}
                  onClick={() => goWithIntent({ kind: 'create', type: 'Link' })}
                >
                  <Link2 className={adminDriveMenuIconClass} />
                  Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={adminDriveMenuItemClass}
                  onClick={() => goWithIntent({ kind: 'create', type: 'Folder' })}
                >
                  <Folder className={adminDriveMenuIconClass} />
                  Pasta
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={adminDriveMenuItemClass}
                  onClick={() => goWithIntent({ kind: 'create', type: 'Document' })}
                >
                  <FileText className={adminDriveMenuIconClass} />
                  Página
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col px-1 sm:px-2">
            <div className="shrink-0 space-y-0.5">
              {navItem('/admin', 'Início', <HardDrive className="h-5 w-5 shrink-0" />, true)}
              <div className="sm:hidden">
                {navItem(
                  '/admin/conteudo',
                  'Editais',
                  <Folder className="h-5 w-5 shrink-0" />
                )}
              </div>
            </div>

            {/* Árvore: área rolável que cresce com a sidebar */}
            <div className="mt-1 min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1">
              <AdminFolderTree onRootExpandedChange={handleTreeExpandedChange} />
            </div>

            <div className="shrink-0 space-y-0.5 border-t border-slate-200/70 pt-2">
              {navItem(
                '/admin/atividade',
                'Últimas interações',
                <History className="h-5 w-5 shrink-0" />
              )}
              {navItem(
                '/admin/para-publicar',
                'Para publicar',
                <ClipboardList className="h-5 w-5 shrink-0" />
              )}
              {navItem(
                '/admin/meus',
                'Meus editais',
                <User className="h-5 w-5 shrink-0" />
              )}
              <a
                href="https://www3.ufac.br"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <ExternalLink className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Ufac clássico</span>
              </a>
            </div>
          </nav>

          <div className="mt-auto hidden shrink-0 px-4 py-3 text-xs text-slate-500 sm:block">
            <p className="font-medium text-slate-700">{displayName}</p>
            <p className="truncate">@{user?.username}</p>
          </div>

          {/* Divisor arrastável (desktop) */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Redimensionar painel de pastas"
            title="Arraste para redimensionar · duplo clique restaura"
            aria-valuenow={sidebarWidth}
            aria-valuemin={SIDEBAR_MIN}
            aria-valuemax={SIDEBAR_MAX}
            tabIndex={0}
            onPointerDown={onResizeStart}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeEnd}
            onPointerCancel={onResizeEnd}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSidebarWidth((w) => Math.max(SIDEBAR_MIN, w - 16));
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setSidebarWidth((w) => Math.min(SIDEBAR_MAX, w + 16));
              }
            }}
            onDoubleClick={() => setSidebarWidth(SIDEBAR_DEFAULT)}
            className={cn(
              'group/resize absolute -right-2 top-0 z-20 hidden h-full w-4 cursor-col-resize touch-none sm:flex sm:items-center sm:justify-center',
              'focus-visible:outline-none'
            )}
          >
            {/* Linha contínua */}
            <span
              className={cn(
                'absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full bg-slate-300/80 transition-colors',
                'group-hover/resize:bg-ufac-blue/50 group-focus-visible/resize:bg-ufac-blue',
                resizing && 'bg-ufac-blue'
              )}
              aria-hidden
            />
            {/* Pegador com ícone */}
            <span
              className={cn(
                'relative z-10 flex h-10 w-3.5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm shadow-slate-300/40 transition',
                'group-hover/resize:border-ufac-blue/40 group-hover/resize:text-ufac-blue group-hover/resize:shadow-md',
                'group-focus-visible/resize:border-ufac-blue group-focus-visible/resize:text-ufac-blue',
                resizing && 'border-ufac-blue text-ufac-blue shadow-md'
              )}
              aria-hidden
            >
              <GripVertical className="h-3.5 w-3.5" strokeWidth={2.25} />
            </span>
          </div>
        </aside>

        {/* Main panel */}
        <main
          ref={mainRef}
          className={cn(
            'min-h-0 min-w-0 flex-1 overflow-y-auto rounded-3xl bg-white sm:ml-2',
            compactMain ? 'px-4 py-4 sm:px-6 sm:py-5' : 'px-5 py-6 sm:px-8 sm:py-8',
            resizing && 'pointer-events-none'
          )}
        >
          <Outlet />
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
