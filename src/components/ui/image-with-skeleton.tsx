'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  fallback?: string;
  skeletonClassName?: string;
  unoptimized?: boolean;
}

export default function ImageWithSkeleton({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
  fallback = '/placeholder-image.jpg',
  unoptimized,
}: ImageWithSkeletonProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      sizes={sizes}
      unoptimized={unoptimized}
      className={className}
    />
  );
}
