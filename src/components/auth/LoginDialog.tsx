import { useAuth, AuthError } from '@/contexts/AuthContext';
import { requestPasswordReset } from '@/services/authService';
import UfacEditaisLogo from '@/components/brand/UfacEditaisLogo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

type Mode = 'login' | 'reset';

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setMode('login');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setSuccess(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await login(username, password);
      setPassword('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : 'Não foi possível autenticar. Tente novamente.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(username);
      setSuccess(
        'Se a conta existir e permitir redefinição, enviamos instruções para o e-mail cadastrado.'
      );
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : 'Não foi possível solicitar a redefinição de senha.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md sm:rounded-2xl">
        {/* Logo azul sobre fundo claro (mesma arte do header, variante onLight) */}
        <div className="border-b border-slate-100 bg-white px-8 pb-7 pt-11 sm:px-10 sm:pb-8 sm:pt-12">
          <div className="flex justify-center">
            <UfacEditaisLogo
              variant="onLight"
              className="h-10 w-auto max-w-[min(100%,18rem)] sm:h-11"
            />
          </div>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              {mode === 'login' ? 'Acessar' : 'Redefinir senha'}
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-slate-500 sm:text-sm">
              {mode === 'login'
                ? 'Entre com sua conta do portal UFAC (mesmo usuário do Ufac).'
                : 'Informe o usuário. O Ufac enviará um e-mail com o link para criar uma nova senha.'}
            </DialogDescription>
          </DialogHeader>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">
                  Nome do usuário <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="login-username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={submitting}
                  autoFocus
                  className="h-11 text-base md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={submitting}
                    className="h-11 pr-10 text-base md:text-base"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={submitting}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  className="text-sm text-ufac-blue hover:underline"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setMode('reset');
                  }}
                >
                  Problemas ao fazer login?
                </button>
                <Button type="submit" className="bg-ufac-blue" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando…
                    </>
                  ) : (
                    'Acessar'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-username">
                  Nome do usuário <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reset-username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={submitting || Boolean(success)}
                  autoFocus
                  className="h-11 text-base md:text-base"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-emerald-700" role="status">
                  {success}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-ufac-blue hover:underline"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setMode('login');
                  }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao login
                </button>
                {!success && (
                  <Button type="submit" className="bg-ufac-blue" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      'Enviar e-mail'
                    )}
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
