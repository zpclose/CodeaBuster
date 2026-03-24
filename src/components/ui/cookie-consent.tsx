'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const PRELOAD_DATA_KEY = 'preload-image-cache';

const PRIORITY_IMAGE_IDS = [
  'hero-background-main',
  'site-logo',
  'telkom-university-logo-potrait',
  'mercu-buana-logo-square',
  'homepage-carousel-collaboration',
  'homepage-carousel-mentorship',
];

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp: number;
}

async function preloadImages(imageIds: string[]) {
  if (typeof window === 'undefined') return;
  
  try {
    const response = await fetch(`/api/images/preload?ids=${imageIds.join(',')}`, {
      signal: AbortSignal.timeout(10000)
    });
    if (response.ok) {
      const data = await response.json();
      const existingData = localStorage.getItem(PRELOAD_DATA_KEY);
      const existing = existingData ? JSON.parse(existingData) : { images: [], lastUpdated: 0 };
      
      const newImages = data.images || [];
      const mergedImages = [...(existing.images || [])];
      
      newImages.forEach((img: { id: string; url: string; timestamp: number }) => {
        const idx = mergedImages.findIndex((i: any) => i.id === img.id);
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
    }
  } catch (error) {
    // Silent fail - preload is optional
  }
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    preferences: false,
    timestamp: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(stored);
      setConsent(parsed);
      
      if (parsed.preferences) {
        preloadImages(PRIORITY_IMAGE_IDS);
      }
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);

    if (newConsent.preferences) {
      setIsPreloading(true);
      preloadImages(PRIORITY_IMAGE_IDS).finally(() => setIsPreloading(false));
    }
  };

  const acceptAll = () => {
    setIsPreloading(true);
    saveConsent({
      necessary: true,
      analytics: true,
      preferences: true,
      timestamp: Date.now(),
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      preferences: false,
      timestamp: Date.now(),
    });
  };

  const savePreferences = () => {
    saveConsent({
      ...consent,
      timestamp: Date.now(),
    });
  };

  if (!showBanner) {
    if (isPreloading) {
      return (
        <div className="fixed bottom-4 right-4 z-50 bg-background border shadow-lg rounded-lg px-4 py-2 text-sm">
          <span className="text-muted-foreground">⚡ Menyimpan gambar untuk kunjungan berikutnya...</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-4xl bg-background border shadow-lg rounded-lg p-6">
        {!showSettings ? (
          <>
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">🍪 Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Kami menggunakan cookie untuk meningkatkan pengalaman Anda. 
                  Dengan menerima cookie, gambar dan data akan disimpan secara lokal sehingga kunjungan berikutnya lebih cepat.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                Pengaturan
              </Button>
              <Button variant="outline" size="sm" onClick={rejectAll}>
                Tolak Semua
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Terima Semua
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Pengaturan Cookie</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih cookie mana yang ingin Anda aktifkan. Cookie wajib selalu aktif untuk сайт работает.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={consent.necessary} 
                  onChange={() => {}}
                  disabled 
                  className="h-4 w-4"
                />
                <div>
                  <span className="font-medium">Wajib</span>
                  <p className="text-xs text-muted-foreground">Cookie ini diperlukan agar situs web dapat berfungsi.</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={consent.preferences} 
                  onChange={(e) => setConsent({...consent, preferences: e.target.checked})}
                  className="h-4 w-4"
                />
                <div>
                  <span className="font-medium">Preferensi & Gambar</span>
                  <p className="text-xs text-muted-foreground">Simpan gambar dan data secara lokal untuk memuat lebih cepat di kunjungan berikutnya.</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={consent.analytics} 
                  onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                  className="h-4 w-4"
                />
                <div>
                  <span className="font-medium">Analytics</span>
                  <p className="text-xs text-muted-foreground">Bantu kami memahami bagaimana pengunjung menggunakan situs kami.</p>
                </div>
              </label>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                Kembali
              </Button>
              <Button size="sm" onClick={savePreferences}>
                Simpan Preferensi
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function hasPreloadConsent(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return false;
  const parsed = JSON.parse(stored);
  return parsed.preferences === true;
}

export function clearPreloadData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PRELOAD_DATA_KEY);
}
