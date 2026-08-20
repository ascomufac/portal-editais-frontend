'use client';

import {
  appVersionDisplay,
  appVersionFull,
  appVersionTooltip,
} from '@/lib/appVersion';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

type AppVersionProps = {
  className?: string;
  /** Esconde o texto quando a sidebar está colapsada (mostra só no title). */
  compact?: boolean;
};

/**
 * Versão discreta para user/tester. Clique copia vX.Y.Z+sha.
 */
const AppVersion: React.FC<AppVersionProps> = ({ className, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const tip = copied ? 'Copiado' : appVersionTooltip();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(appVersionFull);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      title={tip}
      aria-label={`Versão ${appVersionFull}. Clique para copiar.`}
      className={cn(
        'group/version inline-flex max-w-full items-center rounded-md px-1.5 py-0.5',
        'text-[11px] font-medium tracking-wide text-slate-400/90',
        'transition-colors hover:bg-slate-100/80 hover:text-slate-600',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue/30',
        compact && 'justify-center px-1',
        className
      )}
    >
      <span className={cn('truncate tabular-nums', compact && 'sr-only')}>
        {appVersionDisplay}
      </span>
      {compact && (
        <span className="tabular-nums" aria-hidden>
          v
        </span>
      )}
    </button>
  );
};

export default AppVersion;
