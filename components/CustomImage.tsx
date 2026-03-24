import React, { useState, useEffect } from 'react';

interface CustomImageProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const CustomImage: React.FC<CustomImageProps> = ({ 
  src, 
  alt, 
  width = 400, 
  height = 200, 
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoading(false);
    img.onerror = () => setIsLoading(false);
  }, [src]);

  return (
    <div 
      className={`relative ${className}`} 
      style={{ width, height }}
    >
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      
      {/* Image with fade-in effect */}
      {src && (
        <CustomImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`absolute inset-0 object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};

export default CustomImage;