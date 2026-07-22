'use client';

import FavoriteStarButton from '@/components/FavoriteStarButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { EditalItem } from '@/services/editalService';
import { motion } from 'framer-motion';
import {
	ArrowRight,
	CalendarDays,
	Clock1,
	Clock10,
	Clock11,
	Clock12,
	Clock2,
	Clock3,
	Clock4,
	Clock5,
	Clock6,
	Clock7,
	Clock8,
	Clock9,
	FileText,
} from 'lucide-react';
import React from 'react';
import Link from 'next/link';

const getClockIconByHour = (hour: string | undefined) => {
	if (!hour)
		return (
			<Clock1
				size={16}
				className='shrink-0'
			/>
		);
	const parsedHour = parseInt(hour.split(':')[0], 10);
	const clockIcons = [
		Clock12,
		Clock1,
		Clock2,
		Clock3,
		Clock4,
		Clock5,
		Clock6,
		Clock7,
		Clock8,
		Clock9,
		Clock10,
		Clock11,
		Clock12,
	];
	const ClockIcon = clockIcons[parsedHour % 12];
	return (
		<ClockIcon
			size={16}
			className='shrink-0'
		/>
	);
};

export interface EditalCardProps {
	title: string;
	description: string;
	icon?: React.ReactNode;
	color?: string;
	href: string;
	date?: string;
	hour?: string;
	variant?: 'card' | 'line';
	/** Cards mais baixos — útil na home para caber destaques + atualizações */
	compact?: boolean;
	state?: EditalItem;
	/** Se false, oculta a estrela de favorito */
	showFavorite?: boolean;
}

const EditalCard: React.FC<EditalCardProps> = ({
	title,
	description,
	icon = <FileText className='h-6 w-6 text-ufac-blue' />,
	color = 'bg-blue-50',
	href,
	date,
	hour,
	state,
	variant = 'card',
	compact = false,
	showFavorite = true,
}) => {
	const isMobile = useIsMobile();
	const displayTitle = title || state?.title || 'Título não disponível';
	const favoriteId = state?.['@id'] || href;

	const favoriteButton = showFavorite ? (
		<FavoriteStarButton
			idOrUrl={favoriteId}
			title={displayTitle}
			href={href}
			portalType={state?.['@type']}
			size={compact || variant === 'line' ? 'sm' : 'md'}
			className={cn(
				variant === 'line'
					? 'shrink-0'
					: 'absolute right-3 top-3 z-10 sm:right-4 sm:top-4'
			)}
		/>
	) : null;

	if (variant === 'line') {
		return (
			<div className='relative flex items-center gap-1'>
				<Link
					href={href}
					aria-label={`Abrir ${displayTitle}`}
					className='border-b py-4 overflow-hidden flex min-w-0 flex-1 items-center justify-between gap-3 sm:gap-4 bg-white rounded-3xl p-3 sm:p-4 transition-colors hover:bg-slate-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue focus-visible:ring-offset-2'
				>
					<div className='flex items-start gap-3 sm:gap-4 min-w-0'>
						<div
							className={cn(
								'rounded-full flex items-center justify-center flex-shrink-0',
								color,
								'w-10 h-10'
							)}
						>
							{icon}
						</div>
						<div className='flex flex-col min-w-0'>
							<h3 className='truncate text-base font-semibold text-slate-500'>
								{displayTitle}
							</h3>
							<div className='text-neutral-400 text-xs flex flex-wrap gap-x-3 gap-y-1 mt-1'>
								{date && (
									<span className='inline-flex items-center gap-1'>
										<CalendarDays size={14} /> {date}
									</span>
								)}
								{hour && (
									<span className='inline-flex items-center gap-1'>
										{getClockIconByHour(hour)} {hour}
									</span>
								)}
							</div>
						</div>
					</div>
					<span
						className='flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center w-8 h-8'
						aria-hidden='true'
					>
						<ArrowRight className='h-4 w-4 text-gray-900' />
					</span>
				</Link>
				{favoriteButton}
			</div>
		);
	}

	return (
		<div className='relative h-full'>
			{favoriteButton}
			<Link
				href={href}
				aria-label={`Abrir ${displayTitle}`}
				className='group block h-full rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue focus-visible:ring-offset-2'
			>
				<motion.div
					whileHover={isMobile ? undefined : { y: compact ? -4 : -8 }}
					transition={{ duration: 0.3 }}
					className={cn(
						'hover:border-ufac-blue-light border-2 border-gray-50 shadow-2xl-ufac-blue-light edital-card bg-white shadow-md overflow-hidden h-full cursor-pointer',
						compact ? 'rounded-2xl' : 'rounded-[28px] sm:rounded-[32px]'
					)}
				>
					<div
						className={cn(
							'flex flex-col h-full',
							compact ? 'gap-3 p-3.5 sm:p-4' : 'p-4 sm:p-6 md:p-8'
						)}
					>
						<div className='flex items-start justify-between gap-2'>
							<div
								className={cn(
									'flex items-center justify-center rounded-full shrink-0',
									color,
									compact
										? 'h-10 w-10'
										: isMobile
											? 'w-12 h-12 min-w-[40px] min-h-[40px]'
											: 'w-14 h-14 min-w-[48px] min-h-[48px]'
								)}
							>
								{icon}
							</div>
						</div>

						{!compact && (
							<div className='flex-grow min-h-[8px] sm:min-h-[16px]' />
						)}

						<div className='text-neutral-400 text-sm flex flex-wrap items-center gap-x-3 gap-y-1'>
							{date && (
								<div className='flex items-center gap-1.5 text-xs'>
									<CalendarDays size={compact ? 14 : 16} className='shrink-0' />
									{date}
								</div>
							)}
							{hour && (
								<div className='flex items-center gap-1.5 text-xs'>
									{getClockIconByHour(hour)}
									{hour}
								</div>
							)}
						</div>

						<div className={cn(compact ? 'mt-1' : 'mt-auto')}>
							<h3
								className={cn(
									'font-semibold text-ufac-blue-light line-clamp-2',
									compact ? 'mb-0 text-sm sm:text-base' : 'mb-2 text-base sm:text-lg'
								)}
							>
								{displayTitle}
							</h3>
							<div className='flex justify-between items-end gap-3'>
								{!compact && description ? (
									<p className='text-sm text-gray-700 hyphens-auto break-words line-clamp-3 sm:line-clamp-4'>
										{description}
									</p>
								) : (
									<span className='flex-1' />
								)}
								<span
									className={cn(
										'rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 self-end transition-colors group-hover:bg-ufac-lightBlue',
										compact ? 'h-8 w-8' : isMobile ? 'w-10 h-10' : 'w-12 h-12'
									)}
									aria-hidden='true'
								>
									<ArrowRight
										className={
											compact
												? 'h-4 w-4 text-gray-900'
												: isMobile
													? 'h-5 w-5 text-gray-900'
													: 'h-6 w-6 text-gray-900'
										}
									/>
								</span>
							</div>
						</div>
					</div>
				</motion.div>
			</Link>
		</div>
	);
};

export default EditalCard;
