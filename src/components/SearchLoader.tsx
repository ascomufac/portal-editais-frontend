
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import LoadingIcon from './icons/LoadingIcon';
import AnimatedLogoIcon from './icons/AnimatedLogoIcon';

/**
 * Interface para as propriedades do componente SearchLoader
 * @interface SearchLoaderProps
 * @property {string} [className] - Classes CSS adicionais
 * @property {number} [size] - Tamanho do ícone de carregamento
 * @property {boolean} [noResults] - Indica se não há resultados para mostrar
 * @property {function} [onAnimationComplete] - Callback para quando a animação terminar
 */
interface SearchLoaderProps {
  className?: string;
  size?: number;
  noResults?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * Componente que exibe um indicador de carregamento para buscas
 * @param {SearchLoaderProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 */
const SearchLoader: React.FC<SearchLoaderProps> = ({ 
  className,
  size = 16,
  noResults = false,
  onAnimationComplete
}) => {
  const [currentState, setCurrentState] = useState<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'>('topLeft');
  
  useEffect(() => {
    if (noResults) return;
    
    const states: ('topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight')[] = [
      'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
    ];
    
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length;
      setCurrentState(states[currentIndex]);
    }, 150); // Animação mais rápida - 300ms em vez de 500ms
    
    return () => clearInterval(interval);
  }, [noResults]);
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {noResults ? (
        <AnimatedLogoIcon size={size} animate={true} onAnimationComplete={onAnimationComplete} />
      ) : (
        <LoadingIcon state={currentState} size={size} />
      )}
    </div>
  );
};

export default SearchLoader;
