
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
  onAnimationComplete?: () => void;
}

const AnimatedLogoIcon: React.FC<AnimatedLogoIconProps> = ({ 
  className,
  size = 31,
  animate = true,
  onAnimationComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
    }
  }, [animate]);
  
  // Adjusted animation variants to make them more consistent with loading animation
  const topLeftVariants = {
    initial: { y: 0, opacity: 1, fill: "#294DEF" },
    animate: { 
      y: [-5, 0], 
      opacity: 1,
      fill: ["#294DEF", "#E0E0E0"],
      transition: { 
        y: { duration: 0.8, ease: "easeOut" },
        fill: { duration: 0.3, delay: 0.5 }
      }
    }
  };
  
  const topRightVariants = {
    initial: { y: 0, opacity: 1, fill: "#FFD129" },
    animate: { 
      y: [-8, 0], 
      opacity: 1,
      fill: ["#FFD129", "#E0E0E0"],
      transition: { 
        y: { duration: 1, ease: "easeOut", delay: 0.1 },
        fill: { duration: 0.3, delay: 0.7 }
      }
    }
  };
  
  const bottomLeftVariants = {
    initial: { y: 0, opacity: 1, fill: "#294DEF" },
    animate: { 
      y: [-6, 0], 
      opacity: 1,
      fill: ["#294DEF", "#E0E0E0"],
      transition: { 
        y: { duration: 0.7, ease: "easeOut", delay: 0.2 },
        fill: { duration: 0.3, delay: 0.4 }
      }
    }
  };
  
  const bottomRightVariants = {
    initial: { y: 0, opacity: 1, fill: "#FFD129" },
    animate: { 
      y: [-7, 0], 
      opacity: 1,
      fill: ["#FFD129", "#E0E0E0"],
      transition: { 
        y: { duration: 0.9, ease: "easeOut", delay: 0.3 },
        fill: { duration: 0.3, delay: 0.6 }
      }
    }
  };

  // This function will be called when all animations complete
  const handleAllAnimationsComplete = () => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <svg 
      width={size} 
      height={Math.round(size * 1.1)} 
      viewBox="0 0 31 34" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <motion.path 
        d="M15.1882 3.89178H3.53802V16.6792H15.1882V3.89178Z" 
        variants={topLeftVariants}
        initial="initial"
        animate={isAnimating ? "animate" : "initial"}
      />
      <motion.path 
        d="M15.1882 29.4413C15.879 29.374 16.5444 29.2729 17.1847 29.1381C21.5061 28.2788 24.4123 26.0802 25.8023 22.618C26.1055 21.8851 26.3582 21.0512 26.5351 20.1667V20.0909C26.712 19.1811 26.8131 18.1955 26.8384 17.1846V17.1341V16.6792H15.1882V29.4413Z" 
        variants={bottomLeftVariants}
        initial="initial"
        animate={isAnimating ? "animate" : "initial"}
      />
      <motion.path 
        d="M30.3764 0H15.1882V3.89182H26.8384V16.6792H30.3764V0Z" 
        variants={topRightVariants}
        initial="initial"
        animate={isAnimating ? "animate" : "initial"}
      />
      <motion.path 
        d="M15.0871 29.4666C14.1268 29.4161 13.2423 29.315 12.4083 29.1381C9.98227 28.6579 8.01109 27.5965 6.59588 26.0044C4.72578 23.9321 3.71492 20.8996 3.53802 16.9572V16.6792H0V17.0583C0.429617 27.1922 5.1554 32.9288 15.0619 33.3584C15.0955 33.3584 15.1292 33.3584 15.1629 33.3584C15.1882 33.3332 15.1882 33.3332 15.1882 33.3079V29.4413C15.1545 29.4413 15.1208 29.4498 15.0871 29.4666Z" 
        variants={bottomRightVariants}
        initial="initial"
        animate={isAnimating ? "animate" : "initial"}
        onAnimationComplete={handleAllAnimationsComplete}
      />
    </svg>
  );
};

export default AnimatedLogoIcon;
