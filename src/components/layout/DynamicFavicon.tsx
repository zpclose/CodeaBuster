'use client';

import { useEffect } from 'react';

interface DynamicFaviconProps {
  iconUrl?: string;
}

export default function DynamicFavicon({ iconUrl = '/favicon-cb.png' }: DynamicFaviconProps) {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = iconUrl;
    }
  }, [iconUrl]);

  return null;
}
