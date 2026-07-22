'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  FavoriteInput,
  FavoriteItem,
  hasFavorite,
  listFavorites,
  normalizeFavoritePath,
  subscribeFavorites,
  toggleFavorite as toggleFavoriteStorage,
} from '@/services/favoritesStorage';
import { useCallback, useEffect, useState } from 'react';

export function useFavorites() {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const refresh = useCallback(() => {
    setFavorites(listFavorites(username));
  }, [username]);

  useEffect(() => {
    refresh();
    return subscribeFavorites(refresh);
  }, [refresh]);

  const isFavorite = useCallback(
    (idOrUrl: string) => hasFavorite(idOrUrl, username),
    [username]
  );

  const toggleFavorite = useCallback(
    (input: FavoriteInput) => {
      const path = normalizeFavoritePath(input.idOrUrl);
      if (!path) return { added: false };

      const { added, items } = toggleFavoriteStorage(input, username);
      setFavorites(items);
      toast({
        title: added ? 'Adicionado aos favoritos' : 'Removido dos favoritos',
        description: input.title,
        duration: 2500,
      });
      return { added };
    },
    [toast, username]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    username,
  };
}
