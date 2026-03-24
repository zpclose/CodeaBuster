'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminImageProps {
  /** Admin image URL dari Firestore */
  adminSrc?: string | null;
  /** Fallback image URL jika admin belum set */
  defaultSrc?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  /** Aspect ratio untuk menghindari CLS */
  aspectRatio?: string;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Callback saat image loaded */
  onLoad?: () => void;
  /** Callback saat error */
  onError?: () => void;
  /** Custom skeleton class */
  skeletonClassName?: string;
  unoptimized?: boolean;
}

/**
 * AdminImage - Komponen image dengan strict priority + skeleton loading
 * 
 * Flow:
 * 1. Mount -> Tampilkan skeleton
 * 2. Preload image (adminSrc优先)
 * 3. Image loaded -> Fade in image, hide skeleton
 * 4. Tidak pernah render default image sampai adminSrc check selesai
 */
export function AdminImage({
  adminSrc,
  defaultSrc,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
  aspectRatio,
  objectFit = 'cover',
  onLoad,
  onError,
  skeletonClassName,
  unoptimized,
}: AdminImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  // Determine final source: admin优先, then default, then null
  const finalSrc = adminSrc || (adminSrc === undefined && defaultSrc ? defaultSrc : null);

  // Preload image
  useEffect(() => {
    if (!finalSrc) {
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    setIsPreloading(true);
    setHasError(false);

    const img = new Image();
    img.src = finalSrc;

    img.onload = () => {
      setIsLoaded(true);
      setIsPreloading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      setIsPreloading(false);
      // Jika adminSrc error, coba fallback ke defaultSrc
      if (adminSrc && defaultSrc && finalSrc === adminSrc) {
        const fallbackImg = new Image();
        fallbackImg.src = defaultSrc;
        fallbackImg.onload = () => {
          setHasError(false);
          setIsLoaded(true);
          onLoad?.();
        };
      } else {
        onError?.();
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [finalSrc, adminSrc, defaultSrc, onLoad, onError]);

  // Show skeleton saat: preloading, belum loaded, atau tidak ada src
  const showSkeleton = isPreloading || !isLoaded || !finalSrc;

  // Container style untuk aspect ratio
  const containerStyle: React.CSSProperties = {};
  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        fill && "absolute inset-0",
        !fill && aspectRatio && "w-full",
        className
      )}
      style={!fill ? containerStyle : undefined}
    >
      {/* Skeleton Layer */}
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

      {/* Image Layer - hanya render jika ada src dan sudah loaded */}
      {finalSrc && isLoaded && !hasError && (
        <Image
          src={finalSrc}
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
          style={{
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}

      {/* Error State - hanya tampil jika tidak ada fallback */}
      {hasError && !defaultSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
    </div>
  );
}

/**
 * Hook untuk menggunakan AdminImage dengan dynamic page images
 * Wraps useDynamicPageImages dengan loading state yang proper
 */
import { useDynamicPageImages } from '@/hooks/useDynamicPageImages';

interface UseAdminImageOptions {
  pageCategory: string;
  slotId: string;
  defaultSrc?: string;
}

export function useAdminImageSlot({ pageCategory, slotId, defaultSrc }: UseAdminImageOptions) {
  const { images, isLoading } = useDynamicPageImages(pageCategory);
  const dynamicImage = images[slotId];
  
  return {
    src: dynamicImage?.imageUrl || null,
    isCustom: dynamicImage?.isCustom || false,
    isLoading,
    description: dynamicImage?.description,
  };
}

/**
 * Batch preload multiple images
 */
export function usePreloadAdminImages(pageCategory: string, slotIds: string[]) {
  const { images, isLoading } = useDynamicPageImages(pageCategory);
  
  useEffect(() => {
    if (isLoading) return;
    
    slotIds.forEach(slotId => {
      const img = images[slotId];
      if (img?.imageUrl) {
        const preloadImg = new Image();
        preloadImg.src = img.imageUrl;
      }
    });
  }, [images, isLoading, slotIds]);

  return { images, isLoading };
}
