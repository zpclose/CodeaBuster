import Image from 'next/image';
import { useState } from 'react';
import type { ReactEventHandler } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  onError?: ReactEventHandler<HTMLImageElement>;
  onLoad?: () => void;
}

export default function SafeImage({
  src,
  alt,
  fallback = '/placeholder-image.jpg',
  className,
  fill,
  width,
  height,
  priority,
  sizes,
  onError,
  onLoad,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError: ReactEventHandler<HTMLImageElement> = (error) => {
    if (!hasError && imgSrc !== fallback) {
      console.warn('Image failed to load, using fallback:', { originalSrc: src, fallback });
      setImgSrc(fallback);
      setHasError(true);
      if (onError) onError(error);
    }
  };

  const handleLoad = () => {
    if (!hasError && onLoad) {
      onLoad();
    }
  };

  // Reset state if src changes
  if (src !== imgSrc && !hasError) {
    setImgSrc(src);
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}