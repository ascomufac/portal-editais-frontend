'use client';

import FavoriteStarButton from '@/components/FavoriteStarButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { isPdf } from '@/services/search/utils';
import { EditalDocumentType } from '@/types/edital';
import { motion } from 'framer-motion';
import {
	ArrowUpDown,
	CalendarDays,
	ChevronRight,
	Download,
	Eye,
	FileText,
	Folder,
	Link2,
	RefreshCw,
	Sparkles,
	Undo2,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FileTypeIcon, {
	FILE_KIND_STYLES,
	getFileKind,
} from '../icons/FileTypeIcon';
import EditalBreadcrumb from './EditalBreadcrumb';
import EditalFolderSkeleton from './EditalFolderSkeleton';
import EditalHeaderSkeleton from './EditalHeaderSkeleton';

export type EditalNavigatorHeader = {
	title: string;
	description?: string;
	htmlContent?: string;
	portalType?: string;
	isFolderish?: boolean;
	favoriteId: string;
	favoriteHref: string;
	publishedLabel?: string | null;
	updatedLabel?: string | null;
};

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
	header?: EditalNavigatorHeader;
}

const MIN_VALID_YEAR = 1990;

/** Só aceita datas reais (ignora o sentinela 1969 do Plone em `effective`). */
export function parsePloneDate(value?: string | null): Date | null {
	if (!value || value === 'None' || value === 'null') return null;
	const time = Date.parse(value);
	if (!Number.isFinite(time)) return null;
	const date = new Date(time);
	if (date.getUTCFullYear() < MIN_VALID_YEAR) return null;
	return date;
}

/** Data pública do arquivo na timeline: sempre `created`. */
export function getDocumentTimelineDate(item: {
	created?: string;
	modified?: string;
	lastModified?: string;
}): Date | null {
	return (
		parsePloneDate(item.created) ||
		parsePloneDate(item.modified) ||
		parsePloneDate(item.lastModified)
	);
}

export function formatTimelineDateLabel(date: Date | null): string {
	if (!date) return '';
	try {
		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		}).format(date);
	} catch {
		return '';
	}
}

