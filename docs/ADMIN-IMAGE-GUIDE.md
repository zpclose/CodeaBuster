# AdminImage - Strict Priority Image Loading Guide

## 🎯 Problem Statement

**Masalah:** Ketika admin mengganti gambar di portal admin, portal user masih menampilkan gambar default sebentar sebelum ditimpa gambar baru. Ini menyebabkan efek "flash" yang jelek.

**Solusi:** Gunakan komponen `AdminImage` atau `StrictImage` dengan **strict priority loading** - skeleton selalu muncul sampai gambar benar-benar loaded.

---

## 📦 Komponen yang Tersedia

### 1. `AdminImage` (RECOMMENDED - Utama)

Komponen utama untuk semua gambar yang bisa di-update oleh admin.

#### Mode 1: Slot Mode (AUTO-FETCH dari Firestore) - **PALING RECOMMENDED**

```tsx
import { AdminImage } from '@/components/ui/admin-image';

// Otomatis fetch dari Firestore berdasarkan slotId + pageCategory
<AdminImage 
  slotId="hero-main" 
  pageCategory="home" 
  alt="Hero Banner" 
  fill 
/>
```

**Kapan digunakan:**
- Gambar yang dikelola admin (logo, hero, section images, dll)
- Slot sudah terdaftar di `placeholder-images.ts`

#### Mode 2: Manual AdminSrc + DefaultSrc + IsLoading

```tsx
import { AdminImage } from '@/components/ui/admin-image';
import { useStrictPageImages } from '@/hooks/useStrictPageImages';

function MyComponent() {
  const { images, isLoading } = useStrictPageImages('home');
  const hero = images['hero-main'];

  return (
    <AdminImage 
      adminSrc={hero.adminUrl}      // null saat loading
      defaultSrc={hero.placeholderUrl}
      isLoading={isLoading}
      alt="Hero Banner" 
      fill 
    />
  );
}
```

**Kapan digunakan:**
- Butuh custom logic sebelum render
- Akses ke metadata (isCustom, description, dll)

#### Mode 3: Direct Src (Static Images)

```tsx
import { AdminImage } from '@/components/ui/admin-image';

// Untuk gambar statis yang tidak berubah
<AdminImage 
  src="/static/logo.png" 
  alt="Logo" 
  fill 
/>
```

**Kapan digunakan:**
- Gambar statis di `/public`
- External CDN yang tidak berubah

---

### 2. `StrictImage` (Wrapper - Simplified API)

Wrapper yang lebih sederhana untuk `AdminImage` dengan slot mode.

```tsx
import { StrictImage } from '@/components/ui/strict-image';

// Simple API
<StrictImage 
  slotId="hero-main" 
  pageCategory="home" 
  alt="Hero" 
  fill 
/>

// Dengan custom fallback
<StrictImage 
  slotId="hero-main" 
  pageCategory="home" 
  fallbackSrc="/custom-fallback.jpg"
  alt="Hero" 
  fill 
/>

// Compound component API
<StrictImage.Slot 
  id="hero-main" 
  category="home" 
  alt="Hero" 
  fill 
/>
```

---

### 3. `ImageWithSkeleton` (Legacy - Untuk Static Images Only)

**⚠️ DEPRECATED untuk admin images!** Hanya gunakan untuk:
- Gambar statis yang tidak berubah
- External images dari API third-party

```tsx
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';

// Selalu gunakan strict=true (default)
<ImageWithSkeleton 
  src={staticUrl} 
  alt="Description" 
  fill 
  strict={true}  // IMPORTANT!
/>
```

---

## 🚫 ANTI-PATTERNS (JANGAN DILAKUKAN)

### ❌ Pattern 1: Langsung render URL dari hook tanpa loading state

```tsx
// SALAH! Ini akan flash!
const { images } = useStrictPageImages('home');
const url = images['hero']?.adminUrl || images['hero']?.placeholderUrl;

<img src={url} alt="Hero" />  // ❌ FLASH!
```

