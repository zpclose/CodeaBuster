import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#7c3aed',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              color: 'white',
              fontWeight: 800,
            }}
          >
            CB
          </div>
          <span style={{ color: 'white', fontSize: 72, fontWeight: 800 }}>
            Codebusters
          </span>
        </div>
        <div
          style={{
            color: '#a1a1aa',
            fontSize: 28,
            fontWeight: 400,
            marginTop: 8,
          }}
        >
          Komunitas Developer Indonesia
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
