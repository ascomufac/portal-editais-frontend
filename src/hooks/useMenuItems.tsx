
/**
 * Hook para gerenciar os itens do menu
 * @module useMenuItems
 */
import { useEffect, useState } from 'react';
import { MenuItem, fetchMenuItems } from '@/services/editalService';

/**
 * Hook personalizado para buscar e gerenciar os itens do menu
 * @returns {Object} Estado e funções relacionadas aos itens do menu
 */
export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para processar os itens do menu e formatar as URLs corretamente
  const processMenuItems = (items: MenuItem[]): MenuItem[] => {
    // Mapear os itens especiais (pró-reitorias) para suas rotas específicas
    const proReitoriaRoutes: Record<string, string> = {
      'prograd': '/pro-reitorias/prograd',
      'propeg': '/pro-reitorias/propeg',
      'proex': '/pro-reitorias/proex',
      'proaes': '/pro-reitorias/proaes',
      'prodgep': '/pro-reitorias/prodgep'
    };

    return items.map(item => {
      // Se for uma pró-reitoria especificada, use a rota predefinida
      if (proReitoriaRoutes[item.id]) {
        return {
          ...item,
          url: proReitoriaRoutes[item.id]
        };
      }
      
      // Para outros itens, use a rota dinâmica baseada no ID
      return {
        ...item,
        url: `/${item.id}`
      };
    });
  };

  useEffect(() => {
    const loadMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const items = await fetchMenuItems();
        setMenuItems(processMenuItems(items));
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