**Kenapa salah:** URL langsung di-render sebelum image loaded di memory.

### ❌ Pattern 2: Menggunakan Next.js Image biasa

```tsx
// SALAH! Tidak ada skeleton loading
import Image from 'next/image';

<Image src={adminUrl} alt="Hero" fill />  // ❌ FLASH!
```

**Kenapa salah:** Next.js Image onLoad masih menunjukkan gambar sebentar saat loading.

### ❌ Pattern 3: Fallback yang terlihat

```tsx
// SALAH! Default image akan flash
<ImageWithSkeleton 
  src={adminUrl} 
  fallback="/default.jpg"  // ❌ Ini akan terlihat saat loading!
  strict={false}  // ❌ Legacy mode!
/>
```

**Kenapa salah:** Fallback akan terlihat sebelum admin image loaded.

---

## ✅ BEST PRACTICES

### 1. Selalu Gunakan AdminImage untuk Admin-Controlled Images

```tsx
// ✅ BENAR
<AdminImage 
  slotId="hero-main" 
  pageCategory="home" 
  alt="Hero" 
  fill 
/>
```

### 2. Skeleton Selalu Muncul Dulu

Komponen akan selalu menampilkan skeleton dengan shimmer effect sampai image benar-benar loaded.

```tsx
// Internally:
// 1. Fetch dari Firestore → show skeleton
// 2. Preload image di memory → tetap show skeleton
// 3. Image loaded → fade-in smooth, hide skeleton
```

### 3. Tidak Ada Layout Shift (CLS)

Selalu gunakan `fill` atau explicit `width`/`height`:

```tsx
// ✅ BENAR - No CLS
<AdminImage slotId="hero" pageCategory="home" alt="Hero" fill />

// ✅ BENAR - No CLS
<AdminImage slotId="logo" pageCategory="global" alt="Logo" width={200} height={50} />

// ❌ SALAH - Bisa CLS
<AdminImage slotId="hero" pageCategory="home" alt="Hero" />
```

### 4. Preload Multiple Images di Page Level

```tsx
import { usePreloadAdminImages } from '@/components/ui/admin-image';

function MyPage() {
  // Preload multiple images di awal
  usePreloadAdminImages('home', ['hero', 'about', 'feature-1', 'feature-2']);

  return (
    <div>
      <AdminImage slotId="hero" pageCategory="home" alt="Hero" fill />
      <AdminImage slotId="about" pageCategory="home" alt="About" fill />
      {/* ... */}
    </div>
  );
}
```

---

## 📋 Implementasi per Halaman

### Home Page (`src/app/(main)/page.tsx`)

```tsx
import { StrictImage } from '@/components/ui/strict-image';

// Hero section
<StrictImage 
  slotId="hero-background-main" 
  pageCategory="home" 
  alt="Hero Background" 
  fill 
  priority
/>

// Logo section
<StrictImage 
  slotId="telkom-university-logo-potrait" 
  pageCategory="home" 
  alt="Telkom University" 
  width={80} 
  height={80} 
/>

// Management team
<StrictImage 
  slotId="management-lacienta" 
  pageCategory="home" 
  alt="Team Member" 
  fill 
  className="object-cover object-top"
  skeletonClassName="rounded-full"
/>
```

### About Page (`src/app/(main)/about/page.tsx`)

```tsx
import { AdminImage } from '@/components/ui/admin-image';

// Hero section
<AdminImage 
  slotId="about-page-hero" 
  pageCategory="about" 
  alt="About Hero" 
  fill 
/>

// Decoration images
<AdminImage 
  slotId="about-us-decoration" 
  pageCategory="about" 
  alt="Decoration" 
  fill 
/>
```

### Programs Page (`src/app/(main)/programs/page.tsx`)

```tsx
import { AdminImage } from '@/components/ui/admin-image';

// Track images
<AdminImage 
  slotId="program-track-1" 
  pageCategory="programs" 
  alt="Track 1" 
  fill 
/>
```

### Projects Page (`src/app/(main)/projects/page.tsx`)

