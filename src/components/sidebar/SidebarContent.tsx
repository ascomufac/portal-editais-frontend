import { Skeleton } from '@/components/ui/skeleton';
import { useMenuItems } from '@/hooks/useMenuItems';
import { cn } from '@/lib/utils';
import { isProReitoriaId } from '@/services/editalService';
import { Building } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  ProReitoriasIcon,
} from './SidebarIcons';
import SidebarLink from './SidebarLink';

interface SidebarContentProps {
  closeSidebar: () => void;
  isCollapsed?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  closeSidebar,
  isCollapsed = false,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['pro-reitorias']);
  const location = useLocation();
  const { menuItems, isLoading, error } = useMenuItems();

  const proReitoriaItems = menuItems.filter((item) => isProReitoriaId(item.id));
  const otherItems = menuItems.filter((item) => !isProReitoriaId(item.id));

  const isProReitorias =
    location.pathname.startsWith('/pro-reitorias') ||
    location.pathname.startsWith('/setor/prograd') ||
    location.pathname.startsWith('/setor/propeg') ||
    location.pathname.startsWith('/setor/proex') ||
    location.pathname.startsWith('/setor/proaes') ||
    location.pathname.startsWith('/setor/prodgep') ||
    location.pathname.startsWith('/graduacao') ||
    location.pathname.startsWith('/pos-graduacao') ||
    location.pathname.startsWith('/extensao') ||
    location.pathname.startsWith('/estudantis') ||
    location.pathname.startsWith('/pessoas');

  useEffect(() => {
    if (isProReitorias && !expandedItems.includes('pro-reitorias') && !isCollapsed) {
      setExpandedItems((prev) => [...prev, 'pro-reitorias']);
    }
  }, [isProReitorias, expandedItems, isCollapsed]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleDirectLinkClick = () => {
    closeSidebar();
  };

  const getIconForItem = (itemId: string) => {
    const iconsMap: Record<string, JSX.Element> = {
      prograd: <GraduacaoIcon />,
      propeg: <PesquisaIcon />,
      proex: <ExtensaoIcon />,
      proaes: <AssuntosEstudantisIcon />,
      prodgep: <GestaoPessoasIcon />,
      'centro-idiomas': <CentroIdiomasIcon />,
      'colegio-de-aplicacao': <ColegioAplicacaoIcon />,
    };

    return iconsMap[itemId] || <Building className="h-full w-full text-ufac-blue" strokeWidth={2} />;
  };

  const proReitoriaLabels: Record<string, string> = {
    prograd: 'Graduação',
    propeg: 'Pesquisa e Pós-graduação',
    proex: 'Extensão e Cultura',
    proaes: 'Assuntos Estudantis',
    prodgep: 'Gestão de Pessoas',
  };

  return (
    <nav
      className={cn(
        'flex-1 overflow-y-auto p-3 space-y-1',
        isCollapsed && 'px-2 py-3'
      )}
    >
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
        {isLoading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="px-3 py-2">
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          : proReitoriaItems.map((item) => (
              <SidebarLink
                key={item.id}
                to={item.href}
                icon={getIconForItem(item.id)}
                onClick={handleDirectLinkClick}
                closeSidebar={closeSidebar}
                isCollapsed={false}
              >
                {proReitoriaLabels[item.id] || item.title}
              </SidebarLink>
            ))}
      </SidebarGroup>

      {isLoading ? (
        <>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-3 py-2">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </>
      ) : error ? (
        <div className="px-3 py-2 text-sm text-red-500">{error}</div>
      ) : (
        otherItems.map((item) => {
          const isExternal = item.href.startsWith('http');

          if (isExternal) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDirectLinkClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ufac-blue hover:bg-ufac-lightBlue/40',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden [&>svg]:h-full [&>svg]:w-full [&>svg]:max-h-full [&>svg]:max-w-full">
                  {getIconForItem(item.id)}
                </span>
                {!isCollapsed && <span>{item.title}</span>}
              </a>
            );
          }

          return (
            <SidebarLink
              key={item.id}
              to={item.href}
              icon={getIconForItem(item.id)}
              onClick={handleDirectLinkClick}
              closeSidebar={closeSidebar}
              isCollapsed={isCollapsed}
            >
              {item.title}
            </SidebarLink>
          );
        })
      )}
    </nav>
  );
};

export default SidebarContent;
