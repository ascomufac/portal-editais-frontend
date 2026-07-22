import { Skeleton } from '@/components/ui/skeleton';
import { useMenuItems } from '@/hooks/useMenuItems';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/services/editalService';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { menuItems, isLoading, error } = useMenuItems();

  const isItemActive = (item: MenuItem): boolean => {
    if (item.isGroup) {
      return Boolean(item.children?.some((child) => isItemActive(child)));
    }
    if (!item.href || item.href === '#' || item.href.startsWith('http')) return false;
    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      (item.url
        ? pathname.startsWith(`/setor/${item.id}`) ||
          pathname.startsWith(`/edital/${item.url}`)
        : false)
    );
  };

  useEffect(() => {
    const toExpand: string[] = [];

    const walk = (items: MenuItem[], ancestors: string[] = []) => {
      for (const item of items) {
        if (item.children?.length) {
          if (isItemActive(item) || item.children.some((c) => isItemActive(c))) {
            toExpand.push(...ancestors, item.id);
          }
          walk(item.children, [...ancestors, item.id]);
        }
      }
    };

    walk(menuItems);
    if (toExpand.length) {
      setExpandedItems((prev) => Array.from(new Set([...prev, ...toExpand])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menuItems]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleDirectLinkClick = () => {
    closeSidebar();
  };

  const renderNavLink = (item: MenuItem, depth: number) => {
    const style = depth > 0 ? { paddingLeft: `${0.75 + depth * 0.65}rem` } : undefined;

    if (item.href.startsWith('http')) {
      return (
        <a
          key={`${item.id}-${item.href}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirectLinkClick}
          title={item.title}
          style={style}
          className={cn(
            'block rounded-md py-1.5 pr-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-ufac-blue',
            depth === 0 && 'px-3 py-2 text-gray-700'
          )}
        >
          <span className="line-clamp-2">{item.title}</span>
        </a>
      );
    }

    return (
      <Link
        key={`${item.id}-${item.href}`}
        href={item.href}
        onClick={handleDirectLinkClick}
        title={item.title}
        style={style}
        className={cn(
          'block rounded-md py-1.5 pr-3 text-sm transition-colors',
          depth === 0 && 'px-3 py-2',
          isItemActive(item)
            ? 'bg-ufac-lightBlue font-medium text-ufac-blue'
            : 'text-gray-600 hover:bg-gray-100 hover:text-ufac-blue',
          depth > 0 && 'ml-2 border-l border-slate-200'
        )}
      >
        <span className="line-clamp-2">{item.title}</span>
      </Link>
    );
  };

  /** Subárvore aninhada (filhos de um setor) */
  const renderNestedItem = (item: MenuItem, depth: number): React.ReactNode => {
    const hasChildren = Boolean(item.children && item.children.length > 0);

    if (!hasChildren) {
      return renderNavLink(item, depth);
    }

    const open = expandedItems.includes(item.id);
    const active = isItemActive(item);
    const padLeft = 0.75 + depth * 0.65;

    return (
      <div key={item.id} className="space-y-0.5">
        <div
          style={{ paddingLeft: `${padLeft}rem` }}
          className={cn(
            'flex w-full items-center gap-0.5 rounded-md py-0.5 pr-1',
            depth > 0 && 'ml-2 border-l border-slate-200'
          )}
        >
          <button
            type="button"
            onClick={() => toggleExpand(item.id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-ufac-blue"
            aria-expanded={open}
            aria-label={open ? `Recolher ${item.title}` : `Expandir ${item.title}`}
          >
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                open ? 'rotate-0' : '-rotate-90'
              )}
            />
          </button>

          {item.isGroup || !item.href || item.href === '#' ? (
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              className="min-w-0 flex-1 rounded-md px-1 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-gray-50"
            >
              {item.title}
            </button>
          ) : (
            <Link
              href={item.href}
              onClick={handleDirectLinkClick}
              title={item.title}
              className={cn(
                'min-w-0 flex-1 rounded-md px-1 py-1.5 text-sm font-medium line-clamp-2',
                active
                  ? 'text-ufac-blue'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-ufac-blue'
              )}
            >
              {item.title}
            </Link>
          )}
        </div>

        {open && (
          <div className="space-y-0.5 pb-1">
            {item.children!.map((child) => renderNestedItem(child, depth + 1))}
          </div>
        )}
      </div>
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
        {item.children!.map((child) => renderNestedItem(child, 0))}
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