```tsx
import { AdminImage } from '@/components/ui/admin-image';

// Project thumbnails (dynamic dari Firestore projects)
// Gunakan ImageWithSkeleton dengan strict mode untuk project thumbnails
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';

<ImageWithSkeleton 
  src={project.thumbnailUrl} 
  alt={project.title} 
  fill 
  strict={true}  // IMPORTANT!
/>
```

### Auth Pages (Login/Register/Verify)

```tsx
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';

// Logo (static dari config)
<ImageWithSkeleton 
  src={siteLogo} 
  alt="Logo" 
  fill 
  strict={true}
/>

// Background (static/decorative)
<ImageWithSkeleton 
  src={authBackground} 
  alt="Background" 
  fill 
  strict={true}
/>
```

---

## 🔧 Props Reference

### AdminImage Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slotId` | string | - | Slot ID dari placeholder-images.ts |
| `pageCategory` | string | - | Category (home, about, programs, dll) |
| `src` | string | - | Direct URL (static mode) |
| `adminSrc` | string\|null | - | Admin URL (manual mode) |
| `defaultSrc` | string | - | Fallback URL (manual mode) |
| `isLoading` | boolean | false | Loading state (manual mode) |
| `alt` | string | **required** | Alt text |
| `fill` | boolean | false | Fill parent container |
| `width` | number | - | Explicit width |
| `height` | number | - | Explicit height |
| `priority` | boolean | false | Next.js priority loading |
| `objectFit` | string | 'cover' | cover/contain/fill/none |
| `fadeInDuration` | number | 300 | Fade-in duration (ms) |
| `skeletonClassName` | string | - | Custom skeleton className |
| `aspectRatio` | string | - | Aspect ratio (e.g. "16/9") |

---

## 🎨 Customizing Skeleton

```tsx
// Custom skeleton appearance
<AdminImage 
  slotId="hero" 
  pageCategory="home" 
  alt="Hero" 
  fill 
  skeletonClassName="bg-gray-200 dark:bg-gray-800 rounded-lg"
/>

// Dengan custom shimmer (sudah built-in di admin-image)
// Shimmer effect otomatis muncul dengan animate-shimmer
```

---

## 📊 Available Slots

Lihat semua slot yang tersedia di: `src/lib/placeholder-images.ts`

Contoh slot IDs:
- `hero-background-main`
- `telkom-university-logo-potrait`
- `mercu-buana-logo-square`
- `about-page-hero`
- `about-us-decoration`
- `management-*`
- Dan banyak lagi...

---

## 🐛 Troubleshooting

### Flash masih terjadi

**Cek:**
1. Apakah menggunakan `AdminImage` atau `StrictImage`? (bukan Next.js Image biasa)
2. Apakah `strict={true}` di `ImageWithSkeleton`?
3. Apakah tidak menggunakan pattern `img.adminUrl || img.placeholderUrl` langsung?

### Skeleton tidak muncul

**Cek:**
1. Apakah container punya explicit size (fill atau width/height)?
2. Apakah `isLoading` dari hook benar?

### Layout shift (CLS)

**Cek:**
1. Gunakan `fill` atau explicit `width`/`height`
2. Atau gunakan `aspectRatio` prop

---

## 📚 Related Files

- `/src/components/ui/admin-image.tsx` - Main component
- `/src/components/ui/strict-image.tsx` - Simplified wrapper
- `/src/components/ui/image-with-skeleton.tsx` - Legacy component
- `/src/hooks/useStrictPageImages.ts` - Hook untuk fetch images
- `/src/lib/placeholder-images.ts` - Slot definitions
- `/src/app/globals.css` - Shimmer animation

---

## 🚀 Deployment

Setelah update:

```bash
# Commit changes
git add .
git commit -m "fix: implement strict priority image loading with skeleton"

# Push to git
git push origin main

# Deploy to Vercel
# Vercel akan auto-deploy dari main branch
```

---

**Last Updated:** 2025-01-10
**Author:** Senior Frontend Developer (AI Assistant)
