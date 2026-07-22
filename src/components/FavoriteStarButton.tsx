'use client';

import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type FavoriteStarButtonProps = {
  idOrUrl: string;
  title: string;
  href?: string;
  portalType?: string;
  className?: string;
  size?: 'sm' | 'md';
};

const FavoriteStarButton: React.FC<FavoriteStarButtonProps> = ({
  idOrUrl,
  title,
  href,
  portalType,
  className,
  size = 'md',
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // localStorage só após mount — SSR e 1º paint ficam iguais (estrela vazia)
  const active = mounted && isFavorite(idOrUrl);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={active}
      title={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cn(
        'rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur hover:bg-white hover:text-amber-500',
        active && 'text-amber-500 hover:text-amber-600',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite({
          idOrUrl,
          title,
          href,
          '@type': portalType,
        });
      }}
    >
      <Star
        className="h-4 w-4"
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={1.75}
      />
    </Button>
  );
};

export default FavoriteStarButton;