export function formatTimelineTimeLabel(date: Date | null): string {
	if (!date) return '';
	try {
		return new Intl.DateTimeFormat('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	} catch {
		return '';
	}
}

const isFolderItem = (item: EditalDocumentType) =>
	Boolean(
		item.isFolder ||
			item.is_folderish ||
			item['@type'] === 'Folder' ||
			item['@type'] === 'Collection'
	);

const DocumentActions = ({
	item,
	isMobile,
	emphasized = false,
	onView,
	onCopy,
}: {
	item: EditalDocumentType;
	isMobile: boolean;
	emphasized?: boolean;
	onView: (url: string) => void;
	onCopy: (url: string) => void;
}) => {
	const fileUrl = item.url || item['@id'] || '';
	const canPreview = isPdf(fileUrl) || isPdf(item['@id'] || '');

	return (
		<div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
			{canPreview && (
				<Button
					size={emphasized ? 'default' : 'sm'}
					variant="default"
					className={cn(
						'gap-1.5 rounded-full bg-ufac-blue hover:bg-ufac-blue/90',
						emphasized ? 'h-10 px-4 text-sm' : 'h-9 px-3 text-xs'
					)}
					onClick={() => onView(fileUrl)}
				>
					<Eye className={emphasized ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
					Ler PDF
				</Button>
			)}
			<Button
				asChild
				size={emphasized ? 'default' : 'sm'}
				variant={emphasized && !canPreview ? 'default' : 'outline'}
				className={cn(
					'gap-1.5 rounded-full',
					emphasized ? 'h-10 px-4 text-sm' : 'h-9 px-3 text-xs',
					emphasized &&
						!canPreview &&
						'bg-ufac-blue text-white hover:bg-ufac-blue/90'
				)}
			>
				<a href={fileUrl} target="_blank" rel="noreferrer" download>
					<Download className={emphasized ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
					Baixar
				</a>
			</Button>
			{!isMobile && (
				<Button
					size={emphasized ? 'default' : 'sm'}
					variant="ghost"
					className={cn(
						'rounded-full p-0 text-slate-500',
						emphasized ? 'h-10 w-10' : 'h-9 w-9'
					)}
					aria-label="Copiar link do arquivo"
					onClick={() => onCopy(fileUrl)}
				>
					<Link2 className={emphasized ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
				</Button>
			)}
		</div>
	);
};

const EditalFolderNavigator: React.FC<EditalFolderNavigatorProps> = ({
	currentFolder,
	breadcrumbItems,
	navigateToFolder,
	navigateUp,
	navigateToSpecificBreadcrumb,
	getCurrentFolderContents,
	editalTitle,
	isLoading = false,
	header,
}) => {
	const isMobile = useIsMobile();
	const router = useRouter();
	const { toast } = useToast();
	const currentItems = getCurrentFolderContents();

	const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'folder' | 'file'>(
		'all'
	);
	const [newestFirst, setNewestFirst] = useState(true);

	const typeCounts = useMemo(() => {
		const folders = currentItems.filter(isFolderItem).length;
		const files = currentItems.length - folders;
		return { all: currentItems.length, folder: folders, file: files };
	}, [currentItems]);

	const showTypeFilter = typeCounts.folder > 0 && typeCounts.file > 0;

	useEffect(() => {
		if (!showTypeFilter && itemTypeFilter !== 'all') {
			setItemTypeFilter('all');
		}
	}, [showTypeFilter, itemTypeFilter]);

	const { folders, files } = useMemo(() => {
		let items = [...currentItems];
		if (itemTypeFilter !== 'all') {
			items = items.filter((item) =>
				itemTypeFilter === 'folder' ? isFolderItem(item) : !isFolderItem(item)
			);
		}

		const folderItems = items.filter(isFolderItem);
		const fileItems = items
			.filter((item) => !isFolderItem(item))
			.sort((a, b) => {
				const dateA = getDocumentTimelineDate(a)?.getTime() ?? 0;
				const dateB = getDocumentTimelineDate(b)?.getTime() ?? 0;
				return newestFirst ? dateB - dateA : dateA - dateB;
			});

		return { folders: folderItems, files: fileItems };
	}, [currentItems, itemTypeFilter, newestFirst]);

	/** Pasta de agrupamento (só editais/pastas) vs edital com documentos */
	const isCollectionView =
		folders.length > 0 && files.length === 0 && itemTypeFilter !== 'file';

	const latestFile = newestFirst && files.length > 0 ? files[0] : null;
	const showFeaturedLatest =
		Boolean(latestFile) && itemTypeFilter !== 'folder';

	const handleViewPdf = (url: string) => {
		router.push(`/visualizar-pdf/${encodeURIComponent(url)}`);
	};

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
		if (fileUrl) {
			window.open(fileUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const copyDownloadLink = (url: string) => {
		navigator.clipboard.writeText(url).then(
			() => {
				toast({
					title: 'Link copiado',
					description: 'O link do arquivo foi copiado. Você já pode compartilhar.',
					duration: 3000,
				});
			},
			() => {
				toast({
					title: 'Não foi possível copiar',
					description: 'Tente novamente em instantes.',
					variant: 'destructive',
					duration: 3000,
				});
			}
		);
	};

	if (isLoading && !header) {
		return (
			<div className="w-full">
				<EditalHeaderSkeleton />
				<EditalFolderSkeleton />
			</div>
		);
	}

	const empty =
		folders.length === 0 &&
		files.length === 0 &&
		itemTypeFilter !== 'folder';

	const showFolderIcon = isCollectionView;
	return (
		<div className="w-full space-y-5 sm:space-y-6">
			{/* Cabeçalho + navegação */}
			<div className="space-y-4">
				{header && (
					<div className="flex items-start gap-3 sm:gap-4">
						<div className="mt-0.5 hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ufac-lightBlue sm:flex">
							{showFolderIcon ? (
								<Folder className="h-6 w-6 text-ufac-blue" />
							) : (
								<FileText className="h-6 w-6 text-ufac-blue" />
							)}
						</div>

						<div className="min-w-0 flex-1">
							<div className="mb-2 flex flex-wrap items-center gap-2">
								<span className="inline-flex items-center rounded-full bg-ufac-blue/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ufac-blue">
									{showFolderIcon ? 'Pasta' : 'Edital oficial'}
								</span>
								<span className="text-xs text-slate-500 sm:text-sm">
									{isCollectionView
										? `${folders.length} ${folders.length === 1 ? 'item' : 'itens'} nesta pasta`
										: 'Documentos públicos · leitura e download'}
								</span>
							</div>

							<div className="flex items-start gap-2">
								<h1 className="min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl sm:font-bold">
									{header.title}
								</h1>
								<FavoriteStarButton
									idOrUrl={header.favoriteId}
									title={header.title}
									href={header.favoriteHref}
									portalType={header.portalType}
									className="shrink-0 border border-slate-200"
								/>
							</div>

							{header.description && (
								<p className="mt-2 text-sm leading-relaxed text-slate-600">
									{header.description}
								</p>
							)}

							{(header.publishedLabel || header.updatedLabel) && (
								<div className="mt-3 flex flex-wrap gap-2">
									{header.publishedLabel && (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200/80">
											<CalendarDays className="h-3.5 w-3.5 text-ufac-blue" />
											{header.publishedLabel}
										</span>
									)}
									{header.updatedLabel && (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200/80">
											<RefreshCw className="h-3.5 w-3.5 text-ufac-blue" />
											{header.updatedLabel}
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				{header?.htmlContent && (
					<div
						className="prose prose-sm max-w-none text-gray-700
              prose-a:text-ufac-blue prose-a:underline
              prose-headings:text-ufac-blue prose-li:my-1"
						dangerouslySetInnerHTML={{ __html: header.htmlContent }}
					/>
				)}

				<div className="flex items-center gap-2">
					{currentFolder && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigateUp()}
							className="h-9 shrink-0 gap-1.5 rounded-full px-3"
							aria-label="Voltar à pasta anterior"
						>
							<Undo2 className="h-4 w-4" />
							<span className="hidden sm:inline">Voltar</span>
						</Button>
					)}
					<div className="min-w-0 flex-1 overflow-hidden">
						<EditalBreadcrumb
							breadcrumbItems={breadcrumbItems}
							navigateUp={navigateUp}
							navigateToSpecificBreadcrumb={navigateToSpecificBreadcrumb}
							editalTitle={editalTitle}
						/>
					</div>
				</div>
			</div>

			{/* Conteúdo */}
			<div className="space-y-5 sm:space-y-6">
				{showTypeFilter && (
					<div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
						<Tabs
							value={itemTypeFilter}
							onValueChange={(v) =>
								setItemTypeFilter(v as 'all' | 'folder' | 'file')
							}
						>
							<TabsList className="h-auto gap-0.5 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80">
								{(
									[
										{ value: 'all', label: 'Todos', count: typeCounts.all },
										{
											value: 'folder',
											label: 'Pastas',
											count: typeCounts.folder,
											icon: Folder,
										},
										{
											value: 'file',
											label: 'Arquivos',
											count: typeCounts.file,
											icon: FileText,
										},
									] as const
								).map((tab) => (
									<TabsTrigger
										key={tab.value}
										value={tab.value}
										className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs data-[state=active]:bg-ufac-lightBlue data-[state=active]:text-ufac-blue sm:gap-1.5 sm:px-3 sm:text-sm"
									>
										{'icon' in tab && tab.icon ? (
											<tab.icon className="h-3.5 w-3.5" />
										) : null}
										<span
											className={cn(
												tab.value !== 'all' && 'hidden sm:inline'
											)}
										>
											{tab.label}
										</span>
										<span
											className={cn(
												'inline-flex min-w-[1.15rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-semibold leading-none tabular-nums',
												itemTypeFilter === tab.value
													? 'bg-ufac-blue text-white'
													: 'bg-slate-100 text-slate-600'
											)}
										>
											{tab.count}
										</span>
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
				)}

				{showFeaturedLatest && latestFile && (
					<section className="overflow-hidden rounded-2xl border border-ufac-blue/20 bg-gradient-to-br from-ufac-lightBlue/80 via-white to-white p-4 shadow-sm sm:p-5">
						<div className="mb-3 flex flex-wrap items-center gap-2">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-ufac-blue px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
								<Sparkles className="h-3.5 w-3.5" />
								Comece por aqui
							</span>
							<span className="text-xs text-slate-500 sm:text-sm">
								Publicação mais recente deste edital
							</span>
						</div>

						<div
							className={cn(
								'flex gap-4',
								isMobile ? 'flex-col' : 'items-start justify-between'
							)}
						>
							<button
								type="button"
								className="flex min-w-0 flex-1 items-start gap-3 text-left"
								onClick={() => handleOpenItem(latestFile)}
							>
								<span
									className={cn(
										'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
										FILE_KIND_STYLES[
											getFileKind(
												latestFile.title,
												latestFile.url,
												latestFile['@id']
											)
										].bgSoft
									)}
								>
									<FileTypeIcon
										kind={getFileKind(
											latestFile.title,
											latestFile.url,
											latestFile['@id']
										)}
										withBackground={false}
										className="h-6 w-6"
										size={24}
									/>
								</span>
								<span className="min-w-0 flex-1">
									{(() => {
										const d = getDocumentTimelineDate(latestFile);
										const dateLabel = formatTimelineDateLabel(d);
										const timeLabel = formatTimelineTimeLabel(d);
										return dateLabel ? (
											<span className="mb-1 block text-xs text-slate-500">
												{dateLabel}
												{timeLabel ? ` · ${timeLabel}` : ''}
											</span>
										) : null;
									})()}
									<span className="line-clamp-3 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
										{latestFile.title}
									</span>
									{latestFile.description ? (
										<span className="mt-1 line-clamp-2 block text-sm text-slate-500">
											{latestFile.description}
										</span>
									) : (
										<span className="mt-1 block text-sm text-slate-500">
											Abra para ler online ou baixe o arquivo oficial.
										</span>
									)}
								</span>
							</button>

							<DocumentActions
								item={latestFile}
								isMobile={isMobile}
								emphasized
								onView={handleViewPdf}
								onCopy={copyDownloadLink}
							/>
						</div>
					</section>
				)}

				{folders.length > 0 && itemTypeFilter !== 'file' && (
					<section>
						{!isCollectionView && (
							<div className="mb-3">
								<h2 className="text-sm font-semibold text-slate-800 sm:text-base">
									Pastas
								</h2>
								<p className="text-xs text-slate-500 sm:text-sm">
									Documentos agrupados neste edital
								</p>
							</div>
						)}
						<div className="grid gap-2 sm:grid-cols-2">
							{folders.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => handleOpenItem(item)}
									className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3.5 text-left shadow-sm transition hover:border-ufac-blue/30 hover:bg-ufac-lightBlue/50 hover:shadow-md"
								>
									<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ufac-lightBlue text-ufac-blue transition group-hover:bg-white">
										<Folder className="h-5 w-5" />
									</span>
									<span className="min-w-0 flex-1">
										<span className="line-clamp-2 text-sm font-medium text-slate-800">
											{item.title}
										</span>
										<span className="mt-0.5 block text-xs text-slate-400">
											Abrir
										</span>
									</span>
									<ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-ufac-blue" />
								</button>
							))}
						</div>
					</section>
				)}

				{itemTypeFilter !== 'folder' &&
					!(showFeaturedLatest && files.length <= 1) && (
						<section>
							<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
								<div>
									<h2 className="text-sm font-semibold text-slate-800 sm:text-base">
										{showFeaturedLatest
											? 'Publicações anteriores'
											: 'Histórico de publicações'}
									</h2>
									<p className="text-xs text-slate-500 sm:text-sm">
										{showFeaturedLatest
											? 'Demais documentos oficiais deste edital'
											: 'Linha do tempo — do mais recente ao mais antigo'}
									</p>
								</div>
								{files.length > 1 && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-9 gap-1.5 rounded-full text-xs text-slate-600"
										onClick={() => setNewestFirst((v) => !v)}
									>
										<ArrowUpDown className="h-3.5 w-3.5" />
										{newestFirst
											? 'Mais recentes primeiro'
											: 'Mais antigos primeiro'}
									</Button>
								)}
							</div>

							{files.length === 0 ? (
								empty ? (
									<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center">
										<FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
										<p className="text-sm font-medium text-slate-700">
											Ainda não há arquivos neste local
										</p>
									</div>
								) : null
							) : (
								<ol className="relative space-y-0 border-l-2 border-ufac-lightBlue pl-0 sm:ml-1">
									{files.map((item, index) => {
										const kind = getFileKind(
											item.title,
											item.url,
											item['@id']
										);
										const timelineDate = getDocumentTimelineDate(item);
										const dateLabel = formatTimelineDateLabel(timelineDate);
										const timeLabel = formatTimelineTimeLabel(timelineDate);
										const isLatest = newestFirst && index === 0;
										const hideDuplicate = showFeaturedLatest && isLatest;

										if (hideDuplicate) return null;

										return (
											<li
												key={item.id}
												className="relative pb-5 last:pb-0 pl-6 sm:pl-8"
											>
												<span
													className={cn(
														'absolute -left-[7px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white sm:-left-[9px] sm:h-4 sm:w-4',
														isLatest
															? 'bg-ufac-blue ring-4 ring-ufac-lightBlue'
															: 'bg-slate-300'
													)}
													aria-hidden
												/>
												<motion.article
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														duration: 0.2,
														delay: Math.min(index * 0.03, 0.2),
													}}
													className={cn(
														'rounded-2xl border bg-white p-3 shadow-sm sm:p-4',
														isLatest
															? 'border-ufac-blue/25 shadow-md shadow-ufac-blue/5'
															: 'border-slate-100'
													)}
												>
													<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
														{dateLabel ? (
															<time
																dateTime={
																	item.created || item.modified || undefined
																}
															>
																{dateLabel}
																{timeLabel ? ` · ${timeLabel}` : ''}
															</time>
														) : null}
														{isLatest && (
															<span className="rounded-full bg-ufac-lightBlue px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ufac-blue">
																Mais recente
															</span>
														)}
													</div>

													<div
														className={cn(
															'mt-2 flex gap-3',
															isMobile ? 'flex-col' : 'items-start'
														)}
													>
														<button
															type="button"
															className="flex min-w-0 flex-1 items-start gap-3 text-left"
															onClick={() => handleOpenItem(item)}
														>
															<span
																className={cn(
																	'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
																	FILE_KIND_STYLES[kind].bgSoft
																)}
															>
																<FileTypeIcon
																	kind={kind}
																	withBackground={false}
																	className="h-5 w-5"
																	size={20}
																/>
															</span>
															<span className="min-w-0 flex-1">
																<span className="line-clamp-3 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
																	{item.title}
																</span>
																{item.description ? (
																	<span className="mt-1 line-clamp-2 block text-xs text-slate-500">
																		{item.description}
																	</span>
																) : null}
															</span>
														</button>

														<DocumentActions
															item={item}
															isMobile={isMobile}
															onView={handleViewPdf}
															onCopy={copyDownloadLink}
														/>
													</div>
												</motion.article>
											</li>
										);
									})}
								</ol>
							)}
						</section>
					)}

				{itemTypeFilter === 'folder' && folders.length === 0 && (
					<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center">
						<Folder className="mx-auto mb-3 h-8 w-8 text-slate-300" />
						<p className="text-sm font-medium text-slate-700">
							Nenhuma pasta neste local
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default EditalFolderNavigator;
