'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useDynamicPageImages } from '@/hooks/useDynamicPageImages';
import { useStrictPageImages } from '@/hooks/useStrictPageImages';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface AdminImageBaseProps {
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  onLoad?: () => void;
  onError?: () => void;
  skeletonClassName?: string;
  unoptimized?: boolean;
  /** Duration fade-in dalam ms */
  fadeInDuration?: number;
}

interface AdminImageWithSlotProps extends AdminImageBaseProps {
  /** Slot ID dari placeholder-images.ts */
  slotId: string;
  /** Page category untuk fetch (home, about, programs, dll) */
  pageCategory: string;
  /** Override src - jika provided, tidak fetch dari Firestore */
  src?: never;
  /** Override adminSrc - jika provided, tidak fetch dari Firestore */
  adminSrc?: never;
  defaultSrc?: never;
  isLoading?: never;
}

interface AdminImageWithSrcProps extends AdminImageBaseProps {
  /** Direct URL - digunakan untuk static images */
  src: string;
  slotId?: never;
  pageCategory?: never;
  adminSrc?: never;
  defaultSrc?: never;
  isLoading?: never;
}

interface AdminImageWithAdminSrcProps extends AdminImageBaseProps {
  /** Admin image URL dari Firestore */
  adminSrc: string | null;
  /** Fallback image URL jika admin null */
  defaultSrc: string;
  /** Loading state dari hook */
  isLoading?: boolean;
  slotId?: never;
  pageCategory?: never;
  src?: never;
}

type AdminImageProps = AdminImageWithSlotProps | AdminImageWithSrcProps | AdminImageWithAdminSrcProps;

// ============================================================================
// HELPER: Image Preloader
// ============================================================================

interface PreloadResult {
  success: boolean;
  url: string | null;
}

function preloadImage(url: string): Promise<PreloadResult> {
  return new Promise((resolve) => {
    const img = new globalThis.Image();
    img.src = url;
    
    img.onload = () => resolve({ success: true, url });
    img.onerror = () => resolve({ success: false, url: null });
    
    // Timeout 10 detik
    setTimeout(() => resolve({ success: false, url: null }), 10000);
  });
}

// ============================================================================
// MAIN COMPONENT: AdminImage
// ============================================================================

/**
 * AdminImage - Komponen image dengan STRICT PRIORITY + SKELETON LOADING
 * 
 * BEHAVIOR:
 * 1. Selalu tampilkan skeleton saat isLoading = true ATAU image belum preload
 * 2. Hanya tampilkan image setelah preload berhasil
 * 3. Tidak pernah flash default image - skeleton sampai admin image ready
 * 
 * USAGE MODES:
 * 
 * Mode 1: Auto-fetch dengan slotId + pageCategory (RECOMMENDED)
 *   <AdminImage slotId="hero-main" pageCategory="home" alt="Hero" fill />
 * 
 * Mode 2: Manual adminSrc + defaultSrc + isLoading
 *   const { adminUrl, placeholderUrl, isLoading } = useStrictImageSlot('home', 'hero');
 *   <AdminImage adminSrc={adminUrl} defaultSrc={placeholderUrl} isLoading={isLoading} alt="Hero" fill />
 * 
 * Mode 3: Direct src (untuk static images)
 *   <AdminImage src="/static/image.jpg" alt="Static" fill />
 */
export function AdminImage(props: AdminImageProps) {
  // Determine mode
  const isSlotMode = 'slotId' in props && props.slotId !== undefined;
  const isDirectMode = 'src' in props && props.src !== undefined;
  
  if (isSlotMode) {
    return <AdminImageWithSlot {...props as AdminImageWithSlotProps} />;
  }
  
  if (isDirectMode) {
    return <AdminImageWithDirectSrc {...props as AdminImageWithSrcProps} />;
  }
  
  return <AdminImageWithAdminSrc {...props as AdminImageWithAdminSrcProps} />;
}

// ============================================================================
// SUB-COMPONENT: Slot Mode (Auto-fetch dari Firestore)
// ============================================================================

