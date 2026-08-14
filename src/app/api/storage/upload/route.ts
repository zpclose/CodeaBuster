import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

function getR2Client() {
    return new S3Client({
        region: 'auto',
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });
}

function getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        gif: 'image/gif',  webp: 'image/webp', svg: 'image/svg+xml',
        mp4: 'video/mp4',  webm: 'video/webm', mov: 'video/quicktime',
        pdf: 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const path = formData.get('path') as string | null;

        if (!file || !path) {
            return NextResponse.json({ error: 'File dan path wajib diisi' }, { status: 400 });
        }

        // Validasi tipe file
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            return NextResponse.json({ error: 'File harus berupa gambar atau video' }, { status: 400 });
        }

        // Validasi ukuran (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'Ukuran file maksimal 10MB' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = path.split('/').pop() || file.name;

        const r2 = getR2Client();
        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: path,
            Body: buffer,
            ContentType: getContentType(filename),
        }));

        const publicUrl = `${R2_PUBLIC_URL}/${path}`;
        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('R2 upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload gagal' },
            { status: 500 }
        );
    }
}
