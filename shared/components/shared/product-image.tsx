import { cn } from '@/shared/lib/utils';
import React from 'react';

interface Props {
  className?: string;
  imageUrl: string;
}

export const ProductImage: React.FC<Props> = ({ imageUrl, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center flex-1 relative w-full',
        className
      )}
    >
      <img
        src={imageUrl}
        alt="Product"
        className={cn(
          'max-w-[500px] max-h-[500px] w-full h-auto',
          'relative left-2 top-2 transition-all z-10 duration-300',
          'object-contain'
        )}
      />
    </div>
  );
};