function AdminImageWithSlot({
  slotId,
  pageCategory,
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
  fadeInDuration = 300,
}: AdminImageWithSlotProps) {
  // Gunakan strict mode hook
  const { images, isLoading: isFetching } = useStrictPageImages(pageCategory);
  const imageData = images[slotId];
  
  // State untuk preload
  const [preloadState, setPreloadState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  
  // Effect: Preload image saat data tersedia
  useEffect(() => {
    // Reset state saat slot berubah
    setPreloadState('idle');
    setDisplayUrl(null);
    
    if (isFetching || !imageData) {
      return;
    }
    
    const urlToLoad = imageData.adminUrl || imageData.placeholderUrl;
    
    if (!urlToLoad) {
      setPreloadState('error');
      onError?.();
      return;
    }
    
    setPreloadState('loading');
    
    preloadImage(urlToLoad).then((result) => {
      if (result.success) {
        setDisplayUrl(result.url);
        setPreloadState('success');
        onLoad?.();
      } else {
        // Coba fallback ke placeholder jika admin image gagal
        if (imageData.adminUrl && imageData.adminUrl !== imageData.placeholderUrl) {
          preloadImage(imageData.placeholderUrl).then((fallbackResult) => {
            if (fallbackResult.success) {
              setDisplayUrl(fallbackResult.url);
              setPreloadState('success');
              onLoad?.();
            } else {
              setPreloadState('error');
              onError?.();
            }
          });
        } else {
          setPreloadState('error');
          onError?.();
        }
      }
    });
  }, [slotId, pageCategory, imageData, isFetching, onLoad, onError]);
  
  // Skeleton muncul saat: fetching dari Firestore ATAU preloading
  const showSkeleton = isFetching || preloadState === 'idle' || preloadState === 'loading';
  const showImage = preloadState === 'success' && displayUrl;
  const isError = preloadState === 'error';
  
  // Container style
  const containerStyle: React.CSSProperties = {};
  if (aspectRatio && !fill) {
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
      style={containerStyle}
    >
      {/* Skeleton Layer */}
      {showSkeleton && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            skeletonClassName
          )}
          aria-hidden="true"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}
      
      {/* Error State */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-xs text-muted-foreground">Failed to load image</span>
        </div>
      )}
      
      {/* Image Layer - hanya render setelah preload success */}
      {showImage && (
        <Image
          src={displayUrl}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          sizes={sizes}
          unoptimized={unoptimized}
          className={cn(
            "transition-opacity",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'none' && "object-none",
          )}
          style={{
            opacity: 1,
            transitionDuration: `${fadeInDuration}ms`,
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: Direct Src Mode
// ============================================================================

function AdminImageWithDirectSrc({
  src,
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
  fadeInDuration = 300,
}: AdminImageWithSrcProps) {
  const [preloadState, setPreloadState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    setPreloadState('loading');
    
    preloadImage(src).then((result) => {
      if (result.success) {
        setPreloadState('success');
        onLoad?.();
      } else {
        setPreloadState('error');
        onError?.();
      }
    });
  }, [src, onLoad, onError]);
  
  const showSkeleton = preloadState === 'idle' || preloadState === 'loading';
  const showImage = preloadState === 'success';
  const isError = preloadState === 'error';
  
  const containerStyle: React.CSSProperties = {};
  if (aspectRatio && !fill) {
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
      style={containerStyle}
    >
      {showSkeleton && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            skeletonClassName
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}
      
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
      
      {showImage && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          sizes={sizes}
          unoptimized={unoptimized}
          className={cn(
            "transition-opacity",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'none' && "object-none",
          )}
          style={{ transitionDuration: `${fadeInDuration}ms` }}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: AdminSrc Mode (Manual)
// ============================================================================

function AdminImageWithAdminSrc({
  adminSrc,
  defaultSrc,
  isLoading = false,
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
  fadeInDuration = 300,
}: AdminImageWithAdminSrcProps) {
  const [preloadState, setPreloadState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  
  useEffect(() => {
    setPreloadState('idle');
    setDisplayUrl(null);
    
    if (isLoading) {
      return;
    }
    
    const urlToLoad = adminSrc || defaultSrc;
    
    if (!urlToLoad) {
      setPreloadState('error');
      onError?.();
      return;
    }
    
    setPreloadState('loading');
    
    preloadImage(urlToLoad).then((result) => {
      if (result.success) {
        setDisplayUrl(result.url);
        setPreloadState('success');
        onLoad?.();
      } else {
        // Coba fallback
        if (adminSrc && defaultSrc && urlToLoad === adminSrc) {
          preloadImage(defaultSrc).then((fallbackResult) => {
            if (fallbackResult.success) {
              setDisplayUrl(fallbackResult.url);
              setPreloadState('success');
              onLoad?.();
            } else {
              setPreloadState('error');
              onError?.();
            }
          });
        } else {
          setPreloadState('error');
          onError?.();
        }
      }
    });
  }, [adminSrc, defaultSrc, isLoading, onLoad, onError]);
  
  const showSkeleton = isLoading || preloadState === 'idle' || preloadState === 'loading';
  const showImage = preloadState === 'success' && displayUrl;
  const isError = preloadState === 'error';
  
  const containerStyle: React.CSSProperties = {};
  if (aspectRatio && !fill) {
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
      style={containerStyle}
    >
      {showSkeleton && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            skeletonClassName
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}
      
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
      
      {showImage && (
        <Image
          src={displayUrl}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          sizes={sizes}
          unoptimized={unoptimized}
          className={cn(
            "transition-opacity",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'none' && "object-none",
          )}
          style={{ transitionDuration: `${fadeInDuration}ms` }}
        />
      )}
    </div>
  );
}

// ============================================================================
// HOOK: useAdminImageSlot (Convenience hook)
// ============================================================================

interface UseAdminImageSlotResult {
  adminUrl: string | null;
  defaultUrl: string;
  isLoading: boolean;
  isCustom: boolean;
  description: string;
  imageHint: string;
}

/**
 * Hook untuk mengambil single slot image dengan strict loading
 * 
 * Usage:
 *   const { adminUrl, defaultUrl, isLoading } = useAdminImageSlot('home', 'hero-main');
 *   <AdminImage adminSrc={adminUrl} defaultSrc={defaultUrl} isLoading={isLoading} ... />
 */
export function useAdminImageSlot(
  pageCategory: string, 
  slotId: string
): UseAdminImageSlotResult {
  const { images, isLoading } = useStrictPageImages(pageCategory);
  const image = images[slotId];
  
  return {
    adminUrl: image?.adminUrl || null,
    defaultUrl: image?.placeholderUrl || '',
    isLoading: isLoading || image?.isLoading || false,
    isCustom: image?.isCustom || false,
    description: image?.description || '',
    imageHint: image?.imageHint || '',
  };
}

// ============================================================================
// HOOK: usePreloadAdminImages (Batch preload)
// ============================================================================

/**
 * Preload multiple images untuk page
 * 
 * Usage:
 *   usePreloadAdminImages('home', ['hero-main', 'about-section', 'feature-1']);
 */
export function usePreloadAdminImages(pageCategory: string, slotIds: string[]) {
  const { images, isLoading } = useStrictPageImages(pageCategory);
  
  useEffect(() => {
    if (isLoading) return;
    
    slotIds.forEach(slotId => {
      const img = images[slotId];
      if (img?.adminUrl) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.adminUrl;
        document.head.appendChild(link);
      }
    });
  }, [images, isLoading, slotIds]);
  
  return { images, isLoading };
}

// ============================================================================
// LEGACY: Backward compatible AdminImageRaw
// ============================================================================

interface AdminImageRawProps {
  adminSrc?: string | null;
  defaultSrc?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  onLoad?: () => void;
  onError?: () => void;
  skeletonClassName?: string;
  unoptimized?: boolean;
}

/**
 * @deprecated Gunakan AdminImage utama dengan slotId atau src props
 * 
 * Legacy component untuk backward compatibility
 */
export function AdminImageRaw({
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
}: AdminImageRawProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  const finalSrc = adminSrc || (adminSrc === undefined && defaultSrc ? defaultSrc : null);

  useEffect(() => {
    if (!finalSrc) {
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    setIsPreloading(true);
    setHasError(false);

    const img = new globalThis.Image();
    img.src = finalSrc;

    img.onload = () => {
      setIsLoaded(true);
      setIsPreloading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      setIsPreloading(false);
      if (adminSrc && defaultSrc && finalSrc === adminSrc) {
        const fallbackImg = new globalThis.Image();
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

  const showSkeleton = isPreloading || !isLoaded || !finalSrc;

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
      {showSkeleton && (
        <div 
          className={cn(
            "absolute inset-0 animate-pulse bg-muted",
            skeletonClassName
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}

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
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}

      {hasError && !defaultSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
    </div>
  );
}
