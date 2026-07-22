/**
 * Hook para gerenciar os itens do menu a partir da API Plone
 * @module useMenuItems
 */
import { useEffect, useState } from 'react';
import { MenuItem, fetchMenuItems } from '@/services/editalService';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMenuItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const items = await fetchMenuItems();
        if (!cancelled) setMenuItems(items);
      } catch (err) {
        console.error('Erro ao carregar itens do menu:', err);
        if (!cancelled) {
          setError('Falha ao carregar o menu. Por favor, tente novamente.');
          setMenuItems([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadMenuItems();
    return () => {
      cancelled = true;
    };
  }, []);

  return { menuItems, isLoading, error };
};
