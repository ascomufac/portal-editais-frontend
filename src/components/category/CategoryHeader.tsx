
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import React from 'react';

/**
 * Interface para as propriedades do componente CategoryHeader
 * @interface CategoryHeaderProps
 * @property {string} title - Título da categoria a ser exibido
 */
interface CategoryHeaderProps {
  title: string;
}

/**
 * Componente de ícone Home
 * @returns {JSX.Element} SVG do ícone Home
 * @description Renderiza o ícone da página inicial usado na navegação
 */
const HomeIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 20V12C13 11.7348 12.8946 11.4804 12.7071 11.2929C12.5196 11.1054 12.2652 11 12 11H8C7.73478 11 7.48043 11.1054 7.29289 11.2929C7.10536 11.4804 7 11.7348 7 12V20" fill="#DCE2FF"/>
    <path d="M1 9C0.99993 8.70907 1.06333 8.42162 1.18579 8.15771C1.30824 7.89381 1.4868 7.65979 1.709 7.472L8.709 1.473C9.06999 1.16791 9.52736 1.00052 10 1.00052C10.4726 1.00052 10.93 1.16791 11.291 1.473L18.291 7.472C18.5132 7.65979 18.6918 7.89381 18.8142 8.15771C18.9367 8.42162 19.0001 8.70907 19 9V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H3C2.46957 20 1.96086 19.7893 1.58579 19.4142C1.21071 19.0391 1 18.5304 1 18V9Z" fill="#DCE2FF"/>
    <path d="M13 20V12C13 11.7348 12.8946 11.4804 12.7071 11.2929C12.5196 11.1054 12.2652 11 12 11H8C7.73478 11 7.48043 11.1054 7.29289 11.2929C7.10536 11.4804 7 11.7348 7 12V20M1 9C0.99993 8.70907 1.06333 8.42162 1.18579 8.15771C1.30824 7.89381 1.4868 7.65979 1.709 7.472L8.709 1.473C9.06999 1.16791 9.52736 1.00052 10 1.00052C10.4726 1.00052 10.93 1.16791 11.291 1.473L18.291 7.472C18.5132 7.65979 18.6918 7.89381 18.8142 8.15771C18.9367 8.42162 19.0001 8.70907 19 9V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H3C2.46957 20 1.96086 19.7893 1.58579 19.4142C1.21071 19.0391 1 18.5304 1 18V9Z" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Pró-reitorias
 * @returns {JSX.Element} SVG do ícone de Pró-reitorias
 * @description Renderiza o ícone representando as pró-reitorias
 */
const ProReitoriasIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 1L19.8889 6H2.11111L11 1Z" fill="#DCE2FF"/>
    <path d="M1 21H21M4.33333 17V10M8.77778 17V10M13.2222 17V10M17.6667 17V10M11 1L19.8889 6H2.11111L11 1Z" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Graduação
 * @returns {JSX.Element} SVG do ícone de Graduação
 * @description Renderiza o ícone representando a graduação
 */
const GraduacaoIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.4188 6.92236C20.5978 6.84338 20.7498 6.71363 20.8558 6.54916C20.9618 6.3847 21.0172 6.19275 21.0151 5.99709C21.0131 5.80144 20.9537 5.61068 20.8444 5.44844C20.735 5.2862 20.5804 5.15961 20.3998 5.08436L11.8288 1.18036C11.5683 1.06151 11.2852 1 10.9988 1C10.7124 1 10.4294 1.06151 10.1688 1.18036L1.59882 5.08036C1.42079 5.15833 1.26934 5.28649 1.16299 5.44917C1.05664 5.61185 1 5.802 1 5.99636C1 6.19072 1.05664 6.38086 1.16299 6.54354C1.26934 6.70622 1.42079 6.83438 1.59882 6.91236L10.1688 10.8204C10.4294 10.9392 10.7124 11.0007 10.9988 11.0007C11.2852 11.0007 11.5683 10.9392 11.8288 10.8204L20.4188 6.92236Z" fill="#DCE2FF"/>
    <path d="M20.9988 6.00036V12.0004V6.00036Z" fill="#DCE2FF"/>
    <path d="M4.99882 8.50036V12.0004C4.99882 12.796 5.63096 13.5591 6.75618 14.1217C7.8814 14.6843 9.40752 15.0004 10.9988 15.0004C12.5901 15.0004 14.1162 14.6843 15.2415 14.1217C16.3667 13.5591 16.9988 12.796 16.9988 12.0004V8.50036" fill="#DCE2FF"/>
    <path d="M20.9988 6.00036V12.0004M4.99882 8.50036V12.0004C4.99882 12.796 5.63096 13.5591 6.75618 14.1217C7.8814 14.6843 9.40752 15.0004 10.9988 15.0004C12.5901 15.0004 14.1162 14.6843 15.2415 14.1217C16.3667 13.5591 16.9988 12.796 16.9988 12.0004V8.50036M20.4188 6.92236C20.5978 6.84338 20.7498 6.71363 20.8558 6.54916C20.9617 6.3847 21.0172 6.19275 21.0151 5.99709C21.0131 5.80144 20.9537 5.61068 20.8444 5.44844C20.735 5.2862 20.5804 5.15961 20.3998 5.08436L11.8288 1.18036C11.5683 1.06151 11.2852 1 10.9988 1C10.7124 1 10.4294 1.06151 10.1688 1.18036L1.59882 5.08036C1.42079 5.15833 1.26934 5.28649 1.16299 5.44917C1.05664 5.61185 1 5.802 1 5.99636C1 6.19072 1.05664 6.38086 1.16299 6.54354C1.26934 6.70622 1.42079 6.83438 1.59882 6.91236L10.1688 10.8204C10.4294 10.9392 10.7124 11.0007 10.9988 11.0007C11.2852 11.0007 11.5683 10.9392 11.8288 10.8204L20.4188 6.92236Z" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Pesquisa
 * @returns {JSX.Element} SVG do ícone de Pesquisa
 * @description Renderiza o ícone representando pesquisa e pós-graduação
 */
const PesquisaIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 17H12H4Z" fill="#DCE2FF"/>
    <path d="M1 21H19H1Z" fill="#DCE2FF"/>
    <path d="M7 13H9H7Z" fill="#DCE2FF"/>
    <path d="M7 11C6.46957 11 5.96086 10.7893 5.58579 10.4142C5.21071 10.0391 5 9.53043 5 9V5H11V9C11 9.53043 10.7893 10.0391 10.4142 10.4142C10.0391 10.7893 9.53043 11 9 11H7Z" fill="#DCE2FF"/>
    <path d="M10 5V2C10 1.73478 9.89464 1.48043 9.70711 1.29289C9.51957 1.10536 9.26522 1 9 1H7C6.73478 1 6.48043 1.10536 6.29289 1.29289C6.10536 1.48043 6 1.73478 6 2V5" fill="#DCE2FF"/>
    <path d="M4 17H12M1 21H19M12 21C13.8565 21 15.637 20.2625 16.9497 18.9497C18.2625 17.637 19 15.8565 19 14C19 12.1435 18.2625 10.363 16.9497 9.05025C15.637 7.7375 13.8565 7 12 7H11M7 13H9M10 5V2C10 1.73478 9.89464 1.48043 9.70711 1.29289C9.51957 1.10536 9.26522 1 9 1H7C6.73478 1 6.48043 1.10536 6.29289 1.29289C6.10536 1.48043 6 1.73478 6 2V5M7 11C6.46957 11 5.96086 10.7893 5.58579 10.4142C5.21071 10.0391 5 9.53043 5 9V5H11V9C11 9.53043 10.7893 10.0391 10.4142 10.4142C10.0391 10.7893 9.53043 11 9 11H7Z" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Extensão
 * @returns {JSX.Element} SVG do ícone de Extensão
 * @description Renderiza o ícone representando extensão e cultura
 */
const ExtensaoIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" fill="#DCE2FF"/>
    <path d="M11 1C8.43223 3.69615 7 7.27674 7 11C7 14.7233 8.43223 18.3038 11 21C13.5678 18.3038 15 14.7233 15 11C15 7.27674 13.5678 3.69615 11 1Z" fill="#DCE2FF"/>
    <path d="M1 11H21H1Z" fill="#DCE2FF"/>
    <path d="M21 11C21 16.5228 16.5228 21 11 21M21 11C21 5.47715 16.5228 1 11 1M21 11H1M11 21C5.47715 21 1 16.5228 1 11M11 21C8.43223 18.3038 7 14.7233 7 11C7 7.27674 8.43223 3.69615 11 1M11 21C13.5678 18.3038 15 14.7233 15 11C15 7.27674 13.5678 3.69615 11 1M1 11C1 5.47715 5.47715 1 11 1" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Assuntos Estudantis
 * @returns {JSX.Element} SVG do ícone de Assuntos Estudantis
 * @description Renderiza o ícone representando assuntos estudantis
 */
const AssuntosEstudantisIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 21V19C15 17.9391 14.5786 16.9217 13.8284 16.1716C13.0783 15.4214 12.0609 15 11 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.5905 5.23015C14.7157 5.17374 14.8219 5.08106 14.8961 4.96359C14.9702 4.84611 15.009 4.70901 15.0076 4.56926C15.0061 4.42951 14.9646 4.29326 14.8881 4.17738C14.8116 4.06149 14.7035 3.97108 14.5772 3.91732L8.58202 1.12882C8.39976 1.04393 8.20178 1 8.00146 1C7.80114 1 7.60316 1.04393 7.4209 1.12882L1.42646 3.91447C1.30193 3.97016 1.19599 4.0617 1.1216 4.1779C1.04722 4.2941 1.0076 4.42991 1.0076 4.56874C1.0076 4.70756 1.04722 4.84337 1.1216 4.95957C1.19599 5.07577 1.30193 5.16731 1.42646 5.223L7.4209 8.01436C7.60316 8.09925 7.80114 8.14319 8.00146 8.14319C8.20178 8.14319 8.39976 8.09925 8.58202 8.01436L14.5905 5.23015Z" fill="#DCE2FF"/>
    <path d="M14.9961 4.57159V8.8572V4.57159Z" fill="#DCE2FF"/>
    <path d="M3.80465 6.35726V9.8572C3.80465 10.4255 4.24681 10.9705 5.03387 11.3724C5.82092 11.7742 6.8884 12 8.00146 12C9.11452 12 10.182 11.7742 10.9691 11.3724C11.7561 10.9705 12.1983 10.4255 12.1983 9.8572V6.35726" fill="#DCE2FF"/>
    <path d="M14.9961 4.57159V8.8572M3.80465 6.35726V9.8572C3.80465 10.4255 4.24681 10.9705 5.03387 11.3724C5.82092 11.7742 6.8884 12 8.00146 12C9.11452 12 10.182 11.7742 10.9691 11.3724C11.7561 10.9705 12.1983 10.4255 12.1983 9.8572V6.35726M14.5905 5.23015C14.7157 5.17374 14.8219 5.08106 14.8961 4.96359C14.9702 4.84611 15.009 4.70901 15.0076 4.56926C15.0061 4.42951 14.9646 4.29326 14.8881 4.17738C14.8116 4.06149 14.7035 3.97108 14.5772 3.91732L8.58202 1.12882C8.39976 1.04393 8.20178 1 8.00146 1C7.80114 1 7.60316 1.04393 7.4209 1.12882L1.42646 3.91447C1.30193 3.97016 1.19599 4.0617 1.1216 4.1779C1.04722 4.2941 1.0076 4.42991 1.0076 4.56874C1.0076 4.70756 1.04722 4.84337 1.1216 4.95957C1.19599 5.07577 1.30193 5.16731 1.42646 5.223L7.4209 8.01436C7.60316 8.09925 7.80114 8.14319 8.00146 8.14319C8.20178 8.14319 8.39976 8.09925 8.58202 8.01436L14.5905 5.23015Z" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Gestão de Pessoas
 * @returns {JSX.Element} SVG do ícone de Gestão de Pessoas
 * @description Renderiza o ícone representando gestão de pessoas
 */
