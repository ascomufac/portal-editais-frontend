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

/**
 * Interface para as propriedades do componente EditalCard
 * @interface EditalCardProps
 * @property {string} title - Título do edital
 * @property {string} description - Descrição do edital
 * @property {React.ReactNode} [icon] - Ícone do edital
 * @property {string} [color] - Cor de fundo do ícone
 * @property {string} href - Link para a página de detalhes do edital
 * @property {string} [date] - Data do edital
 * @property {string} [hour] - Hora do edital
 * @property {'card' | 'line'} [variant] - Variante do card
 */
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

/**
 * Componente de card para exibir um edital
 * @param {EditalCardProps} props - Propriedades do componente
 * @returns {JSX.Element} Componente React renderizado
 * @description Renderiza um card interativo para um edital, com título, descrição,
 *              ícone personalizado e animação de hover. O card é responsivo e
 *              adapta seu tamanho em dispositivos móveis.
 */
const EditalCard: React.FC<EditalCardProps> = ({
	title,
	description,
	icon = <FileText className='h-6 w-6 text-ufac-blue' /> ,
	color = 'bg-blue-50',
	href,
	date,
	hour,
	state,
	variant = 'card',
}) => {
	const isMobile = useIsMobile();

	const containerRef = React.useRef<HTMLDivElement>(null);
	const [cardWidth, setCardWidth] = React.useState<number | null>(null);

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
			<div ref={containerRef} className="border-b py-4 overflow-hidden flex items-center justify-between gap-4 bg-white rounded-3xl p-4">
				<div className="flex items-start gap-4">
					<div className={cn('rounded-full flex items-center justify-center', color, 'w-10 h-10')}>
						{icon}
					</div>
					<div className="flex flex-col">
						<h3
							className={cn("text-base font-semibold text-slate-500", cardWidth && "truncate overflow-hidden text-ellipsis whitespace-nowrap")}
							style={cardWidth ? { maxWidth: `${cardWidth}px` } : {}}>
							{title || state?.title || 'Título não disponível'} 
						</h3>
						{/* <p className="text-sm text-gray-600">{description}</p> */}
						<div className="text-neutral-400 text-xs flex gap-4 mt-1">
							{date && (
								<span className="inline-flex items-center gap-1">
									<CalendarDays size={14} /> {date}
								</span>
							)}
							{hour && (
								<span className="inline-flex items-center gap-1">
									{getClockIconByHour(hour)} {hour}
								</span>
							)}
						</div>
					</div>
				</div>
				<NavLink
					to={href}
					className="flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center w-8 h-8"
					aria-label="Ver detalhes">
					<ArrowRight className="h-4 w-4 text-gray-900" />
				</NavLink>
			</div>
		);
	}


	return (
		<motion.div
			whileHover={{ y: -8 }}
			transition={{ duration: 0.3 }}
			className='hover:border-2 border-2 hover:border-ufac-blue-light shadow-2xl-ufac-blue-light edital-card bg-white rounded-[32px] shadow-md  border-gray-50 overflow-hidden h-full'>
			<div className='flex flex-col h-full p-4 sm:p-6 md:p-8 '>
				{/* Ícone no topo */}
				<div className='flex justify-between'>
					<div
						className={cn(
							'flex items-center justify-center rounded-full mb-auto',
							color,
							isMobile
								? 'w-12 h-12 min-w-[40px] min-h-[40px]'
								: 'w-14 h-14 min-w-[48px] min-h-[48px]'
						)}>
						{icon}
					</div>
				</div>

				{/* Espaço em branco */}
				<div className='flex-grow min-h-[8px] sm:min-h-[16px]'></div>

				{/* Conteúdo na parte inferior */}
				<div className='text-neutral-400 text-sm flex items-end items-center'>
					{(date &&<div className='flex items-center text-xs'>
						<CalendarDays
							size={16}
							className='mr-2'
						/>
						{date || ''}
					</div>)}
					{(hour && <div className='flex items-center'>
						{getClockIconByHour(hour)}
						{hour || ''}
					</div>)}
				</div>
				<div className='mt-auto'>
					<h3
						className={cn(
							'font-semibold text-ufac-blue-light mb-2 line-clamp-2',
							isMobile ? 'text-md' : 'text-lg'
						)}>
						{title || state?.title || 'Título não disponível'}
					</h3>
					<div className='flex justify-between '>
						<p
							className={cn(
								'text-gray-700 hyphens-auto break-words line-clamp-4',
								isMobile ? 'text-sm' : 'text-sm'
							)}>
							{description}
						</p>
						<NavLink
							to={href}
							className={cn(
								'rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-4 ml-4 self-end',
								isMobile ? 'w-10 h-10' : 'w-12 h-12'
							)}
							aria-label='Ver detalhes'>
							<ArrowRight
								className={
									isMobile ? 'h-5 w-5 text-gray-900' : 'h-6 w-6 text-gray-900'
								}
							/>
						</NavLink>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default EditalCard;
