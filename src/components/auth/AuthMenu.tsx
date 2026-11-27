import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from '@/components/auth/LoginDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogIn, LogOut, Star, User } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AuthMenu: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        aria-hidden
        className="shrink-0 gap-1.5 text-white/70 hover:bg-transparent hover:text-white/70"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">…</span>
      </Button>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLoginOpen(true)}
          className="shrink-0 gap-1.5 text-white hover:bg-white/10 hover:text-white"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Acessar</span>
        </Button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  const displayName = user.fullname || user.username;

  return (
    <div className="flex shrink-0 items-center gap-1">
      {/* Atalho visível: muitos servidores não achavam o painel dentro do menu. */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="shrink-0 gap-1.5 rounded-full border-white/60 bg-transparent px-2.5 text-white hover:bg-white/15 hover:text-white sm:px-3"
      >
        <Link
          href="/admin"
          title="Painel administrativo"
          aria-label="Painel administrativo"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Painel administrativo</span>
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-white hover:bg-white/10 hover:text-white"
          >
            <User className="h-4 w-4" />
            <span className="hidden max-w-[8rem] truncate sm:inline">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/favoritos')}>
            <Star className="mr-2 h-4 w-4" />
            Favoritos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Painel administrativo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await logout();
              router.push('/');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AuthMenu;
