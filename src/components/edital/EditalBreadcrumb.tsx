
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from 'react';
import { Home } from 'lucide-react';

const SHORT_ALIAS = 'Documentos';

interface EditalBreadcrumbProps {
  breadcrumbItems: Array<{ id: string; title: string }>;
  navigateUp: () => void;
  navigateToSpecificBreadcrumb: (stepsBack: number) => void;
  /** Título completo do edital — no breadcrumb vira alias curto para não repetir o H1 */
  editalTitle?: string;
}

function displayTitle(title: string, editalTitle?: string) {
  if (editalTitle && title.trim() === editalTitle.trim()) {
    return SHORT_ALIAS;
  }
  return title;
}

const EditalBreadcrumb: React.FC<EditalBreadcrumbProps> = ({
  breadcrumbItems,
  navigateUp,
  navigateToSpecificBreadcrumb,
  editalTitle,
}) => {
  const hasApiBreadcrumbs =
    breadcrumbItems.length > 0 && breadcrumbItems[0].id.includes('www3.ufac.br');

  return (
    <Breadcrumb>
      <BreadcrumbList className="overflow-x-auto py-1 no-scrollbar">
        {hasApiBreadcrumbs ? (
          <>
            {breadcrumbItems.map((item, index) => {
              const label = displayTitle(item.title, editalTitle);
              const isLast = index === breadcrumbItems.length - 1;

              return (
                <React.Fragment key={item.id || index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="max-w-[12rem] truncate sm:max-w-none">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href="#"
                        className="max-w-[10rem] cursor-pointer truncate select-none sm:max-w-[14rem]"
                        title={item.title}
                        onClick={(e) => {
                          e.preventDefault();
                          const steps = breadcrumbItems.length - 1 - index;
                          navigateToSpecificBreadcrumb(steps);
                        }}
                      >
                        {label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  while (breadcrumbItems.length > 0) {
                    navigateUp();
                  }
                }}
                className="flex cursor-pointer select-none items-center gap-1 transition-colors hover:text-ufac-blue"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{SHORT_ALIAS}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbItems.map((item, index) => {
              const label = displayTitle(item.title, editalTitle);
              const isLast = index === breadcrumbItems.length - 1;

              return (
                <React.Fragment key={item.id || index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="max-w-[12rem] truncate sm:max-w-none">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href="#"
                        className="max-w-[10rem] cursor-pointer truncate select-none sm:max-w-[14rem]"
                        title={item.title}
                        onClick={(e) => {
                          e.preventDefault();
                          const steps = breadcrumbItems.length - 1 - index;
                          navigateToSpecificBreadcrumb(steps);
                        }}
                      >
                        {label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default EditalBreadcrumb;
