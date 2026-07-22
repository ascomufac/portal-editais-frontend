import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { isPdf } from '@/services/search/utils';
import { EditalDocumentType } from '@/types/edital';
import { motion } from 'framer-motion';
import {
	Calendar,
	ChevronRight,
	Clock,
	Download,
	Eye,
	FileText,
	Folder,
	Undo,
	UserCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileTypeIcon, {
	FILE_KIND_STYLES,
	getFileKind,
} from '../icons/FileTypeIcon';
import EditalBreadcrumb from './EditalBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import EditalFolderSkeleton from './EditalFolderSkeleton';
import EditalHeaderSkeleton from './EditalHeaderSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EditalFolderNavigatorProps {
	documents: EditalDocumentType[];
	currentFolder: string | null;
	breadcrumbItems: Array<{ id: string; title: string }>;
	navigateToFolder: (folderId: string, folderTitle: string) => void;
	navigateUp: (folderId?: string) => void;
	navigateToSpecificBreadcrumb: (stepsBack: number) => void;
	getCurrentFolderContents: () => EditalDocumentType[];
	editalTitle?: string;
	isLoading?: boolean;
}

interface SortOptions {
	field: 'title' | 'modified' | 'created' | 'Creator';
	direction: 'asc' | 'desc';
}

