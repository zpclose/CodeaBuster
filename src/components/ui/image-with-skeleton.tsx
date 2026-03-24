'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

/**
 * ImageWithSkeleton - Updated with strict priority + skeleton loading
 * 
 * CHANGES:
 * - Always show skeleton first until image is fully loaded
 * - Never show fallback/placeholder image until admin image check is done
 * - Preload image before displaying
 * - Smooth fade-in transition
 */
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
  skeletonClassName,
  unoptimized,
  objectFit = 'cover',
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);

  // Preload logic: wait until image is actually loaded before showing
  useEffect(() => {
    if (!src) {
      setDisplaySrc(null);
      setIsLoaded(false);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setDisplaySrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      // Try fallback if main src fails
      if (fallback && src !== fallback) {
        const fallbackImg = new Image();
        fallbackImg.src = fallback;
        fallbackImg.onload = () => {
          setDisplaySrc(fallback);
          setIsLoaded(true);
        };
        fallbackImg.onerror = () => {
          setHasError(true);
        };
      } else {
        setHasError(true);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  const showSkeleton = !isLoaded || !displaySrc;

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        fill && "absolute inset-0 w-full h-full",
        className
      )}
    >
      {/* Skeleton Layer - Always show until loaded */}
      {showSkeleton && (
        <div 
          className={cn(
            "absolute inset-0 animate-pulse bg-muted",
            skeletonClassName
          )}
          aria-hidden="true"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Image Layer - Only show when fully loaded */}
      {displaySrc && isLoaded && !hasError && (
        <Image
          src={displaySrc}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          sizes={sizes}
          unoptimized={unoptimized}
          className={cn(
            "transition-opacity duration-300",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'none' && "object-none",
          )}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-xs text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  );
}
