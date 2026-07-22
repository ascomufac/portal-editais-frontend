import { cn } from '@/lib/utils';
import { REVIEW_STATE_LABELS } from '@/services/ploneContentService';
import React from 'react';

type AdminReviewStateBadgeProps = {
  state?: string | null;
  className?: string;
};

/**
 * Indicador discreto de review_state (não exibe "publicado").
 */
const AdminReviewStateBadge: React.FC<AdminReviewStateBadgeProps> = ({
  state,
  className,
}) => {
  if (!state || state === 'published') return null;
  const label = REVIEW_STATE_LABELS[state] || state;

  return (
    <span
      title={label}
      className={cn(
        'shrink-0 truncate text-[10px] font-medium leading-none tracking-wide',
        state === 'private'
          ? 'text-slate-400'
          : 'text-amber-600/90',
        className
      )}
    >
      · {label}
    </span>
  );
};

export default AdminReviewStateBadge;
