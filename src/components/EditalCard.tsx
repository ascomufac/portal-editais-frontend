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
import { NavLink } from 'react-router-dom';

const getClockIconByHour = (hour: string | undefined) => {
	if (!hour)
		return (
			<Clock1
				size={16}
				className='mr-2 ml-3'
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
			className='mr-2 ml-3'
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
	state?: EditalItem;
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
}) => {
	const isMobile = useIsMobile();
	const containerRef = React.useRef<HTMLAnchorElement>(null);
	const [cardWidth, setCardWidth] = React.useState<number | null>(null);
	const displayTitle = title || state?.title || 'Título não disponível';

	React.useEffect(() => {
		if (variant === 'line') {
			const updateCardWidth = () => {
				if (containerRef.current) {
					const containerWidth = containerRef.current.offsetWidth;
					setCardWidth(containerWidth - 140);
				}
			};
			updateCardWidth();
			window.addEventListener('resize', updateCardWidth);
			return () => window.removeEventListener('resize', updateCardWidth);
		}
	}, [variant]);

	if (variant === 'line') {
		return (
			<NavLink
				ref={containerRef}
				to={href}
				aria-label={`Abrir ${displayTitle}`}
				className='border-b py-4 overflow-hidden flex items-center justify-between gap-4 bg-white rounded-3xl p-4 transition-colors hover:bg-slate-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue focus-visible:ring-offset-2'
			>
				<div className='flex items-start gap-4 min-w-0'>
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
						<h3
							className={cn(
								'text-base font-semibold text-slate-500',
								cardWidth &&
									'truncate overflow-hidden text-ellipsis whitespace-nowrap'
							)}
							style={cardWidth ? { maxWidth: `${cardWidth}px` } : {}}
						>
							{displayTitle}
						</h3>
						<div className='text-neutral-400 text-xs flex gap-4 mt-1'>
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
			</NavLink>
		);
	}

	return (
		<NavLink
			to={href}
			aria-label={`Abrir ${displayTitle}`}
			className='group block h-full rounded-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ufac-blue focus-visible:ring-offset-2'
		>
			<motion.div
				whileHover={{ y: -8 }}
				transition={{ duration: 0.3 }}
				className='hover:border-ufac-blue-light border-2 border-gray-50 shadow-2xl-ufac-blue-light edital-card bg-white rounded-[32px] shadow-md overflow-hidden h-full cursor-pointer'
			>
				<div className='flex flex-col h-full p-4 sm:p-6 md:p-8'>
					<div className='flex justify-between'>
						<div
							className={cn(
								'flex items-center justify-center rounded-full mb-auto',
								color,
								isMobile
									? 'w-12 h-12 min-w-[40px] min-h-[40px]'
									: 'w-14 h-14 min-w-[48px] min-h-[48px]'
							)}
						>
							{icon}
						</div>
					</div>

					<div className='flex-grow min-h-[8px] sm:min-h-[16px]' />

					<div className='text-neutral-400 text-sm flex items-center'>
						{date && (
							<div className='flex items-center text-xs'>
								<CalendarDays size={16} className='mr-2' />
								{date}
							</div>
						)}
						{hour && (
							<div className='flex items-center'>
								{getClockIconByHour(hour)}
								{hour}
							</div>
						)}
					</div>

					<div className='mt-auto'>
						<h3
							className={cn(
								'font-semibold text-ufac-blue-light mb-2 line-clamp-2',
								isMobile ? 'text-md' : 'text-lg'
							)}
						>
							{displayTitle}
						</h3>
						<div className='flex justify-between items-end gap-4'>
							<p
								className={cn(
									'text-gray-700 hyphens-auto break-words line-clamp-4',
									'text-sm'
								)}
							>
								{description}
							</p>
							<span
								className={cn(
									'rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 self-end transition-colors group-hover:bg-ufac-lightBlue',
									isMobile ? 'w-10 h-10' : 'w-12 h-12'
								)}
								aria-hidden='true'
							>
								<ArrowRight
									className={
										isMobile ? 'h-5 w-5 text-gray-900' : 'h-6 w-6 text-gray-900'
									}
								/>
							</span>
						</div>
					</div>
				</div>
			</motion.div>
		</NavLink>
	);
};

export default EditalCard;
