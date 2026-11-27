import { splitEditalTitle } from '@/lib/editalTitle';
import { cn } from '@/lib/utils';
import React from 'react';

type AdminEditalTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  /** Classes do assunto (tamanho da fonte etc.). */
  subjectClassName?: string;
};

/**
 * Título nas grades do painel, no mesmo estilo dos cards do portal: número do
 * edital pequeno em cima e assunto em destaque (até 3 linhas). Mantém o texto
 * como foi cadastrado. Aceita ref/props para funcionar como gatilho `asChild`.
 */
const AdminEditalTitle = React.forwardRef<HTMLDivElement, AdminEditalTitleProps>(
  ({ title, subjectClassName, className, ...rest }, ref) => {
    const { identifier, subject } = splitEditalTitle(title);
    return (
      <div ref={ref} className={cn('min-w-0', className)} title={title} {...rest}>
        {identifier && (
          <p className="truncate text-[11px] font-medium leading-tight text-slate-500">
            {identifier}
          </p>
        )}
        <p
          className={cn(
            'line-clamp-3 break-words font-medium leading-snug text-slate-900',
            subjectClassName
          )}
        >
          {subject}
        </p>
      </div>
    );
  }
);
AdminEditalTitle.displayName = 'AdminEditalTitle';

export default AdminEditalTitle;
