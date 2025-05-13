
import { cn } from '@/lib/utils';
import React from 'react';

type LoadingIconState = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'all';

interface LoadingIconProps {
  state?: LoadingIconState;
  className?: string;
  size?: number;
}

const LoadingIcon: React.FC<LoadingIconProps> = ({ 
  state = 'all',
  className,
  size = 31
}) => {
  const fillTopLeft = state === 'topLeft' || state === 'all' ? '#294DEF' : '#E0E0E0';
  const fillTopRight = state === 'topRight' || state === 'all' ? '#FFD129' : '#E0E0E0';
  const fillBottomLeft = state === 'bottomLeft' || state === 'all' ? '#294DEF' : '#E0E0E0';
  const fillBottomRight = state === 'bottomRight' || state === 'all' ? '#FFD129' : '#E0E0E0';

  return (
    <svg 
      width={size} 
      height={Math.round(size * 1.1)} 
      viewBox="0 0 31 34" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path d="M15.1882 3.89178H3.53802V16.6792H15.1882V3.89178Z" fill={fillTopLeft}/>
      <path d="M15.1882 29.4413C15.879 29.374 16.5444 29.2729 17.1847 29.1381C21.5061 28.2788 24.4123 26.0802 25.8023 22.618C26.1055 21.8851 26.3582 21.0512 26.5351 20.1667V20.0909C26.712 19.1811 26.8131 18.1955 26.8384 17.1846V17.1341V16.6792H15.1882V29.4413Z" fill={fillBottomLeft}/>
      <path d="M30.3764 0H15.1882V3.89182H26.8384V16.6792H30.3764V0Z" fill={fillTopRight}/>
      <path d="M15.0871 29.4666C14.1268 29.4161 13.2423 29.315 12.4083 29.1381C9.98227 28.6579 8.01109 27.5965 6.59588 26.0044C4.72578 23.9321 3.71492 20.8996 3.53802 16.9572V16.6792H0V17.0583C0.429617 27.1922 5.1554 32.9288 15.0619 33.3584C15.0955 33.3584 15.1292 33.3584 15.1629 33.3584C15.1882 33.3332 15.1882 33.3332 15.1882 33.3079V29.4413C15.1545 29.4413 15.1208 29.4498 15.0871 29.4666Z" fill={fillBottomRight}/>
    </svg>
  );
};

export default LoadingIcon;
