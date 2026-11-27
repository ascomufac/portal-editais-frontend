import { useAuth, AuthError } from '@/contexts/AuthContext';
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
import { ArrowLeft, Eye, EyeOff, Info, Loader2, Mail } from 'lucide-react';

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

type Mode = 'login' | 'reset';

/** Contato da Ascom, que cuida das contas do portal. */
const ASCOM_EMAIL = 'ascom@ufac.br';

const buildResetMailto = (username: string) => {
  const subject = 'Redefinição de senha – Portal de Editais';
  const body = [
    'Olá, Ascom.',
    '',
    'Solicito a redefinição da minha senha de acesso ao Portal de Editais.',
    '',
    `Usuário: ${username.trim() || '(informe seu usuário)'}`,
    'Nome completo:',
    'Setor/unidade:',
  ].join('\n');
  return `mailto:${ASCOM_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/** Aviso para candidatos, que costumam chegar aqui por engano. */
const CandidateNotice: React.FC = () => (
  <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">
    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
    <p>
      <strong>É candidato?</strong> Você não precisa de cadastro aqui. As
      orientações de inscrição e de acesso aos sistemas de seleção estão em
      cada edital.
    </p>
  </div>
);

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setMode('login');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
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
              {mode === 'login' ? 'Acesso de servidores' : 'Redefinir senha'}
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-slate-500 sm:text-sm">
              {mode === 'login'
                ? 'Área exclusiva para servidores da Ufac que publicam editais no portal.'
                : 'A redefinição de senha das contas do portal é feita pela Ascom.'}
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

              <CandidateNotice />

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  className="text-sm text-ufac-blue hover:underline"
                  onClick={() => {
                    setError(null);
                    setMode('reset');
                  }}
                >
                  Esqueci minha senha
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
            <div className="space-y-4">
              <div className="space-y-2 text-sm leading-relaxed text-slate-700">
                <p>
                  Envie um e-mail para{' '}
                  <a
                    href={`mailto:${ASCOM_EMAIL}`}
                    className="font-semibold text-ufac-blue hover:underline"
                  >
                    {ASCOM_EMAIL}
                  </a>{' '}
                  informando o seu <strong>nome de usuário</strong>. Retornaremos o
                  contato.
                </p>
                <p className="text-[13px] text-slate-500">
                  Este cadastro é apenas para servidores da Ufac.
                </p>
              </div>

              <CandidateNotice />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-ufac-blue hover:underline"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao login
                </button>
                <Button asChild className="bg-ufac-blue">
                  <a href={buildResetMailto(username)}>
                    <Mail className="mr-2 h-4 w-4" aria-hidden />
                    Escrever para a Ascom
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
