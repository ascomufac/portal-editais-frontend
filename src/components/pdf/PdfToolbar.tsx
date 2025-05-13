import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Minus, Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FitType } from './utils/pdfUtils';

interface PdfToolbarProps {
	displayFileName: string;
	scale: number;
	setScale: (scale: number) => void;
	fitType: FitType;
	setFitType: (type: FitType) => void;
	fileUrl: string;
	searchComponent: React.ReactNode;
	thumbnailToggle?: React.ReactNode; // New prop for thumbnail toggle button
}

const PdfToolbar: React.FC<PdfToolbarProps> = ({
	displayFileName,
	scale,
	setScale,
	fitType,
	setFitType,
	fileUrl,
	searchComponent,
	thumbnailToggle,
}) => {
	const navigate = useNavigate();

	// Calculate and pass the new scale value directly
	const zoomIn = () => {
		const newScale = Math.min(scale + 0.1, 3.0);
		setScale(newScale);
	};

	const zoomOut = () => {
		const newScale = Math.max(scale - 0.1, 0.1);
		setScale(newScale);
	};

	const handleGoBack = () => {
		navigate(-1); // Navigate to the previous page in history
	};

	return (
		<div className='w-full bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4 shadow-2xl z-10'>
			<div className='ml-10 flex items-center gap-3'>
				<div className='border-r-[1px] border-gray-300 pr-2'>
					<Button
						variant='ghost'
						size='sm'
						className='flex items-center text-gray-600 hover:text-gray-900 '
						onClick={handleGoBack}>
						<ArrowLeft
							size={16}
							className='mr-1'
						/>
						Voltar
					</Button>
				</div>
				<span className='font-medium truncate max-w-[320px] text-gray-500'>
					{displayFileName}
				</span>

				{/* Thumbnail toggle button */}
				{thumbnailToggle}

				<div className='flex items-center gap-1 ml-2 border-x-[1px] border-gray-300 px-2'>
					<Button
						variant='ghost'
						className='rounded-full'
						size='icon'
						onClick={zoomOut}>
						<Minus className='h-4 w-4' />
					</Button>

					<span className='min-w-[60px] text-center text-sm'>
						{Math.round(scale * 100)}%
					</span>

					<Button
						variant='ghost'
						className='rounded-full'
						size='icon'
						onClick={zoomIn}>
						<Plus className='h-4 w-4' />
					</Button>
        </div>
        <div className='px-2'>

				{searchComponent}
        </div>
			</div>
			<Button
				size='sm'
				className='bg-ufac-blue ml-20'
				asChild>
				<a
					href={fileUrl}
					download
					target='_blank'
					rel='noopener noreferrer'
					className=''>
					<Download className='h-4 w-4 mr-1 ' />
					Baixar
				</a>
			</Button>
		</div>
	);
};

export default PdfToolbar;
