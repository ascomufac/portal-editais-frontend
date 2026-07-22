import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from '@/components/auth/LoginDialog';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type RequireAuthProps = {
  children: React.ReactNode;
};

/**
 * Protege rotas: exige sessão Plone JWT.
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLoginOpen(true);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Verificando sessão…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginDialog
          open={loginOpen}
          onOpenChange={(open) => {
            setLoginOpen(open);
            if (!open && !isAuthenticated) {
              // se fechar sem logar, permanece na tela pedindo auth
            }
          }}
        />
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Área restrita</h1>
          <p className="mt-2 text-sm text-slate-600">
            Faça login com sua conta do portal UFAC para acessar o painel
            administrativo.
          </p>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
