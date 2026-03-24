'use client';

/**
 * StrictImage - Wrapper component untuk strict priority image loading
 * 
 * Menggabungkan useStrictPageImages dengan AdminImage untuk menghindari
 * flash default image saat loading.
 * 
 * USAGE:
 *   <StrictImage slotId="hero-main" pageCategory="home" alt="Hero" fill />
 * 
 * atau dengan custom fallback:
 *   <StrictImage 
 *     slotId="hero-main" 
 *     pageCategory="home" 
 *     fallbackSrc="/custom-fallback.jpg"
 *     alt="Hero" 
 *     fill 
 *   />
 */

import { AdminImage } from './admin-image';
import { useStrictPageImages } from '@/hooks/useStrictPageImages';
import { useMemo } from 'react';

interface StrictImageProps {
  /** Slot ID dari placeholder-images.json */
  slotId: string;
  /** Page category (home, about, programs, dll) */
  pageCategory: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  /** Override fallback URL (default: dari placeholder-images.json) */
  fallbackSrc?: string;
  skeletonClassName?: string;
  unoptimized?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function StrictImage({
  slotId,
  pageCategory,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
  fallbackSrc,
  skeletonClassName,
  unoptimized,
  objectFit = 'cover',
  aspectRatio,
  onLoad,
  onError,
}: StrictImageProps) {
  const { images, isLoading } = useStrictPageImages(pageCategory);
  
  const imageData = useMemo(() => images[slotId], [images, slotId]);
  
  // Determine URLs
  const adminUrl = imageData?.adminUrl || null;
  const defaultUrl = fallbackSrc || imageData?.placeholderUrl || '';
  
  return (
    <AdminImage
      adminSrc={adminUrl}
      defaultSrc={defaultUrl}
      isLoading={isLoading}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      skeletonClassName={skeletonClassName}
      unoptimized={unoptimized}
      objectFit={objectFit}
      aspectRatio={aspectRatio}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

/**
 * StrictImage.Slot - Alternative API yang lebih eksplisit
 * 
 * Usage:
 *   <StrictImage.Slot id="hero-main" category="home" alt="Hero" fill />
 */
interface StrictImageSlotProps extends Omit<StrictImageProps, 'slotId' | 'pageCategory'> {
  id: string;
  category: string;
}

function StrictImageSlot(props: StrictImageSlotProps) {
  const { id, category, ...rest } = props;
  return <StrictImage slotId={id} pageCategory={category} {...rest} />;
}

StrictImage.Slot = StrictImageSlot;

/**
 * Hook untuk prefetch multiple images di page level
 * 
 * Usage:
 *   function MyPage() {
 *     usePrefetchStrictImages('home', ['hero', 'about', 'feature-1']);
 *     return <div>...</div>;
 *   }
 */
export function usePrefetchStrictImages(pageCategory: string, slotIds: string[]) {
  // Hook ini memicu fetch di useStrictPageImages
  const { isLoading } = useStrictPageImages(pageCategory);
  return { isLoading };
}
