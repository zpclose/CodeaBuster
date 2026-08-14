/**
 * ============================================================
 * SCRIPT MIGRASI: Firebase Storage → Cloudflare R2
 * ============================================================
 *
 * Cara pakai:
 * 1. npm install firebase-admin @aws-sdk/client-s3 node-fetch
 * 2. Siapkan DUA file service account:
 *    - firebase-service-account.json        → main project (Firestore)
 *    - firebase-storage-service-account.json → storage project
 * 3. Jalankan: node scripts/migrate-storage-to-r2.mjs
 * ============================================================
 */

import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';
import fs from 'fs';

// ============================================================
// CONFIG
// ============================================================

const CONFIG = {
  // Service account main project (Firestore) — studio-8281963604-c316a
  FIREBASE_MAIN_SA_PATH: './firebase-service-account.json',

  // Service account storage project — studio-8681629558-68f05
  // Boleh sama dengan file di atas kalau hanya punya satu,
  // tapi idealnya dari project storage
  FIREBASE_STORAGE_SA_PATH: './firebase-storage-service-account.json',

  // Cloudflare R2
  R2_ACCOUNT_ID: '360c055c0e640ffc22902af508a117bb',
  R2_ACCESS_KEY_ID: '7a363aaf4a7833f69d47ed1f7c3b0f45',
  R2_SECRET_ACCESS_KEY: 'e36ea335512532114c1a516784f6cd63b526d2a773011d44c459adb1656fbded',
  R2_BUCKET_NAME: 'codeabuster-storage',
  R2_PUBLIC_BASE_URL: 'https://pub-a31bce4b87bd44f7b33c1adcd9022fc2.r2.dev',

  // Firebase Storage bucket (project storage)
  STORAGE_BUCKET: 'studio-8681629558-68f05.firebasestorage.app',

  // Firestore project (main)
  FIRESTORE_PROJECT_ID: 'studio-8281963604-c316a',
};

// Koleksi Firestore yang menyimpan URL gambar
const COLLECTIONS_WITH_IMAGES = [
  { collection: 'images',           urlField: 'imageUrl',        idField: null },
  { collection: 'team-members',     urlField: 'imageUrl',        idField: 'imageId' },
  { collection: 'network-partners', urlField: 'imageUrl',        idField: 'imageId' },
  { collection: 'page-images',      urlField: 'imageUrl',        idField: 'imageId' },
  { collection: 'achievements',     urlField: 'thumbnailUrl',    idField: 'thumbnailId' },
  { collection: 'achievements',     urlField: 'curatorImageUrl', idField: 'curatorImageId' },
];

// ============================================================
// SETUP
// ============================================================

function initFirebaseMain() {
  const sa = JSON.parse(fs.readFileSync(CONFIG.FIREBASE_MAIN_SA_PATH, 'utf8'));
  const app = initializeApp({ credential: cert(sa) }, 'main');
  return getFirestore(app);
}

function initFirebaseStorage() {
  // Kalau file storage SA tidak ada, coba pakai yang main
  const saPath = fs.existsSync(CONFIG.FIREBASE_STORAGE_SA_PATH)
    ? CONFIG.FIREBASE_STORAGE_SA_PATH
    : CONFIG.FIREBASE_MAIN_SA_PATH;

  const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  const app = initializeApp(
    { credential: cert(sa), storageBucket: CONFIG.STORAGE_BUCKET },
    'storage'
  );
  return getStorage(app);
}

function initR2() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
    },
  });
}

// ============================================================
// HELPERS
// ============================================================

function extractPathFromFirebaseUrl(url) {
  try {
    return decodeURIComponent(url.split('/o/')[1].split('?')[0]);
  } catch {
    return null;
  }
}

function isFirebaseStorageUrl(url) {
  return typeof url === 'string' && url.includes('firebasestorage.googleapis.com');
}

async function downloadFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fileExistsInR2(r2, key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: CONFIG.R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

function getContentType(filename) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif',  webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4',  webm: 'video/webm', mov: 'video/quicktime',
    pdf: 'application/pdf',
  };
  return map[ext] || 'application/octet-stream';
}

