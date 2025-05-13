
# Portal de Documentos UFAC

## Informações do Projeto

Este é um portal de visualização e busca de documentos da Universidade Federal do Acre (UFAC), desenvolvido com React, TypeScript e Tailwind CSS.

## Principais Recursos

- **Visualização de PDFs**: Visualizador integrado com suporte para busca de texto, zoom, rotação e navegação por página
- **Busca por documentos**: Sistema de busca avançado com filtros por categoria e tipo
- **Navegação intuitiva**: Interface organizada por categorias (Graduação, Pós-graduação, etc.)
- **Design responsivo**: Adaptação para todos os tamanhos de tela

## Estrutura do Projeto

### Componentes principais

- **PdfViewer**: Visualizador completo de documentos PDF
- **Sidebar**: Navegação lateral com acesso às diferentes seções
- **SearchBar**: Componente de busca presente no cabeçalho
- **EditalCard**: Card para apresentação de documentos na interface

### Serviços

- **searchService**: Serviço de busca que gerencia consultas aos documentos
- **pdfUtils**: Utilitários para manipulação e visualização de PDFs

## Categorias de Documentos

O portal organiza os documentos nas seguintes categorias:

- Graduação (Prograd)
- Pesquisa e Pós-graduação (Propeg)
- Extensão e Cultura (Proex)
- Assuntos Estudantis (Proaes)
- Gestão de Pessoas (Prodgep)
- Centro de Idiomas
- Colégio de Aplicação

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Shadcn/UI (componentes)
- Framer Motion (animações)
- react-pdf (visualização de PDF)
- Lucide React (ícones)

## Documentação

O código está completamente documentado usando JSDoc, com descrições de todos os componentes, interfaces, tipos e funções. Toda a documentação está em português brasileiro para facilitar a manutenção.
