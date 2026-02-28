import { ImageResponse } from 'next/og';
import { SITE_NAME } from './constants';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

async function loadCinzelFont(): Promise<ArrayBuffer> {
  // Firefox 27 UA: Google Fonts returns WOFF (not WOFF2), which satori supports
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@700',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
      },
    }
  ).then((r) => r.text());

  const fontUrl = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error('[og] Cinzel font URL not found in CSS response');

  return fetch(fontUrl).then((r) => r.arrayBuffer());
}

function titleFontSize(len: number): number {
  if (len <= 12) return 58;
  if (len <= 20) return 48;
  if (len <= 28) return 38;
  return 30;
}

export async function buildOgImage(
  title: string,
  description?: string
): Promise<ImageResponse> {
  const font = await loadCinzelFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2b1a0e 0%, #1a0e05 55%, #0a0502 100%)',
          padding: 36,
        }}
      >
        {/* Gold frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: '3px solid #d4a017',
            gap: 24,
            padding: '44px 72px',
          }}
        >
          {/* Site name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 19,
              color: '#d4a017',
              letterSpacing: 3,
              fontFamily: 'Cinzel',
            }}
          >
            <div>◆</div>
            <div>{SITE_NAME}</div>
            <div>◆</div>
          </div>

          {/* Crimson divider */}
          <div style={{ width: 500, height: 2, background: '#8b1a1a' }} />

          {/* Title */}
          <div
            style={{
              fontSize: titleFontSize(title.length),
              color: '#ffe699',
              fontFamily: 'Cinzel',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.35,
            }}
          >
            {title}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: 21,
                color: '#c0b090',
                fontFamily: 'Cinzel',
                textAlign: 'center',
                lineHeight: 1.55,
                marginTop: 4,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: 'Cinzel',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );
}
