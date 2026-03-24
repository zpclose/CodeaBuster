import { useState, useEffect, useRef } from 'react';
import { adminImageService } from '../services/adminImageService';

// Cache global untuk menghindari duplicate requests
const imageCache = new Map();
const pendingRequests = new Map();

export const useAdminImage = (imageKey) => {
  const [state, setState] = useState({
    imageUrl: null,
    isLoading: true,
    error: null
  });
  
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!imageKey) {
      setState({ imageUrl: null, isLoading: false, error: null });
      return;
    }

    // Check cache dulu
    if (imageCache.has(imageKey)) {
      setState({
        imageUrl: imageCache.get(imageKey),
        isLoading: false,
        error: null
      });
      return;
    }

    // Check if already fetching
    if (pendingRequests.has(imageKey)) {
      pendingRequests.get(imageKey).then(url => {
        if (mountedRef.current) {
          setState({ imageUrl: url, isLoading: false, error: null });
        }
      });
      return;
    }

    // Fetch dari backend
    setState(prev => ({ ...prev, isLoading: true }));
    
    const fetchPromise = adminImageService.getImageByKey(imageKey)
      .then(response => {
        const url = response?.data?.url || null;
        if (url) imageCache.set(imageKey, url);
        return url;
      })
      .catch(error => {
        console.error(`Failed to fetch image ${imageKey}:`, error);
        return null;
      })
      .finally(() => {
        pendingRequests.delete(imageKey);
      });

    pendingRequests.set(imageKey, fetchPromise);

    fetchPromise.then(url => {
      if (mountedRef.current) {
        setState({
          imageUrl: url,
          isLoading: false,
          error: null
        });
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, [imageKey]);

  return state;
};

// Hook untuk prefetch multiple images (untuk page load)
export const usePrefetchAdminImages = (imageKeys) => {
  useEffect(() => {
    imageKeys.forEach(key => {
      if (!imageCache.has(key) && !pendingRequests.has(key)) {
        const promise = adminImageService.getImageByKey(key)
          .then(response => {
            const url = response?.data?.url;
            if (url) imageCache.set(key, url);
            return url;
          });
        pendingRequests.set(key, promise);
      }
    });
  }, [imageKeys]);
};

// Util untuk clear cache (setelah admin update image)
export const clearAdminImageCache = (imageKey) => {
  if (imageKey) {
    imageCache.delete(imageKey);
  } else {
    imageCache.clear();
  }
};