import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'text-lg' | 'avatar' | 'button' | 'card' | 'custom';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  width, 
  height, 
  className = '',
  count = 1
}) => {
  const getSkeletonClass = () => {
    switch (type) {
      case 'text':
        return 'skeleton-text';
      case 'text-lg':
        return 'skeleton-text-lg';
      case 'avatar':
        return 'skeleton-avatar';
      case 'button':
        return 'skeleton-button';
      case 'card':
        return 'skeleton-card';
      default:
        return 'skeleton';
    }
  };

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  const skeletonElements = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${getSkeletonClass()} ${className}`}
      style={style}
      aria-hidden="true"
    />
  ));

  return count === 1 ? skeletonElements[0] : <div className="space-y-2">{skeletonElements}</div>;
};

export default SkeletonLoader;
