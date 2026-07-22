import { Skeleton } from '@/components/ui/skeleton';
import { useMenuItems } from '@/hooks/useMenuItems';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/services/editalService';
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarGroup from './SidebarGroup';
import { HomeIcon } from './SidebarIcons';
import SidebarLink from './SidebarLink';
import { getMenuIcon } from './menuIcons';

interface SidebarContentProps {
  closeSidebar: () => void;
  isCollapsed?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  closeSidebar,
  isCollapsed = false,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { menuItems, isLoading, error } = useMenuItems();

  const isItemActive = (item: MenuItem) => {
    if (!item.href || item.href.startsWith('http')) return false;
    return (
      location.pathname === item.href ||
      location.pathname.startsWith(`${item.href}/`) ||
      (item.url
        ? location.pathname.startsWith(`/setor/${item.id}`) ||
          location.pathname.startsWith(`/edital/${item.url}`)
        : false)
    );
  };

  useEffect(() => {
    const activeWithChildren = menuItems.find(
      (item) => item.children && item.children.length > 0 && isItemActive(item)
    );
    if (activeWithChildren && !expandedItems.includes(activeWithChildren.id)) {
      setExpandedItems((prev) => [...prev, activeWithChildren.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, menuItems]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleDirectLinkClick = () => {
    closeSidebar();
  };

  const renderChildLink = (item: MenuItem) => {
    if (item.href.startsWith('http')) {
      return (
        <a
          key={`${item.id}-${item.href}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirectLinkClick}
          className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-ufac-blue"
          title={item.title}
        >
          <span className="line-clamp-2">{item.title}</span>
        </a>
      );
    }

    return (
      <NavLink
        key={`${item.id}-${item.href}`}
        to={item.href}
        onClick={handleDirectLinkClick}
        title={item.title}
        className={({ isActive }) =>
          cn(
            'block rounded-md px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-ufac-lightBlue font-medium text-ufac-blue'
              : 'text-gray-700 hover:bg-gray-100 hover:text-ufac-blue'
          )
        }
      >
        <span className="line-clamp-2">{item.title}</span>
      </NavLink>
    );
  };

  const renderLeafLink = (item: MenuItem) => {
    if (item.href.startsWith('http')) {
      return (
        <a
          key={`${item.id}-${item.href}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirectLinkClick}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100',
            isCollapsed && 'justify-center px-2'
          )}
          title={item.title}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden [&>svg]:h-full [&>svg]:w-full">
            {getMenuIcon(item.id)}
          </span>
          {!isCollapsed && <span>{item.title}</span>}
        </a>
      );
    }

    return (
      <SidebarLink
        key={`${item.id}-${item.href}`}
        to={item.href}
        icon={getMenuIcon(item.id)}
        onClick={handleDirectLinkClick}
        closeSidebar={closeSidebar}
        isCollapsed={isCollapsed}
      >
        {item.title}
      </SidebarLink>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = Boolean(item.children && item.children.length > 0);

    if (!hasChildren) {
      return renderLeafLink(item);
    }

    return (
      <SidebarGroup
        key={item.id}
        title={item.title}
        icon={getMenuIcon(item.id)}
        isActive={isItemActive(item)}
        isExpanded={expandedItems.includes(item.id)}
        onToggle={() => toggleExpand(item.id)}
        isCollapsed={isCollapsed}
        parentPath={item.href}
      >
        {item.children!.map((child) => renderChildLink(child))}
      </SidebarGroup>
    );
  };

  return (
    <nav
      className={cn(
        'flex-1 space-y-1 overflow-y-auto no-scrollbar p-3',
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

      {isLoading ? (
        <>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-3 py-2">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </>
      ) : error ? (
        <div className="px-3 py-2 text-sm text-red-500">{error}</div>
      ) : (
        menuItems.map((item) => renderMenuItem(item))
      )}
    </nav>
  );
};

export default SidebarContent;
