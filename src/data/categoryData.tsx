
import { CategoryDataMapType } from '@/types/edital';
import { BookOpen, Building, FileText, Globe, GraduationCap, Languages, User, Users } from 'lucide-react';

// Mock data for different categories
const categoryData: CategoryDataMapType = {
  'graduacao': {
    title: 'Graduação',
    icon: <GraduationCap strokeWidth={1} className="h-6 w-6 text-ufac-blue" />,
    editais: [
      {
        id: '1',
        title: 'SISU 2025',
        description: 'Processo Seletivo Unificado',
        color: 'bg-blue-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-blue-600" />,
        href: '/edital/prograd/sisu-2025',
        modified: '03/01/2025',
        effective: '17/02/2025',
        author: 'PROGRAD-06',
        section: 'graduacao',
        items_total: 10,
        is_folderish: true,
        '@type': 'Folder'
      },
      {
        id: '2',
        title: 'Vagas residuais',
        description: 'Processo Seletivo Vagas Residuais',
        color: 'bg-indigo-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-indigo-600" />,
        href: '/edital/vagas-residuais',
        modified: '15/01/2025',
        effective: '24/02/2025',
        author: 'PROGRAD-06',
        section: 'graduacao',
        items_total: 3,
        is_folderish: true,
        '@type': 'Folder'
      },
      {
        id: '3',
        title: 'Medicina',
        description: 'Processo Seletivo: Curso Bacharelado Medicina',
        color: 'bg-purple-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-purple-600" />,
        href: '/edital/medicina',
        modified: '10/01/2025',
        effective: '20/01/2025',
        author: 'PROGRAD-06',
        section: 'graduacao',
        items_total: 5,
        is_folderish: true,
        '@type': 'Folder'
      }
    ]
  },
  'pos-graduacao': {
    title: 'Pesquisa e Pós-graduação',
    icon: <BookOpen strokeWidth={1} className="h-6 w-6 text-ufac-blue" />,
    editais: [
      {
        id: '1',
        title: 'Mestrado em Ciência da Computação',
        description: 'Processo seletivo para o programa de pós-graduação',
        color: 'bg-green-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-green-600" />,
        href: '/edital/mestrado-computacao'
      },
      {
        id: '2',
        title: 'Bolsas PIBIC 2023',
        description: 'Edital de seleção para bolsistas de iniciação científica',
        color: 'bg-yellow-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-yellow-600" />,
        href: '/edital/pibic-2023'
      }
    ]
  },
  'extensao': {
    title: 'Extensão e Cultura',
    icon: <Globe strokeWidth={1} className="h-6 w-6 text-ufac-blue" />,
    editais: [
      {
        id: '1',
        title: 'Projetos de Extensão 2023',
        description: 'Seleção de propostas para projetos de extensão',
        color: 'bg-orange-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-orange-600" />,
        href: '/edital/extensao-2023'
      }
    ]
  },
  'estudantis': {
    title: 'Assuntos Estudantis',
    icon: <Users strokeWidth={1} className="h-6 w-6 text-ufac-blue" />,
    editais: [
      {
        id: '1',
        title: 'Auxílio Moradia',
        description: 'Edital para seleção de estudantes para auxílio moradia',
        color: 'bg-red-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-red-600" />,
        href: '/edital/auxilio-moradia'
      },
      {
        id: '2',
        title: 'Auxílio Alimentação',
        description: 'Edital para seleção de estudantes para auxílio alimentação',
        color: 'bg-pink-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-pink-600" />,
        href: '/edital/auxilio-alimentacao'
      }
    ]
  },
  'pessoas': {
    title: 'Gestão de Pessoas',
    icon: <User strokeWidth={1} className="h-6 w-6 text-ufac-blue" />,
    editais: [
      {
        id: '1',
        title: 'Concurso Docente 2023',
        description: 'Concurso público para professor efetivo',
        color: 'bg-cyan-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-cyan-600" />,
        href: '/edital/concurso-docente'
      },
      {
        id: '2',
        title: 'Processo Seletivo Simplificado',
        description: 'Seleção de professores substitutos',
        color: 'bg-teal-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-teal-600" />,
        href: '/edital/professor-substituto'
      }
    ]
  },
  'idiomas': {
    title: 'Centro de Idiomas',
    icon: <Languages strokeWidth={1} className="h-6 w-6 text-ufac-blue" />,
    editais: [
      {
        id: '1',
        title: 'Cursos de Idiomas 2023/2',
        description: 'Inscrições para cursos de idiomas do segundo semestre',
        color: 'bg-violet-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-violet-600" />,
        href: '/edital/idiomas-2023-2'
      }
    ]
  },
  'colegio': {
    title: 'Colégio de Aplicação',
    icon: <Building strokeWidth={1} className="h-6 w-6 text-ufac-blue" />,
    editais: [
      {
        id: '1',
        title: 'Vagas Remanescentes 2023',
        description: 'Processo seletivo para vagas remanescentes no CAp',
        color: 'bg-lime-50',
        icon: <FileText strokeWidth={1} className="h-8 w-8 text-lime-600" />,
        href: '/edital/cap-vagas'
      }
    ]
  }
};

export default categoryData;
