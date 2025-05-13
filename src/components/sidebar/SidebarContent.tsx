
import { Skeleton } from '@/components/ui/skeleton';
import { useMenuItems } from '@/hooks/useMenuItems';
import { cn } from '@/lib/utils';
import { Building } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarGroup from './SidebarGroup';
import {
  AssuntosEstudantisIcon,
  CentroIdiomasIcon,
  ColegioAplicacaoIcon,
  ExtensaoIcon,
  GestaoPessoasIcon,
  GraduacaoIcon,
  HomeIcon,
  PesquisaIcon,
  ProReitoriasIcon
} from './SidebarIcons';
import SidebarLink from './SidebarLink';

interface SidebarContentProps {
  closeSidebar: () => void;
  isCollapsed?: boolean;
}

/**
 * Componente que renderiza o conteúdo da barra lateral
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.closeSidebar - Função para fechar a barra lateral
 * @param {boolean} [props.isCollapsed=false] - Se a barra lateral está recolhida
 * @returns {JSX.Element} Componente renderizado
 */
const SidebarContent: React.FC<SidebarContentProps> = ({ closeSidebar, isCollapsed = false }) => {
  // Start with Pro-reitorias expanded
  const [expandedItems, setExpandedItems] = useState<string[]>(['pro-reitorias']);
  const location = useLocation();
  const { menuItems, isLoading, error } = useMenuItems();
  
  // Pro-reitorias child routes
  const proReitoriasPaths = [
    '/pro-reitorias',
    '/pro-reitorias/prograd',
    '/pro-reitorias/propeg',
    '/pro-reitorias/proex',
    '/pro-reitorias/proaes',
    '/pro-reitorias/prodgep',
    '/graduacao',
    '/pos-graduacao',
    '/extensao',
    '/estudantis',
    '/pessoas'
  ];

  // Check if current path is a Pro-reitoria path
  const isProReitorias = proReitoriasPaths.some(path => location.pathname.startsWith(path));

  // Ensure Pro-reitorias stays expanded when in a relevant route
  useEffect(() => {
    if (isProReitorias && !expandedItems.includes('pro-reitorias') && !isCollapsed) {
      setExpandedItems(prev => [...prev, 'pro-reitorias']);
    }
  }, [isProReitorias, expandedItems, isCollapsed]);

  // Toggle expansion of an item
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(item => item !== itemId) 
        : [...prev, itemId]
    );
  };

  // Handle click on links without children
  const handleDirectLinkClick = () => {
    closeSidebar(); // Close the sidebar when clicking a direct link
  };

  // Mapeamento de IDs para ícones existentes
  const getIconForItem = (itemId: string) => {
    const iconsMap: { [key: string]: JSX.Element } = {
      'prograd': <GraduacaoIcon />,
      'propeg': <PesquisaIcon />,
      'proex': <ExtensaoIcon />,
      'proaes': <AssuntosEstudantisIcon />,
      'prodgep': <GestaoPessoasIcon />,
      'centro-idiomas': <CentroIdiomasIcon />,
      'colegio-de-aplicacao': <ColegioAplicacaoIcon />
    };

    return iconsMap[itemId] || <Building className="text-ufac-blue" size={18} />;
  };

  return (
    <nav className={cn(
      "flex-1 overflow-y-auto p-3 space-y-1",
      isCollapsed && "px-2 py-3"
    )}>
      <SidebarLink 
        to="/" 
        icon={<HomeIcon />}
        onClick={handleDirectLinkClick}
        closeSidebar={closeSidebar}
        isCollapsed={isCollapsed}
        exactMatch={true}
      >
        Início
      </SidebarLink>

      <SidebarGroup
        title="Pró-reitorias"
        icon={<ProReitoriasIcon />}
        isActive={isProReitorias}
        isExpanded={expandedItems.includes('pro-reitorias')}
        onToggle={() => toggleExpand('pro-reitorias')}
        isCollapsed={isCollapsed}
        parentPath="/pro-reitorias"
      >
        <SidebarLink 
          to="/pro-reitorias/prograd" 
          icon={<GraduacaoIcon />}
          onClick={handleDirectLinkClick}
          closeSidebar={closeSidebar}
          isCollapsed={false}
        >
          Graduação
        </SidebarLink>
        <SidebarLink 
          to="/pro-reitorias/propeg" 
          icon={<PesquisaIcon />}
          onClick={handleDirectLinkClick}
          closeSidebar={closeSidebar}
          isCollapsed={false}
        >
          Pesquisa e Pós-graduação
        </SidebarLink>
        <SidebarLink 
          to="/pro-reitorias/proex" 
          icon={<ExtensaoIcon />}
          onClick={handleDirectLinkClick}
          closeSidebar={closeSidebar}
          isCollapsed={false}
        >
          Extensão e Cultura
        </SidebarLink>
        <SidebarLink 
          to="/pro-reitorias/proaes" 
          icon={<AssuntosEstudantisIcon />}
          onClick={handleDirectLinkClick}
          closeSidebar={closeSidebar}
          isCollapsed={false}
        >
          Assuntos Estudantis
        </SidebarLink>
        <SidebarLink 
          to="/pro-reitorias/prodgep" 
          icon={<GestaoPessoasIcon />}
          onClick={handleDirectLinkClick}
          closeSidebar={closeSidebar}
          isCollapsed={false}
        >
          Gestão de Pessoas
        </SidebarLink>
      </SidebarGroup>

      {isLoading ? (
        // Skeleton loaders enquanto carrega
        <>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-3 py-2">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </>
      ) : error ? (
        // Mensagem de erro
        <div className="px-3 py-2 text-sm text-red-500">
          {error}
        </div>
      ) : (
        // Renderizar itens da API
        <>
          {menuItems.map((item) => {
            // Pular os itens que já estão representados no menu de Pró-reitorias
            if (['prograd', 'propeg', 'proex', 'proaes', 'prodgep'].includes(item.id)) {
              return null;
            }
            
            return (
              <SidebarLink 
                key={item.id}
                to={`/setor${item.url}`} 
                icon={getIconForItem(item.id)}
                onClick={handleDirectLinkClick}
                closeSidebar={closeSidebar}
                isCollapsed={isCollapsed}
              >
                {item.title}
              </SidebarLink>
            );
          })}
        </>
      )}
    </nav>
  );
};

export default SidebarContent;
