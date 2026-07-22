'use client';

import CategoryHeader from '@/components/category/CategoryHeader';
import EditalCard from '@/components/EditalCard';
import DateRangeFilter, {
	DateRangeFilterValue,
} from '@/components/filters/DateRangeFilter';
import PdfIcon from '@/components/icons/PdfIcon';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/layouts/MainLayout';
import {
	appendDateRangeParams,
	EditalResponse,
	fetchEditaisBySetor,
	setorTitles,
	toEditalHref,
	toSitePath,
} from '@/services/editalService';
import { motion } from 'framer-motion';
import {
	AlignJustify,
	ArrowDownAZ,
	ArrowUpAZ,
	CalendarArrowDown,
	CalendarArrowUp,
	CalendarDays,
	FileClock,
	FilePlus,
	FileText,
	Folder,
	Layers,
	LayoutGrid,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Função utilitária para formatar a data no formato pt-BR
 */
const formatDate = (
	dateString: string | undefined
): { date: string; hour: string } => {
	if (!dateString) return { date: '', hour: '' };
	const date = new Date(dateString);

	const dia = String(date.getDate()).padStart(2, '0');
	const mes = String(date.getMonth() + 1).padStart(2, '0');
	const ano = date.getFullYear();

	const horas = String(date.getHours()).padStart(2, '0');
	const minutos = String(date.getMinutes()).padStart(2, '0');
	const segundos = String(date.getSeconds()).padStart(2, '0');

	return {
		date: `${dia}/${mes}/${ano}`,
		hour: `${horas}:${minutos}:${segundos}`,
	};
};

const FILTER_OPTIONS = [
	{ value: 'All', label: 'Todos', icon: Layers },
	{ value: 'Folder', label: 'Pastas', icon: Folder },
	{ value: 'File', label: 'Arquivos', icon: FileText },
];

const SORT_OPTIONS = [
	{ value: 'sortable_title', label: 'Título', icon: FileText },
	{ value: 'created', label: 'Criação', icon: CalendarDays },
	{ value: 'effective', label: 'Publicação', icon: FilePlus },
	{ value: 'modified', label: 'Modificação', icon: FileClock },
];

/**
 * Página dinâmica para exibir conteúdo de qualquer setor
 * @returns {React.JSX.Element} Componente React renderizado
 */
const SetorPage: React.FC = () => {
	const params = useParams<{ setor: string; page?: string }>();
	const setor = params.setor;
	const page = params.page;
	const [categoryData, setCategoryData] = useState<EditalResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [setorTitle, setSetorTitle] = useState<string>('');
	const [limit, setLimit] = useState<number>(20);
	const [start, setStart] = useState<number>(0);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [filterType, setFilterType] = useState<'Folder' | 'File' | 'All'>(
		'Folder'
	);
	const [sortOrder, setSortOrder] = useState<
		'created' | 'modified' | 'sortable_title' | 'effective'
	>('modified');
	const [sortDirection, setSortDirection] = useState<
		'ascending' | 'descending'
	>('descending');
	const [cardLayout, setCardLayout] = useState<'card' | 'line'>('card');
	const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({
		field: 'modified',
		from: '',
		to: '',
	});

	const router = useRouter();

	// Extração do número da página da URL
	const getPageFromURL = () => Number(page ?? '1');

	const goToFirstPage = () => {
		if (setor && getPageFromURL() !== 1) {
			router.replace(`/setor/${setor}/1`);
		} else {
			setStart(0);
		}
	};

	const handleDateFilterChange = (next: DateRangeFilterValue) => {
		setDateFilter(next);
		goToFirstPage();
	};

	useEffect(() => {
		const currentPage = getPageFromURL();
		const newStart = (currentPage - 1) * limit;
		if (start !== newStart) {
			setStart(newStart);
		}
	}, [page, limit]);

	useEffect(() => {
		const currentPage = getPageFromURL();
		const newStart = (currentPage - 1) * limit;
		setStart(newStart);
		setLimit(20);
		setTotalItems(0);
		setCategoryData(null);
		setSetorTitle('');
		setError(null);
		setDateFilter({ field: 'modified', from: '', to: '' });
	}, [setor]);

	useEffect(() => {
		if (start >= 0 && !loading) {
			const timer = setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 300);

			return () => clearTimeout(timer);
		}
	}, [start, loading]);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	const formatarTituloSetor = (setorId: string): string => {
		if (!setorId) return '';
		if (setorTitles[setorId]) return setorTitles[setorId];
		return setorId
			.replace(/-|_/g, ' ')
			.split(' ')
			.map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
			.join(' ');
	};

	const tituloSetor = setorTitle || formatarTituloSetor(setor || '');

	useEffect(() => {
		const fetchData = async () => {
			if (!setor) return;
			setLoading(true);
			try {
				// Metadados do setor (título / Link)
				const meta = await fetchEditaisBySetor(setor);
				setSetorTitle(meta.title || formatarTituloSetor(setor));

				if (meta['@type'] === 'Link') {
					const remoteUrl = (meta as EditalResponse & { remoteUrl?: string }).remoteUrl;
					if (remoteUrl?.includes('www3.ufac.br')) {
						router.replace(toEditalHref(remoteUrl));
						return;
					}
					if (remoteUrl) {
						window.location.href = remoteUrl;
						return;
					}
				}

				// Documentos com texto HTML (sem listagem) → página de edital
				if (
					meta['@type'] === 'Document' &&
					(!meta.items || meta.items.length === 0) &&
					meta.text
				) {
					router.replace(toEditalHref(toSitePath(meta['@id'])));
					return;
				}

				const searchParams = new URLSearchParams();
				if (filterType !== 'All') {
					searchParams.append('portal_type', filterType);
				}

				searchParams.append('b_start', `${start}`);
				searchParams.append('b_size', `${limit}`);
				searchParams.append('sort_on', sortOrder);
				searchParams.append('sort_order', sortDirection);
				searchParams.append('metadata_fields:list', 'item_count');
				searchParams.append('metadata_fields', 'created');
				searchParams.append('metadata_fields', 'modified');
				searchParams.append('metadata_fields', 'creator');
				searchParams.append('metadata_fields', 'effective');
				searchParams.append('metadata_fields', 'items_total');

				appendDateRangeParams(
					searchParams,
					dateFilter.field,
					dateFilter.from,
					dateFilter.to
				);

				const endpoint = `${setor}/@search?${searchParams.toString()}`;
				const data = await fetchEditaisBySetor(endpoint);

				const total = data.items_total || data.batching?.total || 0;
				const items = data.items || [];

				if (items.length === 0 && total > 0) {
					const lastPage = Math.ceil(total / limit);
					const currentPage = getPageFromURL();
					if (currentPage > lastPage) {
						router.push(`/setor/${setor}/${lastPage}`);
						return;
					}

					if (currentPage < 1) {
						router.push(`/setor/${setor}/1`);
						return;
					}
				}

				setCategoryData({
					...data,
					items,
				});
				setTotalItems(total);
			} catch (err) {
				setError('Erro ao carregar os editais do setor.');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [setor, filterType, sortOrder, sortDirection, start, limit, dateFilter]);

	const handleLoadMore = () => {
		setStart((prevStart) => prevStart + limit);
	};

	return (
		<MainLayout pageTitle={tituloSetor}>
			<motion.div
				initial='hidden'
				animate='visible'
				variants={containerVariants}
				className='max-w-6xl mx-auto w-full'>
				<motion.div variants={itemVariants}>
					<CategoryHeader title={tituloSetor} itemId={setor} />

					<div className='mb-4 w-full'>
						{/* Filtros e ordenacão */}
						{/* {loading && <p>Carregando...</p>}
						{error && <p className='text-red-500'>{error}</p>} */}
						{/* <h3 className='text-xl font-medium text-gray-800 mb-4'>
							Editais disponíveis
						</h3> */}

						<div className='mb-4 mt-3 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-sm sm:flex-row sm:flex-nowrap sm:items-center sm:gap-2 sm:overflow-x-auto sm:no-scrollbar'>
							<div className='flex min-w-0 items-center gap-2 overflow-x-auto no-scrollbar'>
							<Tabs
								value={filterType}
								onValueChange={(val) => {
									if (val) {
										setFilterType(val as 'Folder' | 'File' | 'All');
										goToFirstPage();
									}
								}}>
								<TabsList
									className='h-9 shrink-0 rounded-lg bg-ufac-lightBlue/40 p-0.5'
									role='tablist'
									aria-label='Filtrar por tipo de item'>
									{FILTER_OPTIONS.map(({ value, label, icon: Icon }) => (
										<TabsTrigger
											className='h-8 gap-1.5 rounded-md px-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-ufac-blue data-[state=active]:shadow-sm'
											key={value}
											value={value}
											role='tab'
											aria-selected={filterType === value}
											aria-label={`Filtrar por ${label}`}>
											<Icon className='h-4 w-4' aria-hidden='true' />
											<span className='hidden sm:inline'>{label}</span>
										</TabsTrigger>
									))}
								</TabsList>
							</Tabs>

							<div className='flex h-9 shrink-0 items-center rounded-lg bg-ufac-lightBlue/40 p-0.5'>
								<Select
									value={sortOrder}
									onValueChange={(val) => {
										if (val)
											setSortOrder(
												val as
													| 'created'
													| 'modified'
													| 'sortable_title'
													| 'effective'
											);
									}}>
									<SelectTrigger className='h-8 w-[120px] sm:w-[138px] border-none bg-transparent px-2.5 text-sm shadow-none focus:ring-0'>
										<SelectValue placeholder='Ordenar' />
									</SelectTrigger>
									<SelectContent className='rounded-xl border-none bg-white text-ufac-blue'>
										{SORT_OPTIONS.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}
												className='h-9 rounded-lg text-sm data-[highlighted]:bg-ufac-lightBlue data-[highlighted]:text-ufac-blue'>
												<span className='flex items-center gap-2'>
													<option.icon className='h-4 w-4 text-ufac-blue' />
													{option.label}
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<button
									type='button'
									onClick={() =>
										setSortDirection((prev) =>
											prev === 'ascending' ? 'descending' : 'ascending'
										)
									}
									aria-label={`Ordenar em ordem ${
										sortDirection === 'ascending' ? 'decrescente' : 'crescente'
									}`}
									className='flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ufac-blue hover:bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ufac-blue'>
									{sortDirection === 'ascending' ? (
										sortOrder === 'sortable_title' ? (
											<>
												<ArrowDownAZ className='h-4 w-4' />
												<span className='hidden sm:inline'>Cresc.</span>
											</>
										) : (
											<>
												<CalendarArrowDown className='h-4 w-4' />
												<span className='hidden sm:inline'>Antigo</span>
											</>
										)
									) : sortOrder === 'sortable_title' ? (
										<>
											<ArrowUpAZ className='h-4 w-4' />
											<span className='hidden sm:inline'>Decresc.</span>
										</>
									) : (
										<>
											<CalendarArrowUp className='h-4 w-4' />
											<span className='hidden sm:inline'>Recente</span>
										</>
									)}
								</button>
							</div>
							</div>

							<div className='flex min-w-0 items-center gap-2 overflow-x-auto no-scrollbar sm:ml-auto'>
								<DateRangeFilter
									value={dateFilter}
									onChange={handleDateFilterChange}
									showLabel={false}
									embedded
									compact
								/>

							<button
								type='button'
								onClick={() =>
									setCardLayout((prev) => (prev === 'card' ? 'line' : 'card'))
								}
								aria-label={`Trocar para visualização em ${
									cardLayout === 'card' ? 'lista' : 'cartões'
								}`}
								title={cardLayout === 'card' ? 'Lista' : 'Cards'}
								className='ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ufac-lightBlue/40 text-ufac-blue hover:bg-ufac-lightBlue focus:outline-none focus-visible:ring-1 focus-visible:ring-ufac-blue sm:ml-0'>
								{cardLayout === 'card' ? (
									<AlignJustify className='h-4 w-4' />
								) : (
									<LayoutGrid className='h-4 w-4' />
								)}
							</button>
							</div>
						</div>

						<div
							className={`${
								cardLayout === 'card'
									? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
									: 'flex flex-col gap-4'
							}`}
							aria-live='polite'>
							{categoryData?.items
								?.filter(
									(item) => filterType === 'All' || item['@type'] === filterType
								)
								.map((editalItem) => {
									console.log({
										editalItem: `/edital/${editalItem['@id'].replace(
											'https://www3.ufac.br/',
											''
										)}`,
									});
									const { date, hour } = formatDate(editalItem.created);
									const icon =
										editalItem['@type'] === 'Folder' ? (
											<Folder className='h-6 w-6 text-ufac-blue' />
										) : (
											<PdfIcon
												size={22}
												className={'bg-transparent'}
											/>
											// <FileText className="h-6 w-6 text-ufac-blue" />
										);
									const color =
										editalItem['@type'] === 'Folder'
											? 'bg-blue-50'
											: 'bg-red-50';
									return (
										<motion.div
											key={editalItem['@id']}
											variants={itemVariants}>
											<EditalCard
												variant={cardLayout}
												title={
													editalItem.title?.trim()
														? editalItem.title
														: decodeURIComponent(
																editalItem['@id']
																	?.split('/')
																	?.pop()
																	?.replace('.pdf', '')
																	?.replace(/[-_]/g, ' ')
																	?.replace(/\b\w/g, (c) => c.toUpperCase()) ||
																	''
														  )
												}
												description={editalItem.description}
												date={date}
												hour={hour}
												icon={icon}
												color={color}
												href={`/edital/${editalItem['@id'].replace(
													'https://www3.ufac.br/',
													''
												)}`}
												state={editalItem}
											/>
										</motion.div>
									);
								})}
						</div>
					</div>

					{categoryData && categoryData.items && totalItems > 0 && (
						<nav
							aria-label='Paginação dos resultados'
							className='mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4'>
							<div className='hidden items-center gap-2 sm:flex'>
								<label
									htmlFor='itemsPerPage'
									className='text-sm text-gray-600'>
									Itens por página
								</label>
								<Select
									value={String(limit)}
									onValueChange={(val) => {
										setLimit(Number(val));
										router.push(`/setor/${setor}/1`);
									}}>
									<SelectTrigger className='w-[120px] h-10 border border-gray-300 text-sm'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{[10, 20, 30, 50, 100, 200].map((value) => (
											<SelectItem
												key={value}
												value={String(value)}>
												{value} itens
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
								<button
									aria-label='Página anterior'
									onClick={() => {
										const currentPage = getPageFromURL();
										const newPage = Math.max(1, currentPage - 1);
										router.push(`/setor/${setor}/${newPage}`);
									}}
									disabled={start === 0}
									className='h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:px-4 sm:py-2'>
									Anterior
								</button>

								<span className='px-2 text-center text-sm text-gray-700'>
									{getPageFromURL()} / {Math.ceil(totalItems / limit)}
								</span>

								<button
									aria-label='Próxima página'
									onClick={() => {
										const currentPage = getPageFromURL();
										const newPage = currentPage + 1;
										router.push(`/setor/${setor}/${newPage}`);
									}}
									disabled={start + limit >= totalItems}
									className='h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:px-4 sm:py-2'>
									Próxima
								</button>
							</div>

							<div className='hidden items-center gap-2 sm:flex'>
								<label
									htmlFor='gotoPage'
									className='text-sm text-gray-600'>
									Ir para
								</label>
								<input
									type='number'
									min={1}
									max={Math.ceil(totalItems / limit)}
									className='w-[80px] rounded-lg border border-gray-300 px-3 py-2 text-sm'
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											const val = Number((e.target as HTMLInputElement).value);
											if (
												!isNaN(val) &&
												val >= 1 &&
												val <= Math.ceil(totalItems / limit)
											) {
												router.push(`/setor/${setor}/${val}`);
											}
										}
									}}
									placeholder='Nº'
								/>
							</div>
						</nav>
					)}
				</motion.div>
			</motion.div>
		</MainLayout>
	);
};

export default SetorPage;
