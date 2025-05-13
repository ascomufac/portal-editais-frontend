
import { SearchResult } from './types';

// Mock data with expanded results (at least 10 per section)
export const mockResults: SearchResult[] = [
  // GRADUAÇÃO (PROGRAD) - 10 items
  {
    id: 'grad-01',
    title: 'Edital PROGRAD nº 01/2023',
    description: 'Processo seletivo para monitor de disciplinas',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-01-2023-processo-seletivo-para-monitor-de-disciplinas.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-02',
    title: 'Edital PROGRAD nº 07/2023',
    description: 'Processo seletivo de transferência externa',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-07-2023-processo-seletivo-de-transferencia-externa.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-03',
    title: 'Edital PROGRAD nº 12/2023',
    description: 'Seleção de estudantes para mobilidade acadêmica nacional',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-12-2023-selecao-mobilidade-academica.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-04',
    title: 'Edital PROGRAD nº 18/2023',
    description: 'Matrícula institucional para candidatos aprovados no SISU 2023',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-18-2023-matricula-sisu-2023.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-05',
    title: 'Edital PROGRAD nº 22/2023',
    description: 'Processo seletivo para reopção de curso',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-22-2023-reopcao-de-curso.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-06',
    title: 'Edital PROGRAD nº 25/2023',
    description: 'Convocação para procedimento de heteroidentificação',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-25-2023-convocacao-heteroidentificacao.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-07',
    title: 'Edital PROGRAD nº 30/2023',
    description: 'Preenchimento de vagas residuais em cursos de graduação',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-30-2023-vagas-residuais.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-08',
    title: 'Edital PROGRAD nº 33/2023',
    description: 'Processo seletivo para ingresso nos cursos de medicina',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-33-2023-processo-medicina.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-09',
    title: 'Edital PROGRAD nº 38/2023',
    description: 'Processo seletivo especial indígena e quilombola',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-38-2023-pse-indigena-quilombola.pdf',
    section: 'graduacao'
  },
  {
    id: 'grad-10',
    title: 'Edital PROGRAD nº 42/2023',
    description: 'Processo seletivo para ingresso em cursos de licenciatura em educação do campo',
    url: 'https://www.ufac.br/editais/prograd/2023/edital-prograd-no-42-2023-licenciatura-educacao-campo.pdf',
    section: 'graduacao'
  },

  // PESQUISA E PÓS-GRADUAÇÃO (PROPEG) - 10 items
  {
    id: 'pos-01',
    title: 'Edital PROPEG nº 05/2023',
    description: 'Processo seletivo mestrado em educação',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-05-2023-processo-seletivo-mestrado-em-educacao.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-02',
    title: 'Edital PROPEG nº 11/2023',
    description: 'Seleção de projetos de iniciação científica',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-11-2023-selecao-de-projetos-de-iniciacao-cientifica.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-03',
    title: 'Edital PROPEG nº 15/2023',
    description: 'Seleção para o programa de doutorado em ciências ambientais',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-15-2023-doutorado-ciencias-ambientais.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-04',
    title: 'Edital PROPEG nº 19/2023',
    description: 'Processo seletivo mestrado em linguística',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-19-2023-mestrado-linguistica.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-05',
    title: 'Edital PROPEG nº 23/2023',
    description: 'Processo seletivo mestrado em ciência da computação',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-23-2023-mestrado-ciencia-computacao.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-06',
    title: 'Edital PROPEG nº 27/2023',
    description: 'Seleção de bolsistas para projetos de pesquisa',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-27-2023-bolsistas-pesquisa.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-07',
    title: 'Edital PROPEG nº 31/2023',
    description: 'Processo seletivo mestrado em saúde coletiva',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-31-2023-mestrado-saude-coletiva.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-08',
    title: 'Edital PROPEG nº 36/2023',
    description: 'Seleção para o programa de doutorado em biodiversidade e biotecnologia',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-36-2023-doutorado-bionorte.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-09',
    title: 'Edital PROPEG nº 39/2023',
    description: 'Processo seletivo mestrado profissional em ensino de ciências',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-39-2023-mestrado-profissional-ensino-ciencias.pdf',
    section: 'pos-graduacao'
  },
  {
    id: 'pos-10',
    title: 'Edital PROPEG nº 44/2023',
    description: 'Auxílio financeiro para participação em eventos científicos',
    url: 'https://www.ufac.br/editais/propeg/2023/edital-propeg-no-44-2023-auxilio-eventos.pdf',
    section: 'pos-graduacao'
  },

  // EXTENSÃO E CULTURA (PROEX) - 10 items
  {
    id: 'ext-01',
    title: 'Edital PROEX nº 03/2023',
    description: 'Seleção de bolsistas para projetos de extensão',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-03-2023-selecao-de-bolsistas-para-projetos-de-extensao.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-02',
    title: 'Edital PROEX nº 08/2023',
    description: 'Seleção de projetos para o programa de extensão universitária',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-08-2023-programa-extensao-universitaria.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-03',
    title: 'Edital PROEX nº 14/2023',
    description: 'Festival universitário de cultura e arte',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-14-2023-festival-cultura-arte.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-04',
    title: 'Edital PROEX nº 21/2023',
    description: 'Seleção de bolsistas para o projeto universidade aberta à comunidade',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-21-2023-universidade-aberta-comunidade.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-05',
    title: 'Edital PROEX nº 26/2023',
    description: 'Programa institucional de bolsas de extensão e cultura',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-26-2023-pibex.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-06',
    title: 'Edital PROEX nº 32/2023',
    description: 'Seleção de projetos de extensão em comunidades tradicionais',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-32-2023-projetos-comunidades-tradicionais.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-07',
    title: 'Edital PROEX nº 37/2023',
    description: 'Festival de música universitária',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-37-2023-festival-musica.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-08',
    title: 'Edital PROEX nº 41/2023',
    description: 'Programa de apoio a eventos culturais e artísticos',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-41-2023-apoio-eventos-culturais.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-09',
    title: 'Edital PROEX nº 46/2023',
    description: 'Seleção de monitores para eventos de extensão',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-46-2023-monitores-eventos.pdf',
    section: 'extensao'
  },
  {
    id: 'ext-10',
    title: 'Edital PROEX nº 49/2023',
    description: 'Programa de apoio a projetos esportivos',
    url: 'https://www.ufac.br/editais/proex/2023/edital-proex-no-49-2023-projetos-esportivos.pdf',
    section: 'extensao'
  },

  // ASSUNTOS ESTUDANTIS (PROAES) - 10 items
  {
    id: 'est-01',
    title: 'Edital PROAES nº 02/2023',
    description: 'Auxílio moradia para estudantes',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-02-2023-auxilio-moradia-para-estudantes.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-02',
    title: 'Edital PROAES nº 09/2023',
    description: 'Programa de auxílio alimentação',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-09-2023-auxilio-alimentacao.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-03',
    title: 'Edital PROAES nº 16/2023',
    description: 'Auxílio creche para estudantes com filhos',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-16-2023-auxilio-creche.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-04',
    title: 'Edital PROAES nº 24/2023',
    description: 'Programa de apoio a eventos estudantis',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-24-2023-apoio-eventos-estudantis.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-05',
    title: 'Edital PROAES nº 29/2023',
    description: 'Auxílio transporte para estudantes',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-29-2023-auxilio-transporte.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-06',
    title: 'Edital PROAES nº 34/2023',
    description: 'Programa de apoio à inclusão digital',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-34-2023-inclusao-digital.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-07',
    title: 'Edital PROAES nº 40/2023',
    description: 'Auxílio material didático',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-40-2023-material-didatico.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-08',
    title: 'Edital PROAES nº 45/2023',
    description: 'Programa de apoio psicopedagógico',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-45-2023-apoio-psicopedagogico.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-09',
    title: 'Edital PROAES nº 48/2023',
    description: 'Auxílio emergencial para estudantes em vulnerabilidade',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-48-2023-auxilio-emergencial.pdf',
    section: 'estudantis'
  },
  {
    id: 'est-10',
    title: 'Edital PROAES nº 50/2023',
    description: 'Programa de acolhimento a estudantes indígenas e quilombolas',
    url: 'https://www.ufac.br/editais/proaes/2023/edital-proaes-no-50-2023-acolhimento-indigenas-quilombolas.pdf',
    section: 'estudantis'
  },

  // GESTÃO DE PESSOAS (PRODGEP) - 10 items
  {
    id: 'pes-01',
    title: 'Edital PRODGEP nº 06/2023',
    description: 'Processo seletivo simplificado para professores substitutos',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-06-2023-processo-seletivo-simplificado-para-professores-substitutos.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-02',
    title: 'Edital PRODGEP nº 13/2023',
    description: 'Concurso público para técnicos administrativos',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-13-2023-concurso-tecnicos.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-03',
    title: 'Edital PRODGEP nº 20/2023',
    description: 'Processo seletivo para estágio não-obrigatório',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-20-2023-estagio.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-04',
    title: 'Edital PRODGEP nº 28/2023',
    description: 'Concurso público para professor efetivo',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-28-2023-concurso-professor.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-05',
    title: 'Edital PRODGEP nº 35/2023',
    description: 'Programa de qualificação de servidores',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-35-2023-qualificacao.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-06',
    title: 'Edital PRODGEP nº 43/2023',
    description: 'Processo seletivo para remoção interna',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-43-2023-remocao.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-07',
    title: 'Edital PRODGEP nº 47/2023',
    description: 'Programa de capacitação e desenvolvimento',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-47-2023-capacitacao.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-08',
    title: 'Edital PRODGEP nº 51/2023',
    description: 'Seleção para função gratificada',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-51-2023-funcao-gratificada.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-09',
    title: 'Edital PRODGEP nº 53/2023',
    description: 'Processo seletivo para redistribuição',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-53-2023-redistribuicao.pdf',
    section: 'pessoas'
  },
  {
    id: 'pes-10',
    title: 'Edital PRODGEP nº 55/2023',
    description: 'Programa de preparação para aposentadoria',
    url: 'https://www.ufac.br/editais/prodgep/2023/edital-prodgep-no-55-2023-preparacao-aposentadoria.pdf',
    section: 'pessoas'
  },

  // CENTRO DE IDIOMAS - 10 items
  {
    id: 'idi-01',
    title: 'Edital Nucli/IsF nº 01/2023',
    description: 'Oferta de cursos de idiomas',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-01-2023-oferta-de-cursos-de-idiomas.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-02',
    title: 'Edital Nucli/IsF nº 04/2023',
    description: 'Teste de proficiência em língua inglesa',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-04-2023-proficiencia-ingles.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-03',
    title: 'Edital Nucli/IsF nº 10/2023',
    description: 'Seleção de professores de línguas estrangeiras',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-10-2023-professores.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-04',
    title: 'Edital Nucli/IsF nº 17/2023',
    description: 'Curso preparatório para TOEFL',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-17-2023-toefl.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-05',
    title: 'Edital Nucli/IsF nº 25/2023',
    description: 'Programa de intercâmbio linguístico',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-25-2023-intercambio.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-06',
    title: 'Edital Nucli/IsF nº 31/2023',
    description: 'Curso de português para estrangeiros',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-31-2023-portugues-estrangeiros.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-07',
    title: 'Edital Nucli/IsF nº 38/2023',
    description: 'Teste de nivelamento em línguas estrangeiras',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-38-2023-nivelamento.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-08',
    title: 'Edital Nucli/IsF nº 42/2023',
    description: 'Curso intensivo de conversação em inglês',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-42-2023-conversacao.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-09',
    title: 'Edital Nucli/IsF nº 46/2023',
    description: 'Programa de tutoria em línguas estrangeiras',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-46-2023-tutoria.pdf',
    section: 'idiomas'
  },
  {
    id: 'idi-10',
    title: 'Edital Nucli/IsF nº 52/2023',
    description: 'Clube de conversação em línguas estrangeiras',
    url: 'https://www.ufac.br/editais/nucli-isf/2023/edital-nucli-isf-no-52-2023-clube-conversacao.pdf',
    section: 'idiomas'
  },

  // COLÉGIO DE APLICAÇÃO - 10 items
  {
    id: 'col-01',
    title: 'Edital CAp nº 04/2023',
    description: 'Processo seletivo para ingresso no Colégio de Aplicação',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-04-2023-processo-seletivo-para-ingresso-no-colegio-de-aplicacao.pdf',
    section: 'colegio'
  },
  {
    id: 'col-02',
    title: 'Edital CAp nº 07/2023',
    description: 'Processo seletivo para monitoria',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-07-2023-monitoria.pdf',
    section: 'colegio'
  },
  {
    id: 'col-03',
    title: 'Edital CAp nº 15/2023',
    description: 'Seleção para projetos de iniciação científica júnior',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-15-2023-iniciacao-cientifica.pdf',
    section: 'colegio'
  },
  {
    id: 'col-04',
    title: 'Edital CAp nº 22/2023',
    description: 'Olimpíada de matemática do CAp',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-22-2023-olimpiada-matematica.pdf',
    section: 'colegio'
  },
  {
    id: 'col-05',
    title: 'Edital CAp nº 27/2023',
    description: 'Feira de ciências e tecnologia',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-27-2023-feira-ciencias.pdf',
    section: 'colegio'
  },
  {
    id: 'col-06',
    title: 'Edital CAp nº 33/2023',
    description: 'Programa de apoio a atividades extracurriculares',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-33-2023-atividades-extracurriculares.pdf',
    section: 'colegio'
  },
  {
    id: 'col-07',
    title: 'Edital CAp nº 39/2023',
    description: 'Jogos internos do CAp',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-39-2023-jogos-internos.pdf',
    section: 'colegio'
  },
  {
    id: 'col-08',
    title: 'Edital CAp nº 44/2023',
    description: 'Festival cultural do CAp',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-44-2023-festival-cultural.pdf',
    section: 'colegio'
  },
  {
    id: 'col-09',
    title: 'Edital CAp nº 48/2023',
    description: 'Programa de reforço escolar',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-48-2023-reforco-escolar.pdf',
    section: 'colegio'
  },
  {
    id: 'col-10',
    title: 'Edital CAp nº 54/2023',
    description: 'Mostra de talentos do CAp',
    url: 'https://www.ufac.br/editais/cap/2023/edital-cap-no-54-2023-mostra-talentos.pdf',
    section: 'colegio'
  },

  // REITORIA - 10 items
  {
    id: 'rei-01',
    title: 'Resolução CONSUNI nº 09/2023',
    description: 'Regulamenta a política de inclusão e acessibilidade',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-09-2023-regulamenta-a-politica-de-inclusao-e-acessibilidade.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-02',
    title: 'Resolução CONSUNI nº 14/2023',
    description: 'Normas para afastamento de servidores',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-14-2023-afastamento.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-03',
    title: 'Resolução CONSUNI nº 19/2023',
    description: 'Política de segurança da informação',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-19-2023-seguranca-informacao.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-04',
    title: 'Resolução CONSUNI nº 23/2023',
    description: 'Regimento dos laboratórios de pesquisa',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-23-2023-laboratorios.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-05',
    title: 'Resolução CONSUNI nº 28/2023',
    description: 'Programa de internacionalização',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-28-2023-internacionalizacao.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-06',
    title: 'Resolução CONSUNI nº 32/2023',
    description: 'Política de inovação tecnológica',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-32-2023-inovacao.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-07',
    title: 'Resolução CONSUNI nº 37/2023',
    description: 'Normas para criação de empresas juniores',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-37-2023-empresas-juniores.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-08',
    title: 'Resolução CONSUNI nº 41/2023',
    description: 'Política de sustentabilidade ambiental',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-41-2023-sustentabilidade.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-09',
    title: 'Resolução CONSUNI nº 45/2023',
    description: 'Regimento do hospital universitário',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-45-2023-hospital.pdf',
    section: 'reitoria'
  },
  {
    id: 'rei-10',
    title: 'Resolução CONSUNI nº 49/2023',
    description: 'Plano de desenvolvimento institucional',
    url: 'https://www.ufac.br/resolucoes/consuni/2023/resolucao-consuni-no-49-2023-pdi.pdf',
    section: 'reitoria'
  }
];
