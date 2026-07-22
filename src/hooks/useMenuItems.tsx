/**
 * Hook para gerenciar os itens do menu a partir da API Plone
 * @module useMenuItems
 */
import { useEffect, useState } from 'react';
import { MenuItem, fetchMenuItems, isProReitoriaId, toSetorHref } from '@/services/editalService';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenuItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const items = await fetchMenuItems();
        // Pró-reitorias sempre apontam para a listagem do setor (API real)
        setMenuItems(
          items.map((item) =>
            isProReitoriaId(item.id)
              ? { ...item, href: toSetorHref(item.id) }
              : item
          )
        );
      } catch (err) {
        console.error('Erro ao carregar itens do menu:', err);
        setError('Falha ao carregar o menu. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  return { menuItems, isLoading, error };
};
