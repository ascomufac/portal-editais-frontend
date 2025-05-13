
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

/**
 * Interface para as propriedades do componente EditalBreadcrumb
 * @interface EditalBreadcrumbProps
 * @property {Array<{ id: string; title: string }>} breadcrumbItems - Itens da navegação estrutural
 * @property {function} navigateUp - Função para navegar um nível acima
 * @property {function} navigateToSpecificBreadcrumb - Função para navegar para um breadcrumb específico
 * @property {string} rootTitle - Título do item raiz (opcional)
 */
interface EditalBreadcrumbProps {
  breadcrumbItems: Array<{ id: string; title: string }>;
  navigateUp: () => void;
  navigateToSpecificBreadcrumb: (stepsBack: number) => void;
  rootTitle?: string;
}

/**
 * Componente de navegação estrutural (breadcrumb) para editais
 * @param {EditalBreadcrumbProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 * @description Exibe uma trilha de navegação que permite ao usuário entender
 *              sua localização na hierarquia de documentos e navegar facilmente
 *              para níveis superiores.
 */
const EditalBreadcrumb: React.FC<EditalBreadcrumbProps> = ({
  breadcrumbItems,
  navigateUp,
  navigateToSpecificBreadcrumb,
  rootTitle = "Documentos"
}) => {
  // If we have API breadcrumbs, use them directly
  const hasApiBreadcrumbs = breadcrumbItems.length > 0 && breadcrumbItems[0].id.includes('www3.ufac.br');
  
  return (
    <Breadcrumb>
      <BreadcrumbList className="overflow-x-auto py-1 no-scrollbar">
        {hasApiBreadcrumbs ? (
          // API-based breadcrumbs
          <>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.id || index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => {
                        const steps = breadcrumbItems.length - 1 - index;
                        navigateToSpecificBreadcrumb(steps);
                      }}
                    >
                      {item.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </>
        ) : (
          // Standard breadcrumb navigation
          <>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => {
                  while (breadcrumbItems.length > 0) {
                    navigateUp();
                  }
                }}
                className="flex items-center gap-1 hover:text-ufac-blue transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{rootTitle}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => {
                        // Navega para breadcrumb específico
                        const steps = breadcrumbItems.length - 1 - index;
                        navigateToSpecificBreadcrumb(steps);
                      }}
                    >
                      {item.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default EditalBreadcrumb;