const GestaoPessoasIcon = () => (
  <svg width="100%" height="100%"viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 1V3V1Z" fill="#DCE2FF"/>
    <path d="M5 21V19C5 18.4696 5.21071 17.9609 5.58579 17.5858C5.96086 17.2107 6.46957 17 7 17H13C13.5304 17 14.0391 17.2107 14.4142 17.5858C14.7893 17.9609 15 18.4696 15 19V21" fill="#DCE2FF"/>
    <path d="M6 1V3V1Z" fill="#DCE2FF"/>
    <path d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z" fill="#DCE2FF"/>
    <path d="M17 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z" fill="#DCE2FF"/>
    <path d="M14 1V3M5 21V19C5 18.4696 5.21071 17.9609 5.58579 17.5858C5.96086 17.2107 6.46957 17 7 17H13C13.5304 17 14.0391 17.2107 14.4142 17.5858C14.7893 17.9609 15 18.4696 15 19V21M6 1V3M13 10C13 11.6569 11.6569 13 10 13C8.34315 13 7 11.6569 7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10ZM3 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3Z" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Centro de Idiomas
 * @returns {JSX.Element} SVG do ícone de Centro de Idiomas
 * @description Renderiza o ícone representando o centro de idiomas
 */
const CentroIdiomasIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7L10 13L4 7Z" fill="#DCE2FF"/>
    <path d="M3 13L9 7L11 4" fill="#DCE2FF"/>
    <path d="M1 4H13H1Z" fill="#DCE2FF"/>
    <path d="M6 1H7H6Z" fill="#DCE2FF"/>
    <path d="M21 21L16 11L11 21" fill="#DCE2FF"/>
    <path d="M13 17H19H13Z" fill="#DCE2FF"/>
    <path d="M4 7L10 13M3 13L9 7L11 4M1 4H13M6 1H7M21 21L16 11L11 21M13 17H19" stroke="#4769FF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

/**
 * Componente de ícone Colégio de Aplicação
 * @returns {JSX.Element} SVG do ícone do Colégio de Aplicação
 * @description Renderiza o ícone representando o colégio de aplicação
 */
const ColegioAplicacaoIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 69 39" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 20.2771V19.8295C0 11.7822 5.26426 6.52546 12.1511 6.52546C16.2635 6.52546 19.069 8.1275 21.1995 10.6247L16.8642 15.2086C15.7432 13.8689 14.3219 12.7392 12.2657 12.7392C9.20007 12.7392 6.92095 15.4617 6.92095 19.8974V20.0456C6.92095 24.7035 9.23723 27.2748 12.2657 27.2748C14.5108 27.2748 15.8547 26.0833 17.0531 24.7035L21.3141 29.025C19.1836 31.6333 16.2666 33.4947 11.891 33.4947C5.19613 33.507 0 28.4015 0 20.2771Z" fill="#4769FF"/>
  <path d="M31.0684 6.82487H37.881L47.1182 33.0625H40.0424L38.4941 28.3644H30.2819L28.7893 33.0625H21.8714L31.0684 6.82487ZM36.8126 22.9996L34.3849 15.3598L31.954 22.9996H36.8126Z" fill="#4769FF"/>
  <path d="M48.8275 12.8997H55.4079V15.471C56.6032 13.8689 58.0988 12.4891 60.7898 12.4891C64.8154 12.4891 68.3425 15.8445 68.3425 22.5891V23.2589C68.3425 30.1177 64.8649 33.47 60.7898 33.47C58.0988 33.47 56.566 32.1303 55.4079 30.6394V38.6928H48.8275V12.8997ZM61.8736 23.2219V22.7372C61.8736 19.9437 60.4925 18.0793 58.585 18.0793C56.6775 18.0793 55.2933 19.9314 55.2933 22.7372V23.2219C55.2933 26.0185 56.6775 27.8798 58.585 27.8798C60.4925 27.8798 61.8736 26.0185 61.8736 23.2219Z" fill="#4769FF"/>
  <path d="M65.5183 4.62091H49.8556V9.39308H65.5183V4.62091Z" fill="#4769FF"/>
  <path d="M67.5157 0H47.8552V2.84293H67.5157V0Z" fill="#4769FF"/>
  </svg>
);

