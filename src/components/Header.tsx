
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';

/**
 * Interface para as propriedades do componente Header
 * @interface HeaderProps
 * @property {function} toggleSidebar - Função para alternar a visibilidade da barra lateral
 * @property {boolean} isSidebarOpen - Estado atual da barra lateral (aberta ou fechada)
 */
interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

/**
 * Componente de cabeçalho da aplicação
 * @param {HeaderProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 * @description Cabeçalho principal da aplicação que contém o botão para abrir/fechar o menu
 *              lateral em dispositivos móveis e a barra de pesquisa centralizada.
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="h-16 px-6 flex items-center bg-ufac-blue w-full z-10">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleSidebar} 
        className="mr-4 lg:hidden"
        aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        <Menu className="h-5 w-5 text-white" />
      </Button>
      
      <div className="w-full max-w-2xl mx-auto">
        <SearchBar />
      </div>
      
      <div className="flex-1" />
    </header>
  );
};

export default Header;