const EditalFolderNavigator: React.FC<EditalFolderNavigatorProps> = ({
	currentFolder,
	breadcrumbItems,
	navigateToFolder,
	navigateUp,
	navigateToSpecificBreadcrumb,
	getCurrentFolderContents,
	editalTitle,
	isLoading = false,
}) => {
	const isMobile = useIsMobile();
	const navigate = useNavigate();
	const { toast } = useToast();
	const currentItems = getCurrentFolderContents();

	const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'folder' | 'file'>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortOptions, setSortOptions] = useState<SortOptions>({
		field: 'modified',
		direction: 'desc',
	});

	const isFolderItem = (item: EditalDocumentType) =>
		Boolean(
			item.isFolder ||
				item.is_folderish ||
				item['@type'] === 'Folder' ||
				item['@type'] === 'Collection'
		);

	const searchableItems = useMemo(() => {
		if (!searchQuery.trim()) return currentItems;
		const query = searchQuery.toLowerCase();
		return currentItems.filter(
			(item) =>
				item.title.toLowerCase().includes(query) ||
				(item.description && item.description.toLowerCase().includes(query))
		);
	}, [currentItems, searchQuery]);

	const typeCounts = useMemo(() => {
		const folders = searchableItems.filter(isFolderItem).length;
		const files = searchableItems.length - folders;
		return {
			all: searchableItems.length,
			folder: folders,
			file: files,
		};
	}, [searchableItems]);

	const documentVariants = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
	};

	const processedItems = useMemo(() => {
		let filtered = [...searchableItems];

		if (itemTypeFilter !== 'all') {
			filtered = filtered.filter((item) =>
				itemTypeFilter === 'folder' ? isFolderItem(item) : !isFolderItem(item)
			);
		}

		filtered.sort((a, b) => {
			const valueA = a[sortOptions.field] || '';
			const valueB = b[sortOptions.field] || '';

			if (sortOptions.field === 'title') {
				return sortOptions.direction === 'asc'
					? valueA.localeCompare(valueB)
					: valueB.localeCompare(valueA);
			}

			const dateA = new Date(valueA).getTime();
			const dateB = new Date(valueB).getTime();
			return sortOptions.direction === 'asc' ? dateA - dateB : dateB - dateA;
		});

		return filtered.sort((a, b) => {
			if (isFolderItem(a) && !isFolderItem(b)) return -1;
			if (!isFolderItem(a) && isFolderItem(b)) return 1;
			return 0;
		});
	}, [searchableItems, itemTypeFilter, sortOptions]);

	const handleOpenItem = (item: EditalDocumentType) => {
		if (isFolderItem(item)) {
			navigateToFolder(item['@id'] || item.url, item.title);
			return;
		}

		const fileUrl = item.url || item['@id'] || '';
		if (isPdf(fileUrl) || isPdf(item['@id'] || '')) {
			handleViewPdf(fileUrl);
			return;
		}

		// Links e outros arquivos: abrir no destino
		if (fileUrl) {
			window.open(fileUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const toggleSort = (field: SortOptions['field']) => {
		setSortOptions(prev => ({
			field,
			direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
		}));
	};

	const handleViewPdf = (url: string) => {
		const encodedUrl = encodeURIComponent(url);
		navigate(`/visualizar-pdf/${encodedUrl}`);
	};

	const copyDownloadLink = (url: string) => {
		navigator.clipboard.writeText(url).then(
			() => {
				toast({
					title: "Link copiado!",
					description: "O link para download foi copiado para a área de transferência.",
					duration: 3000,
				});
			},
			() => {
				toast({
					title: "Erro ao copiar",
					description: "Não foi possível copiar o link. Tente novamente.",
					variant: "destructive",
					duration: 3000,
				});
			}
		);
	};

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return '';
		try {
			return new Intl.DateTimeFormat('pt-BR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			}).format(new Date(dateString));
		} catch (e) {
			console.error("Error formatting date:", e);
			return dateString;
		}
	};

	if (isLoading) {
		return (
			<div className='w-full'>
				<EditalHeaderSkeleton />
				<EditalFolderSkeleton />
			</div>
		);
	}

	return (
		<div className='w-full'>
			<div className='mb-6'>
				<div className='flex items-center mb-4'>
					{currentFolder && (
						<Button
							variant='outline'
							size='sm'
							onClick={() => navigateUp()}
							className='mr-3 rounded-full h-10 w-10 p-0'>
							<Undo className='h-4 w-4' />
						</Button>
					)}

					<div className='flex-grow overflow-hidden'>
						<EditalBreadcrumb
							breadcrumbItems={breadcrumbItems}
							navigateUp={navigateUp}
							navigateToSpecificBreadcrumb={navigateToSpecificBreadcrumb}
							rootTitle={editalTitle || "Documentos"}
						/>
					</div>
				</div>
			</div>

			<div className='flex flex-col md:flex-row md:items-center gap-4 mb-5'>
				<div className='flex-1'>
					<Input
						placeholder="Buscar documentos..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full"
					/>
				</div>
				<div className='flex gap-2 items-center'>
					<span className='text-sm text-gray-500'>Filtrar por:</span>
					<Tabs value={itemTypeFilter} onValueChange={(v) => setItemTypeFilter(v as 'all' | 'folder' | 'file')}>
						<TabsList className='bg-white rounded-xl h-auto p-1 gap-0.5'>
							<TabsTrigger
								value="all"
								className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 data-[state=active]:bg-ufac-lightBlue data-[state=active]:text-ufac-blue'
							>
								<FileText className='h-3.5 w-3.5' />
								<span>Todos</span>
								<span
									className={cn(
										'ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums',
										itemTypeFilter === 'all'
											? 'bg-ufac-blue text-white'
											: 'bg-slate-100 text-slate-600'
									)}
								>
									{typeCounts.all}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="folder"
								className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 data-[state=active]:bg-ufac-lightBlue data-[state=active]:text-ufac-blue'
							>
								<Folder className='h-3.5 w-3.5' />
								<span>Pastas</span>
								<span
									className={cn(
										'ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums',
										itemTypeFilter === 'folder'
											? 'bg-ufac-blue text-white'
											: 'bg-slate-100 text-slate-600'
									)}
								>
									{typeCounts.folder}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="file"
								className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 data-[state=active]:bg-ufac-lightBlue data-[state=active]:text-ufac-blue'
							>
								<FileText className='h-3.5 w-3.5' />
								<span>Arquivos</span>
								<span
									className={cn(
										'ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums',
										itemTypeFilter === 'file'
											? 'bg-ufac-blue text-white'
											: 'bg-slate-100 text-slate-600'
									)}
								>
									{typeCounts.file}
								</span>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{isMobile ? (
				<div className='space-y-3'>
					{processedItems.length > 0 ? (
						<>
							{processedItems.map((item) => (
								<motion.div
									key={item.id}
									variants={documentVariants}
									initial='initial'
									animate='animate'
									exit='exit'
									transition={{ duration: 0.2 }}>
									{isFolderItem(item) ? (
										<Card className='mb-3 border border-gray-100 shadow-sm'>
											<CardContent className='p-0'>
												<button
													type='button'
													className='flex items-center p-4 cursor-pointer w-full text-left'
													onClick={() => handleOpenItem(item)}
												>
													<Folder className='h-5 w-5 mr-3 text-blue-500' />
													<div className='flex-grow'>
														<div className='font-medium text-blue-600'>
															{item.title}
														</div>
														<div className='text-xs text-gray-500 flex items-center gap-2'>
															<UserCircle className='h-3 w-3' /> {item.Creator || item.author} 
															<span className='mx-1'>•</span> 
															<Calendar className='h-3 w-3' /> {formatDate(item.modified)}
														</div>
													</div>
													<ChevronRight className='h-5 w-5 text-gray-400' />
												</button>
											</CardContent>
										</Card>
									) : (
										<Card className='mb-3 border border-gray-100 shadow-sm overflow-hidden'>
											<CardContent className='p-0'>
												<button
													type='button'
													className='flex items-center p-4 cursor-pointer w-full text-left hover:bg-gray-50'
													onClick={() => handleOpenItem(item)}
												>
													{(() => {
														const kind = getFileKind(
															item.title,
															item.url,
															item['@id']
														);
														return (
															<div
																className={cn(
																	'min-w-10 min-h-10 flex items-center justify-center rounded-full mr-3',
																	FILE_KIND_STYLES[kind].bgSoft
																)}
															>
																<FileTypeIcon
																	kind={kind}
																	withBackground={false}
																	className='h-5 w-5'
																	size={20}
																/>
															</div>
														);
													})()}
													<div className='flex-grow min-w-0'>
														<div className='font-medium text-slate-800 hover:text-ufac-blue line-clamp-2'>
															{item.title}
														</div>
														<div className='text-xs text-gray-500 flex items-center gap-2 mt-1'>
															<UserCircle className='h-3.5 w-3.5 text-gray-400' />
															{item.Creator || item.author}
															<span className='mx-1'>•</span>
															<Calendar className='h-3.5 w-3.5 text-gray-400' />
															{formatDate(item.modified)}
														</div>
													</div>
													<ChevronRight className='h-5 w-5 text-gray-400 flex-shrink-0' />
												</button>
												<div className='flex gap-2 justify-end px-4 pb-3'>
													{(isPdf(item.url || '') || isPdf(item['@id'] || '')) && (
														<Button
															size='sm'
															variant='outline'
															onClick={(e) => {
																e.stopPropagation();
																handleViewPdf(item.url || item['@id'] || '');
															}}
														>
															<Eye className='h-4 w-4 mr-1' />
															Visualizar
														</Button>
													)}
													<Button asChild size='sm'>
														<a
															href={item.url || item['@id']}
															target='_blank'
															rel='noreferrer'
															onClick={(e) => e.stopPropagation()}
														>
															<Download className='h-4 w-4 mr-1' />
															Baixar
														</a>
													</Button>
												</div>
											</CardContent>
										</Card>
									)}
								</motion.div>
							))}
						</>
					) : (
						<div className='text-center py-8 text-gray-500 bg-gray-50 rounded-lg'>
							{searchQuery ? 'Nenhum documento encontrado para a busca.' : 'Esta pasta está vazia.'}
						</div>
					)}
				</div>
			) : (
				<div className='bg-white rounded-xl shadow-sm overflow-hidden'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead 
									className='w-[45%] pl-6 cursor-pointer'
									onClick={() => toggleSort('title')}
								>
									<div className='flex items-center gap-1'>
										Nome
										{sortOptions.field === 'title' && (
											<Badge variant='outline' className='ml-1'>
												{sortOptions.direction === 'asc' ? '↑' : '↓'}
											</Badge>
										)}
									</div>
								</TableHead>
								<TableHead 
									className='w-[15%] cursor-pointer'
									onClick={() => toggleSort('Creator')}
								>
									<div className='flex items-center gap-1'>
										Autor
										{sortOptions.field === 'Creator' && (
											<Badge variant='outline' className='ml-1'>
												{sortOptions.direction === 'asc' ? '↑' : '↓'}
											</Badge>
										)}
									</div>
								</TableHead>
								<TableHead 
									className='w-[20%] cursor-pointer'
									onClick={() => toggleSort('created')}
								>
									<div className='flex items-center gap-1'>
										Data de Criação
										{sortOptions.field === 'created' && (
											<Badge variant='outline' className='ml-1'>
												{sortOptions.direction === 'asc' ? '↑' : '↓'}
											</Badge>
										)}
									</div>
								</TableHead>
								<TableHead 
									className='w-[20%] cursor-pointer'
									onClick={() => toggleSort('modified')}
								>
									<div className='flex items-center gap-1'>
										Última modificação
										{sortOptions.field === 'modified' && (
											<Badge variant='outline' className='ml-1'>
												{sortOptions.direction === 'asc' ? '↑' : '↓'}
											</Badge>
										)}
									</div>
								</TableHead>
								<TableHead className='w-[10%] text-right pr-6'>Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{processedItems.length > 0 ? (
								processedItems.map((item, index) => {
									const folder = isFolderItem(item);
									const fileUrl = item.url || item['@id'] || '';
									const canPreview = !folder && (isPdf(fileUrl) || isPdf(item['@id'] || ''));
									const fileKind = folder
										? null
										: getFileKind(item.title, item.url, item['@id']);

									return (
									<TableRow
										key={item.id + index.toString()}
										className={cn(
											'hover:bg-gray-50',
											(folder || canPreview) && 'cursor-pointer'
										)}
										onClick={() => {
											if (folder || canPreview) {
												handleOpenItem(item);
											}
										}}>
										<TableCell className='pl-6 py-4 font-medium'>
											<div className={cn(
												'flex items-center',
												folder ? 'text-blue-500' : ''
											)}>
												<span
													className={cn(
														'mr-3 flex justify-center items-center min-w-10 min-h-10 rounded-full',
														folder
															? 'bg-ufac-lightBlue'
															: FILE_KIND_STYLES[fileKind!].bgSoft
													)}>
														{folder ? (
															<Folder className='min-h-5 max-h-5 min-w-5 max-w-5' />
														) : (
															<FileTypeIcon
																kind={fileKind!}
																withBackground={false}
																className='min-h-5 max-h-5 min-w-5 max-w-5'
																size={20}
															/>
														)}
												</span>
												<button
													type='button'
													className={cn(
														'text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue rounded-sm',
														folder ? 'text-blue-600' : 'text-slate-800 hover:text-ufac-blue'
													)}
													onClick={(e) => {
														e.stopPropagation();
														handleOpenItem(item);
													}}
												>
													{item.title}
												</button>
												{folder && (
													<ChevronRight className='min-h-4 min-w-4 text-gray-400 ml-2' />
												)}
											</div>
										</TableCell>
										<TableCell>
											{
												<span className='flex gap-2 items-center'>
													<UserCircle className='h-4 w-4' />
													<span>{item.Creator || item.author}</span>
												</span>
											}
										</TableCell>
										<TableCell>
											{formatDate(item.created)}
										</TableCell>
										<TableCell>
											{formatDate(item.modified)}
										</TableCell>
										<TableCell className='text-right pr-6'>
											{!folder && (
												<div className='flex justify-end gap-2'>
													{canPreview && (
														<Button
															variant='outline'
															size='sm'
															onClick={(e) => {
																e.stopPropagation();
																handleViewPdf(fileUrl);
															}}
															key={`view-${item.id}`}
															title='Visualizar PDF'>
															<Eye className='h-4 w-4' />
														</Button>
													)}
													<Button
														variant='outline'
														size='sm'
														onClick={(e) => {
															e.stopPropagation();
															copyDownloadLink(fileUrl);
														}}
														key={`copy-${item.id}`}
														title='Copiar link'>
														<svg 
															xmlns="http://www.w3.org/2000/svg" 
															width="16" 
															height="16" 
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round">
															<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
															<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
														</svg>
													</Button>
													<Button
														variant='ghost'
														size='sm'
														asChild
														key={`download-${item.id}`}
														title='Baixar arquivo'>
														<a
															href={fileUrl}
															target='_blank'
															rel='noreferrer'
															onClick={(e) => e.stopPropagation()}>
															<Download className='h-4 w-4' />
														</a>
													</Button>
												</div>
											)}
										</TableCell>
									</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell
										colSpan={5}
										className='text-center py-8 text-gray-500'>
										{searchQuery ? 'Nenhum documento encontrado para a busca.' : 'Esta pasta está vazia.'}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
};

export default EditalFolderNavigator;
