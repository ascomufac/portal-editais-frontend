import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import PdfIcon from '../icons/PdfIcon';
import EditalBreadcrumb from './EditalBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import EditalFolderSkeleton from './EditalFolderSkeleton';
import EditalHeaderSkeleton from './EditalHeaderSkeleton';

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

	const documentVariants = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
	};

	const processedItems = useMemo(() => {
		let filtered = [...currentItems];

		if (itemTypeFilter !== 'all') {
			filtered = filtered.filter(item =>
				itemTypeFilter === 'folder'
					? item.isFolder || item['@type'] === 'Folder'
					: !item.isFolder && item['@type'] !== 'Folder'
			);
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				item =>
					item.title.toLowerCase().includes(query) ||
					(item.description && item.description.toLowerCase().includes(query))
			);
		}

		filtered.sort((a, b) => {
			const valueA = a[sortOptions.field] || '';
			const valueB = b[sortOptions.field] || '';

			if (sortOptions.field === 'title') {
				return sortOptions.direction === 'asc'
					? valueA.localeCompare(valueB)
					: valueB.localeCompare(valueA);
			} else {
				const dateA = new Date(valueA).getTime();
				const dateB = new Date(valueB).getTime();
				return sortOptions.direction === 'asc'
					? dateA - dateB
					: dateB - dateA;
			}
		});

		return filtered.sort((a, b) => {
			if ((a.isFolder || a['@type'] === 'Folder') && !(b.isFolder || b['@type'] === 'Folder')) return -1;
			if (!(a.isFolder || a['@type'] === 'Folder') && (b.isFolder || b['@type'] === 'Folder')) return 1;
			return 0;
		});
	}, [currentItems, itemTypeFilter, searchQuery, sortOptions]);

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
					<Tabs value={itemTypeFilter} onValueChange={(v) => setItemTypeFilter(v as any)}>
						<TabsList>
							<TabsTrigger value="all" className='flex items-center gap-1'>
								<FileText className='h-3.5 w-3.5' />
								<span>Todos</span>
							</TabsTrigger>
							<TabsTrigger value="folder" className='flex items-center gap-1'>
								<Folder className='h-3.5 w-3.5' />
								<span>Pastas</span>
							</TabsTrigger>
							<TabsTrigger value="file" className='flex items-center gap-1'>
								<PdfIcon className='h-3.5 w-3.5' />
								<span>Arquivos</span>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{isMobile ? (
				<div className='space-y-3'>
					{processedItems.length > 0 ? (
						<Accordion
							type='single'
							collapsible
							className='w-full'>
							{processedItems.map((item) => (
								<motion.div
									key={item.id}
									variants={documentVariants}
									initial='initial'
									animate='animate'
									exit='exit'
									transition={{ duration: 0.2 }}>
									{item.isFolder || item['@type'] === 'Folder' ? (
										<Card className='mb-3 border border-gray-100 shadow-sm'>
											<CardContent className='p-0'>
												<div
													className='flex items-center p-4 cursor-pointer'
													onClick={() =>
														navigateToFolder(item['@id'], item.title)
													}>
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
												</div>
											</CardContent>
										</Card>
									) : (
										<AccordionItem
											value={item.id}
											className='border border-gray-100 rounded-lg mb-3 shadow-sm'>
											<AccordionTrigger className='px-4 py-3 hover:no-underline'>
												<div className='flex items-center text-left'>
													<div className='min-w-10 min-h-10 flex items-center justify-center bg-red-50 rounded-full mr-3'>
														<PdfIcon className='h-5 w-5 text-red-500' />
													</div>
													<div>
														<div className='font-medium'>{item.title}</div>
														<div className='text-xs text-gray-500 flex items-center gap-2'>
															<UserCircle className='h-3.5 w-3.5 text-gray-400' /> {item.Creator || item.author} 
															<span className='mx-1'>•</span> 
															<Calendar className='h-3.5 w-3.5 text-gray-400' /> {formatDate(item.modified)}
														</div>
													</div>
												</div>
											</AccordionTrigger>
											<AccordionContent className='px-4 py-3 border-t'>
												<div className='flex flex-col gap-3'>
													<div className='text-sm text-gray-600 flex flex-col gap-1'>
														<div className='flex items-center gap-1'>
															<Calendar className='h-3.5 w-3.5 text-gray-400' />
															<span>Criado em: {formatDate(item.created)}</span>
														</div>
														<div className='flex items-center gap-1'>
															<Clock className='h-3.5 w-3.5 text-gray-400' />
															<span>Modificado em: {formatDate(item.modified)}</span>
														</div>
														<div className='flex items-center gap-1'>
															<UserCircle className='h-3.5 w-3.5 text-gray-400' />
															<span>Autor: {item.Creator || item.author}</span>
														</div>
													</div>
													<div className='flex gap-2 justify-end'>
														{isPdf(item['@id']) && (
															<Button
																size='sm'
																variant='outline'
																onClick={() => handleViewPdf(item.url)}>
																<Eye className='h-4 w-4 mr-1' />
																Visualizar
															</Button>
														)}
														<Button
															asChild
															size='sm'>
															<a
																href={item.url || item['@id']}
																target='_blank'
																rel='noreferrer'>
																<Download className='h-4 w-4 mr-1' />
																Baixar
															</a>
														</Button>
													</div>
												</div>
											</AccordionContent>
										</AccordionItem>
									)}
								</motion.div>
							))}
						</Accordion>
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
								processedItems.map((item, index) => (
									<TableRow
										key={item.id + index.toString()}
										className={cn(
											item['@type'] === 'Folder' || item.isFolder
												? 'cursor-pointer hover:bg-gray-50'
												: 'hover:bg-gray-50'
										)}
										onClick={
											item['@type'] === 'Folder' || item.isFolder
												? () => navigateToFolder(item['@id'], item.title)
												: undefined
										}>
										<TableCell className='pl-6 py-4 font-medium'>
											<div className={cn(
												'flex items-center',
												(item.isFolder || item['@type'] === 'Folder') 
													? 'text-blue-500' 
													: ''
											)}>
												<span
													className={cn(
														'mr-3 flex justify-center items-center min-w-10 min-h-10 rounded-full',
														(item.isFolder || item['@type'] === 'Folder')
															? 'bg-ufac-lightBlue'
															: 'bg-red-50'
													)}>
														{(item.isFolder || item['@type'] === 'Folder') ? (
															<Folder className='min-h-5 max-h-5 min-w-5 max-w-5' />
														) : (
															<PdfIcon className='min-h-5 max-h-5 min-w-5 max-w-5 text-red-500' />
														)}
												</span>
												<span
													className={
														(item.isFolder || item['@type'] === 'Folder') ? 'text-blue-600' : ''
													}>
													{item.title}
												</span>
												{(item.isFolder || item['@type'] === 'Folder') && (
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
											{!(item.isFolder || item['@type'] === 'Folder') && (
												<div className='flex justify-end gap-2'>
													{isPdf(item['@id']) && (
														<Button
															variant='outline'
															size='sm'
															onClick={(e) => {
																e.stopPropagation();
																handleViewPdf(item.url);
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
															copyDownloadLink(item.url || item['@id']);
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
															href={item.url || item['@id']}
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
								))
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
