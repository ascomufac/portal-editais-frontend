import CategoryHeader from '@/components/category/CategoryHeader';
import EditalCard from '@/components/EditalCard';
import PdfIcon from '@/components/icons/PdfIcon';
import SearchBar from '@/components/SearchBar';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/layouts/MainLayout';
import { EditalResponse, fetchEditaisBySetor } from '@/services/editalService';
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
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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
 * @returns {JSX.Element} Componente React renderizado
 */
const SetorPage: React.FC = () => {
	const { setor, page } = useParams<{ setor: string; page?: string }>();
	const [categoryData, setCategoryData] = useState<EditalResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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

	const navigate = useNavigate();
	const location = useLocation();

	// Extração do número da página da URL
	const getPageFromURL = () => Number(page ?? '1');

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
	}, [setor]);

	useEffect(() => {
		if (start >= 0 && !loading) {
			const timer = setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 300); // após o fim do carregamento

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

	// Formatar o título do setor para exibição (primeira letra maiúscula)
	const formatarTituloSetor = (setor: string): string => {
		if (!setor) return '';

		// Remover hífens e underscores se houver
		const setorLimpo = setor.replace(/-|_/g, ' ');

		// Capitalizar primeira letra de cada palavra
		return setorLimpo
			.split(' ')
			.map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
			.join(' ');
	};

	const tituloSetor = formatarTituloSetor(setor || '');

	useEffect(() => {
		const fetchData = async () => {
			if (!setor) return;
			setLoading(true);
			try {
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

				const endpoint = `${setor}/@search?${searchParams.toString()}`;
				const data = await fetchEditaisBySetor(endpoint);

				const total = data.items_total || data.batching?.total || 0;
				const items = data.items || [];

				// Redireciona para última página válida caso a página atual não tenha itens
				if (items.length === 0 && total > 0) {
					const lastPage = Math.ceil(total / limit);
					const currentPage = getPageFromURL();
					if (currentPage > lastPage) {
						navigate(`/setor/${setor}/${lastPage}`);
						return;
					}

					if (currentPage < 1) {
						navigate(`/setor/${setor}/1`);
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
	}, [setor, filterType, sortOrder, sortDirection, start, limit]);

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
				<motion.div
					variants={itemVariants}
					className='mb-6'>
					<SearchBar />
				</motion.div>

				<motion.div variants={itemVariants}>
					<CategoryHeader title={tituloSetor} />

					<div className='mb-4 w-full'>
						{/* Filtros e ordenacão */}
						{/* {loading && <p>Carregando...</p>}
						{error && <p className='text-red-500'>{error}</p>} */}
						{/* <h3 className='text-xl font-medium text-gray-800 mb-4'>
							Editais disponíveis
						</h3> */}

						<div className='flex flex-wrap items-end my-8'>
							<div className=''>
								<label className='block text-sm font-medium text-gray-500 mb-1'>
									Filtrar por tipo de item
								</label>
								<Tabs
									defaultValue={filterType}
									onValueChange={(val) => {
										if (val) setFilterType(val as 'Folder' | 'File' | 'All');
									}}>
									<TabsList
										className='bg-white rounded-xl '
										role='tablist'
										aria-label='Filtrar por tipo de item'>
										{FILTER_OPTIONS.map(({ value, label, icon: Icon }) => (
											<TabsTrigger
												className='data-[state=active]:bg-ufac-lightBlue data-[state=active]:text-ufac-blue rounded-lg'
												key={value}
												value={value}
												role='tab'
												aria-selected={filterType === value}
												aria-label={`Filtrar por ${label}`}
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === ' ') {
														e.preventDefault();
														setFilterType(value as 'Folder' | 'File' | 'All');
													}
												}}
												onClick={(e) => {
													e.preventDefault();
													setFilterType(value as 'Folder' | 'File' | 'All');
												}}>
												<Icon
													className='h-4 w-4 mr-2'
													aria-hidden='true'
												/>
												{label}
											</TabsTrigger>
										))}
									</TabsList>
								</Tabs>
							</div>
							<Separator
								className='h-full'
								orientation={'vertical'}
							/>
							<div className='h-full m-0'>
								<label className='block font-medium text-gray-500 mb-1 text-xs'>
									Ordenar por
								</label>
								<div className='bg-white gap-1 flex items-end rounded-xl'>
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
										<SelectTrigger className='w-[180px] h-10 border-none rounded-none rounded-tl-xl rounded-bl-xl rounded-tr-0 rounded-br-0'>
											<SelectValue
												className='text-ufac-blue'
												placeholder='Ordenar por'
											/>
										</SelectTrigger>
										<SelectContent className='bg-white border-none rounded-xl text-ufac-blue'>
											{SORT_OPTIONS.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}
													className={
														'relative flex w-full  cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-ufac-lightBlue data-[highlighted]:text-ufac-blue data-[disabled]:pointer-events-none data-[disabled]:opacity-50 h-10'
													}>
													<span className='flex items-center gap-2'>
														<option.icon className='h-4 w-4 text-ufac-blue' />
														{option.label}
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<button
										onClick={() =>
											setSortDirection((prev) =>
												prev === 'ascending' ? 'descending' : 'ascending'
											)
										}
										aria-label={`Ordenar em ordem ${
											sortDirection === 'ascending'
												? 'decrescente'
												: 'crescente'
										}`}
										className='rounded-tl-0 rounded-bl-0 rounded-tr-xl rounded-br-xl
									
								px-3 focus:ring-ufac-blue-light  py-2 border-none bg-white text-ufac-blue hover:bg-ufac-lightBlue hover:text-ufac-blue text-[14px] h-10 font-medium flex items-center gap-2 focus-visible:ring-ufac-blue focus-visible:ring-2 focus-visible:ring-ring focus:outline-none focus:ring-offset-1 max-h-10'>
										{sortDirection === 'ascending' ? (
											sortOrder === 'sortable_title' ? (
												<>
													<ArrowDownAZ className='h-4 w-4' />
													Crescente
												</>
											) : (
												<>
													<CalendarArrowDown className='h-4 w-4' />
													Mais antigo
												</>
											)
										) : sortOrder === 'sortable_title' ? (
											<>
												<ArrowUpAZ className='h-4 w-4' />
												Decrescente
											</>
										) : (
											<>
												<CalendarArrowUp className='h-4 w-4' />
												Mais recente
											</>
										)}
									</button>
								</div>
							</div>

							<Separator
								className='h-full'
								orientation={'vertical'}
							/>

							<div className='h-full flex flex-col '>
								<label className='block text-sm font-medium text-gray-500 mb-1 text-xs'>
									Visualização
								</label>
								<button
									onClick={() =>
										setCardLayout((prev) => (prev === 'card' ? 'line' : 'card'))
									}
									aria-label={`Trocar para visualização em ${
										cardLayout === 'card' ? 'lista' : 'cartões'
									}`}
									className='px-3 w-50 focus:ring-ufac-blue-light  py-2 border-none h-10 bg-white text-ufac-blue hover:bg-ufac-lightBlue hover:text-ufac-blue text-[14px] font-medium flex items-center gap-2 focus-visible:ring-ufac-blue focus-visible:ring-2 rounded-xl focus-visible:ring-ring focus:outline-none focus:ring-offset-1'>
									{cardLayout === 'card' ? (
										<>
											<AlignJustify
												size={24}
												className='h-4 w-4'
											/>{' '}
											Lista
										</>
									) : (
										<>
											<LayoutGrid
												size={24}
												className='h-4 w-4'
											/>{' '}
											Cards
										</>
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
							className='flex flex-wrap justify-center mt-6 gap-4 items-center'>
							<div className='flex items-center gap-2'>
								<label
									htmlFor='itemsPerPage'
									className='text-sm text-gray-600'>
									Itens por página
								</label>
								<Select
									value={String(limit)}
									onValueChange={(val) => {
										setLimit(Number(val));
										navigate(`/setor/${setor}/1`);
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

							<button
								aria-label='Página anterior'
								onClick={() => {
									const currentPage = getPageFromURL();
									const newPage = Math.max(1, currentPage - 1);
									navigate(`/setor/${setor}/${newPage}`);
								}}
								disabled={start === 0}
								className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
								Anterior
							</button>

							<span className='px-2 py-2 text-sm text-gray-700 self-center'>
								Página {getPageFromURL()} de {Math.ceil(totalItems / limit)}
							</span>

							<div className='flex items-center gap-2'>
								<label
									htmlFor='gotoPage'
									className='text-sm text-gray-600'>
									Ir para
								</label>
								<input
									type='number'
									min={1}
									max={Math.ceil(totalItems / limit)}
									className='border border-gray-300 rounded-lg px-3 py-2 text-sm w-[80px]'
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											const val = Number((e.target as HTMLInputElement).value);
											if (
												!isNaN(val) &&
												val >= 1 &&
												val <= Math.ceil(totalItems / limit)
											) {
												navigate(`/setor/${setor}/${val}`);
											}
										}
									}}
									placeholder='Nº'
								/>
							</div>

							<button
								aria-label='Próxima página'
								onClick={() => {
									const currentPage = getPageFromURL();
									const newPage = currentPage + 1;
									navigate(`/setor/${setor}/${newPage}`);
								}}
								disabled={start + limit >= totalItems}
								className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
								Próxima
							</button>
						</nav>
					)}
				</motion.div>
			</motion.div>
		</MainLayout>
	);
};

export default SetorPage;