function log(msg, type = 'info') {
  const p = { info: '→', success: '✓', warn: '⚠', error: '✗' }[type] || '→';
  console.log(`${p} ${msg}`);
}

// ============================================================
// LANGKAH 1: List SEMUA file dari Firebase Storage bucket
// ============================================================

async function listAllStorageFiles(storage) {
  log('Listing semua file dari Firebase Storage bucket...');
  const bucket = storage.bucket();
  const [files] = await bucket.getFiles({ prefix: '' });
  log(`Ditemukan ${files.length} file di Storage bucket`, 'success');
  return files;
}

// ============================================================
// LANGKAH 2: Ambil download URL untuk setiap file
// ============================================================

async function getDownloadUrls(files) {
  log('Mengambil download URL untuk semua file...');
  const docs = [];
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 jam
      });
      docs.push({ id: file.name, path: file.name, signedUrl: url });
      if ((i + 1) % 10 === 0) log(`  ${i + 1}/${files.length} URL didapat...`);
    } catch (err) {
      log(`  Gagal dapat URL untuk ${file.name}: ${err.message}`, 'warn');
      failed++;
    }
  }

  log(`URL berhasil didapat: ${docs.length}, gagal: ${failed}`, docs.length ? 'success' : 'warn');
  return docs;
}

// ============================================================
// LANGKAH 3: Kumpulkan URL dari Firestore (untuk update nanti)
// ============================================================

async function collectFirestoreUrls(db) {
  log('Membaca URL gambar dari Firestore...');
  const urlToDocMap = {}; // { firebaseUrl: [{col, docId, field}] }

  for (const { collection: col, urlField } of COLLECTIONS_WITH_IMAGES) {
    try {
      const snapshot = await db.collection(col).get();
      snapshot.forEach(doc => {
        const url = doc.data()[urlField];
        if (url && isFirebaseStorageUrl(url)) {
          if (!urlToDocMap[url]) urlToDocMap[url] = [];
          urlToDocMap[url].push({ col, docId: doc.id, field: urlField });
        }
      });
    } catch (err) {
      log(`  Gagal baca koleksi ${col}: ${err.message}`, 'warn');
    }
  }

  const total = Object.keys(urlToDocMap).length;
  log(`Ditemukan ${total} URL Firebase di Firestore`, total ? 'success' : 'warn');
  return urlToDocMap;
}

// ============================================================
// LANGKAH 4: Upload semua file ke R2
// ============================================================

async function uploadToR2(r2, fileDocs) {
  const pathToR2Url = {}; // { storagePath: r2Url }
  let success = 0, skipped = 0, failed = 0;

  for (let i = 0; i < fileDocs.length; i++) {
    const { path: storagePath, signedUrl } = fileDocs[i];
    const r2Key = storagePath;
    const r2Url = `${CONFIG.R2_PUBLIC_BASE_URL}/${r2Key}`;

    // Skip kalau sudah ada di R2
    const exists = await fileExistsInR2(r2, r2Key);
    if (exists) {
      log(`[${i+1}/${fileDocs.length}] Skip (sudah ada): ${r2Key}`);
      pathToR2Url[storagePath] = r2Url;
      skipped++;
      continue;
    }

    try {
      log(`[${i+1}/${fileDocs.length}] Upload: ${storagePath}`);
      const buffer = await downloadFile(signedUrl);
      const filename = storagePath.split('/').pop() || storagePath;

      await r2.send(new PutObjectCommand({
        Bucket: CONFIG.R2_BUCKET_NAME,
        Key: r2Key,
        Body: buffer,
        ContentType: getContentType(filename),
      }));

      pathToR2Url[storagePath] = r2Url;
      log(`[${i+1}/${fileDocs.length}] ✓ ${r2Url}`, 'success');
      success++;
    } catch (err) {
      log(`[${i+1}/${fileDocs.length}] GAGAL: ${storagePath} — ${err.message}`, 'error');
      failed++;
    }
  }

  return { pathToR2Url, stats: { success, skipped, failed } };
}

// ============================================================
// LANGKAH 5: Update URL di Firestore
// ============================================================