/**
 * Mapa para obter abreviações e nomes completos para cada pró-reitoria
 * @type {Record<string, { abbreviation: string, fullName: string }>}
 * @description Associa cada título de pró-reitoria a sua abreviação e nome completo
 */
const proReitoriaMap: Record<string, { abbreviation: string, fullName: string }> = {
  'Graduação': { 
    abbreviation: 'Prograd', 
    fullName: 'Pró-reitoria de Graduação'
  },
  'Pesquisa e Pós-graduação': { 
    abbreviation: 'Propeg', 
    fullName: 'Pró-reitoria de Pesquisa e Pós-graduação'
  },
  'Extensão e Cultura': { 
    abbreviation: 'Proex', 
    fullName: 'Pró-reitoria de Extensão e Cultura'
  },
  'Assuntos Estudantis': { 
    abbreviation: 'Proaes', 
    fullName: 'Pró-reitoria de Assuntos Estudantis'
  },
  'Gestão de Pessoas': { 
    abbreviation: 'Prodgep', 
    fullName: 'Pró-reitoria de Gestão de Pessoas'
  },
};

/**
 * Função para obter o ícone apropriado com base no título da categoria
 * @param {string} title - Título da categoria
 * @returns {JSX.Element} Ícone correspondente à categoria
 * @description Seleciona o componente de ícone apropriado com base no título fornecido
 */
const getCategoryIcon = (title: string) => {
  switch(title) {
    case 'Pró-reitorias':
      return <ProReitoriasIcon />;
    case 'Graduação':
      return <GraduacaoIcon />;
    case 'Pesquisa e Pós-graduação':
      return <PesquisaIcon />;
    case 'Extensão e Cultura':
      return <ExtensaoIcon />;
    case 'Assuntos Estudantis':
      return <AssuntosEstudantisIcon />;
    case 'Gestão de Pessoas':
      return <GestaoPessoasIcon />;
    case 'Centro de Idiomas':
      return <CentroIdiomasIcon />;
    case 'Colégio de Aplicação':
      return <ColegioAplicacaoIcon />;
    default:
      return <HomeIcon />;
  }
};

/**
 * Componente de cabeçalho para categorias
 * @param {CategoryHeaderProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 * @description Exibe o cabeçalho da categoria com ícone e título adequados,
 *              incluindo abreviação para pró-reitorias.
 */
const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title }) => {
  const icon = getCategoryIcon(title);
  const isProReitoria = title in proReitoriaMap;
  
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      className="mb-4"
    >
      <div className="flex items-center py-4">
        <div className="mr-4 p-3 bg-ufac-lightBlue rounded-full min-h-[56px] min-w-[56px] max-h-[56px] max-w-[56px] flex items-center justify-center">{icon}</div>
        <div>
          {isProReitoria ? (
            <>
              <h1 className="text-2xl font-black text-ufac-blue">{proReitoriaMap[title].abbreviation}</h1>
              <p className="text-xs text-gray-600 font-semibold">{proReitoriaMap[title].fullName}</p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-ufac-blue">{title}</h1>
          )}
        </div>
      </div>
      <Separator className="bg-gray-200 h-0.5" />
    </motion.div>
  );
};

export default CategoryHeader;
