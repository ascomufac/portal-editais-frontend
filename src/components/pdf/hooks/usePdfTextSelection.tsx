
import { useEffect } from 'react';
import { highlightSearchTermInText } from '../utils/searchUtils';

/**
 * Hook para gerenciar a seleção de texto e estilos no PDF
 * @param {string} searchTerm - Termo de busca para destacar, se houver
 * @param {boolean} enableTextLayer - Se a camada de texto deve ser habilitada
 * @description Gerencia o comportamento de seleção de texto, destacando termos de busca
 *              e aplicando estilos CSS para melhorar a interação com o texto no PDF.
 */
export function usePdfTextSelection(searchTerm: string = '', enableTextLayer: boolean = true) {
  // Aplica estilo CSS para destacar termos de busca
  useEffect(() => {
    if (!searchTerm || !enableTextLayer) return;
    
    /**
     * Função para aplicar destaque preciso no nível de palavra
     * @description Localiza e destaca todas as ocorrências do termo de busca no texto do PDF
     */
    const applyPreciseHighlighting = () => {
      console.log('Aplicando destaque preciso para:', searchTerm);
      
      // Limpa os invólucros de destaque existentes
      document.querySelectorAll('.pdf-search-highlight-wrapper').forEach(el => {
        el.remove();
      });
      
      const textElements = document.querySelectorAll('.react-pdf__Page__textContent span');
      console.log(`Encontrados ${textElements.length} elementos de texto para destacar`);
      
      const searchLower = searchTerm.toLowerCase();
      let highlightCount = 0;
      
      textElements.forEach((element) => {
        const text = element.textContent || '';
        
        if (text.toLowerCase().includes(searchLower)) {
          highlightCount++;
          // Gera HTML com termos de busca destacados
          const htmlContent = highlightSearchTermInText(text, searchTerm);
          
          // Só aplica se tivermos uma correspondência
          if (htmlContent !== text) {
            // Cria um invólucro para manter a posição
            const wrapper = document.createElement('span');
            wrapper.className = 'pdf-search-highlight-wrapper';
            wrapper.style.position = 'absolute';
            wrapper.style.left = (element as HTMLElement).style.left;
            wrapper.style.top = (element as HTMLElement).style.top;
            wrapper.style.fontSize = (element as HTMLElement).style.fontSize;
            wrapper.style.fontFamily = (element as HTMLElement).style.fontFamily;
            wrapper.style.transform = (element as HTMLElement).style.transform;
            wrapper.style.transformOrigin = (element as HTMLElement).style.transformOrigin;
            wrapper.style.pointerEvents = 'none';
            wrapper.style.zIndex = '10';
            wrapper.innerHTML = htmlContent;
            
            // Adiciona a versão destacada
            element.parentNode?.appendChild(wrapper);
          }
        }
      });
      
      console.log(`Destaque aplicado a ${highlightCount} elementos`);
    };
    
    // Define um tempo limite para garantir que o PDF seja renderizado
    const highlightTimer = setTimeout(applyPreciseHighlighting, 500);
    
    /**
     * Manipulador de evento para camada de texto renderizada
     * @description Aplica destaque quando a camada de texto termina de renderizar
     */
    const handleTextLayerRendered = () => {
      console.log('Evento de camada de texto renderizada acionado');
      applyPreciseHighlighting();
    };
    
    document.addEventListener('textlayerrendered', handleTextLayerRendered);
    
    return () => {
      clearTimeout(highlightTimer);
      document.removeEventListener('textlayerrendered', handleTextLayerRendered);
      // Limpa quaisquer invólucros de destaque ao desmontar ou mudar o termo de busca
      document.querySelectorAll('.pdf-search-highlight-wrapper').forEach(el => {
        el.remove();
      });
    };
  }, [searchTerm, enableTextLayer]);

  // Injeta CSS para melhorar a seleção de texto
  useEffect(() => {
    const styleId = 'pdf-text-selection-style';
    let style = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    
    // CSS para garantir alinhamento preciso da camada de texto com o conteúdo visual
    const selectionCss = `
      .react-pdf__Page {
        position: relative !important;
      }
      
      .react-pdf__Page__textContent {
        display: flex !important;
        flex-direction: column !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        cursor: text !important;
        pointer-events: auto !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 2 !important;
        line-height: initial !important;
        opacity: 0.2 !important;
      }
      
      .react-pdf__Page__textContent span {
        color: transparent !important;
        position: absolute !important;
        white-space: pre !important;
        cursor: text !important;
        transform-origin: 0% 0% !important;
      }
      
      .react-pdf__Page__textContent::selection,
      .react-pdf__Page__textContent *::selection {
        background-color: rgba(0, 0, 255, 0.3) !important;
      }
      
      .react-pdf__Page__annotations {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
      }
      
      .pdf-search-highlight-wrapper {
        z-index: 5 !important;
      }
    `;
    
    style.textContent = selectionCss;
    
    return () => {
      if (style && style.parentNode) {
        style.textContent = '';
      }
    };
  }, []);

  // Hook para ajustar a largura do contêiner para evitar quebras de página
  useEffect(() => {
    /**
     * Atualiza a largura da página para evitar quebras
     * @description Ajusta a largura máxima das páginas com base no tamanho do contêiner
     */
    const updatePageWidth = () => {
      const containerWidth = document.querySelector('.react-pdf__Document')?.clientWidth;
      if (containerWidth) {
        const pageWidth = containerWidth - 40; // 20px de preenchimento em ambos os lados
        document.documentElement.style.setProperty('--pdf-page-max-width', `${pageWidth}px`);
      }
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    
    return () => {
      window.removeEventListener('resize', updatePageWidth);
    };
  }, []);
}
