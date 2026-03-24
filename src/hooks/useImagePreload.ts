'use client';

import { useEffect, useState, useCallback } from 'react';
import { hasPreloadConsent, clearPreloadData } from '@/components/ui/cookie-consent';

const PRELOAD_DATA_KEY = 'preload-image-cache';
const PRELOAD_TIMESTAMP_KEY = 'preload-timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 jam

interface PreloadImage {
  id: string;
  url: string;
  timestamp: number;
}

interface PreloadData {
  images: PreloadImage[];
  lastUpdated: number;
}

export function useImagePreload() {
  const [isPreloading, setIsPreloading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasConsent = hasPreloadConsent();
    if (!hasConsent) {
      setIsReady(true);
      return;
    }

    const timestamp = localStorage.getItem(PRELOAD_TIMESTAMP_KEY);
    if (timestamp) {
      const isExpired = Date.now() - parseInt(timestamp) > CACHE_DURATION;
      if (isExpired) {
        clearPreloadData();
        localStorage.setItem(PRELOAD_TIMESTAMP_KEY, Date.now().toString());
      }
    } else {
      localStorage.setItem(PRELOAD_TIMESTAMP_KEY, Date.now().toString());
    }
    setIsReady(true);
  }, []);

  const preloadImages = useCallback(async (imageIds: string[]) => {
    if (typeof window === 'undefined') return;
    if (!hasPreloadConsent()) return;
    
    setIsPreloading(true);
    try {
      const response = await fetch(`/api/images/preload?ids=${imageIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        const existingData = localStorage.getItem(PRELOAD_DATA_KEY);
        const existing: PreloadData = existingData ? JSON.parse(existingData) : { images: [], lastUpdated: 0 };
        
        const newImages = data.images || [];
        const mergedImages = [...existing.images];
        
        newImages.forEach((img: PreloadImage) => {
          const idx = mergedImages.findIndex(i => i.id === img.id);
          if (idx >= 0) {
            mergedImages[idx] = img;
          } else {
            mergedImages.push(img);
          }
        });

        localStorage.setItem(PRELOAD_DATA_KEY, JSON.stringify({
          images: mergedImages,
          lastUpdated: Date.now(),
        }));
        localStorage.setItem(PRELOAD_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to preload images:', error);
    } finally {
      setIsPreloading(false);
    }
  }, []);

  const getCachedImageUrl = useCallback((id: string): string | null => {
    if (typeof window === 'undefined') return null;
    if (!hasPreloadConsent()) return null;

    const stored = localStorage.getItem(PRELOAD_DATA_KEY);
    if (!stored) return null;

    const data: PreloadData = JSON.parse(stored);
    const image = data.images.find(img => img.id === id);
    return image?.url || null;
  }, []);

  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    clearPreloadData();
    localStorage.removeItem(PRELOAD_TIMESTAMP_KEY);
  }, []);

  return {
    isReady,
    isPreloading,
    preloadImages,
    getCachedImageUrl,
    clearCache,
    hasConsent: hasPreloadConsent(),
  };
}
