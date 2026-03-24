import { useState, useEffect, useCallback } from 'react';
import { useAdminImage } from '../hooks/useAdminImage';
import './AdminImage.css';

/**
 * AdminImage - Komponen image dengan strict priority + skeleton loading
 * 
 * @param {string} imageKey - Key untuk mengidentifikasi slot image (logo, hero, about, dll)
 * @param {string} defaultSrc - Fallback image hanya jika admin belum set apa-apa
 * @param {string} alt - Alt text
 * @param {string} className - Class tambahan
 * @param {object} style - Style tambahan
 * @param {string} aspectRatio - Aspect ratio untuk menghindari CLS ('16/9', '1/1', '4/3')
 * @param {string} objectFit - 'cover', 'contain', 'fill'
 * @param {function} onLoad - Callback saat image loaded
 */
export const AdminImage = ({
  imageKey,
  defaultSrc,
  alt = '',
  className = '',
  style = {},
  aspectRatio = '16/9',
  objectFit = 'cover',
  onLoad,
  ...imgProps
}) => {
  const { imageUrl, isLoading: isFetching, error } = useAdminImage(imageKey);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  // Preload image sebelum ditampilkan
  useEffect(() => {
    const finalSrc = imageUrl || defaultSrc;
    
    if (!finalSrc || isFetching) {
      setIsImageLoaded(false);
      return;
    }

    setIsPreloading(true);
    
    const img = new Image();
    img.src = finalSrc;
    
    img.onload = () => {
      setIsImageLoaded(true);
      setIsPreloading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setIsPreloading(false);
      // Jika error, coba fallback ke default (hanya jika admin image yang error)
      if (imageUrl && defaultSrc) {
        const fallbackImg = new Image();
        fallbackImg.src = defaultSrc;
        fallbackImg.onload = () => {
          setIsImageLoaded(true);
          onLoad?.();
        };
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, defaultSrc, isFetching, onLoad]);

  // Determine final src yang akan ditampilkan
  const finalSrc = imageUrl || (!isFetching ? defaultSrc : null);
  const showSkeleton = isFetching || isPreloading || !isImageLoaded;
  const showImage = isImageLoaded && finalSrc;

  return (
    <div 
      className={`admin-image-container ${className}`}
      style={{ 
        aspectRatio,
        ...style 
      }}
    >
      {/* Skeleton Layer - Selalu ada saat loading */}
      {showSkeleton && (
        <div className="admin-image-skeleton" aria-hidden="true">
          <div className="admin-image-shimmer" />
        </div>
      )}

      {/* Image Layer - Hanya muncul setelah loaded */}
      {showImage && (
        <img
          src={finalSrc}
          alt={alt}
          className={`admin-image ${showImage ? 'admin-image--visible' : ''}`}
          style={{ objectFit }}
          {...imgProps}
        />
      )}

      {/* Error State */}
      {error && !defaultSrc && (
        <div className="admin-image-error">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

/**
 * AdminImage.Static - Variant untuk image yang URL-nya sudah diketahui
 * (Tanpa fetch dari backend)
 */
export const StaticAdminImage = ({
  src,
  defaultSrc,
  alt = '',
  className = '',
  style = {},
  aspectRatio = '16/9',
  objectFit = 'cover',
  onLoad,
  ...imgProps
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const finalSrc = src || defaultSrc;

  useEffect(() => {
    if (!finalSrc) return;
    
    const img = new Image();
    img.src = finalSrc;
    
    img.onload = () => {
      setIsImageLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      // Coba fallback
      if (src && defaultSrc && src !== defaultSrc) {
        const fallbackImg = new Image();
        fallbackImg.src = defaultSrc;
        fallbackImg.onload = () => {
          setIsImageLoaded(true);
          onLoad?.();
        };
        fallbackImg.onerror = () => setHasError(true);
      }
    };
  }, [finalSrc, src, defaultSrc, onLoad]);

  const showSkeleton = !isImageLoaded && !hasError;
  const showImage = isImageLoaded && finalSrc;

  return (
    <div 
      className={`admin-image-container ${className}`}
      style={{ aspectRatio, ...style }}
    >
      {showSkeleton && (
        <div className="admin-image-skeleton" aria-hidden="true">
          <div className="admin-image-shimmer" />
        </div>
      )}
      
      {showImage && (
        <img
          src={finalSrc}
          alt={alt}
          className="admin-image admin-image--visible"
          style={{ objectFit }}
          {...imgProps}
        />
      )}
      
      {hasError && !defaultSrc && (
        <div className="admin-image-error">
          <span>Failed to load</span>
        </div>
      )}
    </div>
  );
};