async function updateFirestoreUrls(db, urlToDocMap, pathToR2Url) {
  log('\nMemperbarui URL di Firestore...');
  let updated = 0, errors = 0;

  for (const [oldUrl, docRefs] of Object.entries(urlToDocMap)) {
    // Cari storage path dari URL lama
    const storagePath = extractPathFromFirebaseUrl(oldUrl);
    if (!storagePath) continue;

    const newUrl = pathToR2Url[storagePath];
    if (!newUrl) {
      log(`  Skip update — file tidak berhasil diupload: ${storagePath}`, 'warn');
      continue;
    }

    for (const { col, docId, field } of docRefs) {
      try {
        await db.collection(col).doc(docId).update({ [field]: newUrl });
        log(`  ✓ ${col}/${docId}.${field}`, 'success');
        updated++;
      } catch (err) {
        log(`  ✗ ${col}/${docId}.${field}: ${err.message}`, 'error');
        errors++;
      }
    }
  }

  log(`Firestore: ${updated} diupdate, ${errors} error`);
  return { updated, errors };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('  MIGRASI FIREBASE STORAGE → CLOUDFLARE R2');
  console.log('='.repeat(60));
  console.log();

  // Validasi
  if (!fs.existsSync(CONFIG.FIREBASE_MAIN_SA_PATH)) {
    console.error(`❌ File tidak ditemukan: ${CONFIG.FIREBASE_MAIN_SA_PATH}`);
    console.error('   Download dari Firebase Console → Project Settings → Service Accounts');
    console.error('   Pilih main project: studio-8281963604-c316a');
    process.exit(1);
  }

  // Cek apakah file storage SA tersedia, kalau tidak gunakan yang main
  if (!fs.existsSync(CONFIG.FIREBASE_STORAGE_SA_PATH)) {
    log('File firebase-storage-service-account.json tidak ditemukan', 'warn');
    log('Menggunakan firebase-service-account.json untuk storage juga', 'warn');
    log('Catatan: Pastikan service account ini punya akses ke storage bucket', 'info');
  }

  const db = initFirebaseMain();
  const storage = initFirebaseStorage();
  const r2 = initR2();

  // Langkah 1 & 2: List semua file dari Storage + ambil URL
  const storageFiles = await listAllStorageFiles(storage);
  if (storageFiles.length === 0) {
    log('Tidak ada file di Storage bucket. Periksa konfigurasi STORAGE_BUCKET.', 'warn');
    process.exit(0);
  }
  const fileDocs = await getDownloadUrls(storageFiles);

  // Langkah 3: Baca URL dari Firestore
  const urlToDocMap = await collectFirestoreUrls(db);

  console.log(`\nTotal ${fileDocs.length} file akan dimigrasi ke R2.\n`);

  // Langkah 4: Upload ke R2
  const { pathToR2Url, stats } = await uploadToR2(r2, fileDocs);

  console.log('\n--- Hasil Upload ke R2 ---');
  console.log(`  Berhasil : ${stats.success}`);
  console.log(`  Dilewati : ${stats.skipped} (sudah ada)`);
  console.log(`  Gagal    : ${stats.failed}`);

  // Simpan mapping
  const resultPath = './scripts/migrate-result.json';
  fs.writeFileSync(resultPath, JSON.stringify(pathToR2Url, null, 2), 'utf8');
  log(`\nMapping disimpan ke ${resultPath}`, 'success');

  // Langkah 5: Update Firestore
  const firestoreResult = await updateFirestoreUrls(db, urlToDocMap, pathToR2Url);

  console.log('\n' + '='.repeat(60));
  console.log('  SELESAI');
  console.log('='.repeat(60));
  console.log(`  File diupload       : ${stats.success}`);
  console.log(`  File dilewati       : ${stats.skipped}`);
  console.log(`  Upload gagal        : ${stats.failed}`);
  console.log(`  Firestore diupdate  : ${firestoreResult.updated} dokumen`);
  console.log(`  Firestore error     : ${firestoreResult.errors}`);
  console.log();

  if (stats.failed > 0) {
    log('Jalankan ulang script untuk retry file yang gagal.', 'warn');
  }
}

main().catch(err => {
  console.error('\n❌ Script gagal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
