
import { NextResponse } from 'next/server';

const FIVE_MEGABYTES_IN_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'File not found in the request.' },
        { status: 400 }
      );
    }

    // Validasi tipe file (hanya gambar)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed.' },
        { status: 400 }
      );
    }

    // Validasi ukuran file (maksimal 5MB)
    if (file.size > FIVE_MEGABYTES_IN_BYTES) {
      return NextResponse.json(
        {
          error: 'Image file is too large.',
          details: `The file size exceeds the maximum limit of 5MB.`,
        },
        { status: 413 } // 413 Payload Too Large
      );
    }

    const externalForm = new FormData();
    externalForm.append('file', file, file.name);

    const response = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: externalForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CDN Response Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Image storage service denied the request.', details: `CDN Error: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (Array.isArray(result) && result[0] && result[0].src) {
      const url = 'https://telegra.ph' + result[0].src;
      return NextResponse.json({ url });
    } else {
      console.error('Unexpected CDN JSON:', result);
      return NextResponse.json(
        { error: 'Invalid response format from the image service.', details: JSON.stringify(result) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Internal Upload Route Error:', error);
    return NextResponse.json(
      {
        error: 'An internal error occurred on the upload server.',
        details: error.message || 'The connection was lost or the server is misconfigured.',
      },
      { status: 500 }
    );
  }
}
