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
  /**
   * Jika true, gunakan strict mode: tidak pernah render image sampai preload selesai.
   * Jika false (legacy), gunakan behavior lama dengan onLoad handler.
   * @default true
   */
  strict?: boolean;
  /**
   * Image ID untuk menggunakan cache preload (opsional)
   */
  imageId?: string;
}

/**
 * ImageWithSkeleton - STRICT PRIORITY + PRELOAD
 * 
 * BEHAVIOR:
 * - Selalu tampilkan skeleton dulu sampai image fully preloaded
 * - Tidak pernah show image sampai benar-benar loaded di memory
 * - Smooth fade-in transition
 * - Tidak ada flash fallback/placeholder
 * 
 * CRITICAL:
 * - strict=true (default): Skeleton muncul sampai preload selesai
 * - strict=false: Legacy mode dengan onLoad handler (tidak recommended)
 * 
 * USAGE:
 *   <ImageWithSkeleton src={dynamicUrl} alt="Description" fill strict />
 * 
 * LEGACY (non-strict mode - NOT RECOMMENDED):
 *   <ImageWithSkeleton src={staticUrl} alt="Description" fill strict={false} />
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
  strict = true,
  imageId,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  const getCachedUrl = (id: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('preload-image-cache');
      if (!stored) return null;
      const data = JSON.parse(stored);
      const img = data.images?.find((i: any) => i.id === id);
      return img?.url || null;
    } catch { return null; }
  };

  // Strict mode: Preload sebelum render
  useEffect(() => {
    if (!strict) {
      // Legacy mode: langsung set displaySrc, gunakan onLoad dari Next.js Image
      setDisplaySrc(src || fallback);
      setIsLoaded(false);
      return;
    }

    // Check cache first if imageId provided
    if (imageId) {
      const cachedUrl = getCachedUrl(imageId);
      if (cachedUrl) {
        setDisplaySrc(cachedUrl);
        setIsLoaded(true);
        setIsPreloading(false);
        return;
      }
    }

    if (!src) {
      setDisplaySrc(null);
      setIsLoaded(false);
      setIsPreloading(false);
      return;
    }

    setIsLoaded(false);
    setHasError(false);
    setIsPreloading(true);

    const img = new (window.Image as any)();
    img.src = src;

    img.onload = () => {
      setDisplaySrc(src);
      setIsLoaded(true);
      setIsPreloading(false);
    };

    img.onerror = () => {
      // Try fallback if main src fails
      if (fallback && src !== fallback) {
        const fallbackImg = new (window.Image as any)();
        fallbackImg.src = fallback;
        fallbackImg.onload = () => {
          setDisplaySrc(fallback);
          setIsLoaded(true);
          setIsPreloading(false);
        };
        fallbackImg.onerror = () => {
          setHasError(true);
          setIsPreloading(false);
        };
      } else {
        setHasError(true);
        setIsPreloading(false);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback, strict]);

  const showSkeleton = strict 
    ? (isPreloading || !isLoaded || !displaySrc)
    : !isLoaded;

  // Legacy mode: handle onLoad dari Next.js Image
  const handleLoad = () => {
    if (!strict) {
      setIsLoaded(true);
    }
  };

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

      {/* Image Layer - ONLY render after preload success in strict mode */}
      {displaySrc && (strict ? isLoaded : true) && !hasError && (
        <Image
          src={displaySrc}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          sizes={sizes}
          unoptimized={unoptimized}
          onLoad={!strict ? handleLoad : undefined}
          className={cn(
            "transition-opacity duration-300",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'none' && "object-none",
          )}
          style={{ opacity: (strict ? isLoaded : true) ? 1 : 0 }}
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
