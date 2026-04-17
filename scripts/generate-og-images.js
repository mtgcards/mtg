const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

const messages = require('../src/messages/ja.json');

const SITE_NAME = '\u662d\u548cMTG \u9ad8\u984d\u30b3\u30e2\u30f3&\u30a2\u30f3\u30b3\u30e2\u30f3\u8cb4\u91cd\u54c1\u5ba4';
const ALL_FORMAT_KEYS = [
  'y1995_2003',
  'y2004_2014',
  'y2015_2020',
  'y2021_2022',
  'y2023_2025',
  'y2026_',
  'basic_land',
  'token',
  'foil',
];
const PERIOD_KEYS = ['24h', '7d', '30d', '90d'];

const OG_SIZE = { width: 1200, height: 630 };
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'og');

async function loadCinzelFont() {
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@700',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
      },
    }
  ).then((r) => r.text());

  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!match) throw new Error('[og] Cinzel font URL not found');
  const buffer = await fetch(match[1]).then((r) => r.arrayBuffer());
  return { name: 'Cinzel', data: buffer, weight: 700, style: 'normal' };
}

function titleFontSize(len) {
  if (len <= 12) return 58;
  if (len <= 20) return 48;
  if (len <= 28) return 38;
  return 30;
}

async function generateOgImage(title, description, font, outputFile) {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2b1a0e 0%, #1a0e05 55%, #0a0502 100%)',
          padding: 36,
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              border: '3px solid #d4a017',
              gap: 24,
              padding: '44px 72px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 19,
                    color: '#d4a017',
                    letterSpacing: 3,
                    fontFamily: 'Cinzel',
                  },
                  children: [
                    { type: 'div', props: { children: '◆' } },
                    { type: 'div', props: { children: SITE_NAME } },
                    { type: 'div', props: { children: '◆' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { width: 500, height: 2, background: '#8b1a1a' },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: titleFontSize(title.length),
                    color: '#ffe699',
                    fontFamily: 'Cinzel',
                    fontWeight: 700,
                    textAlign: 'center',
                    lineHeight: 1.35,
                  },
                  children: title,
                },
              },
              description
                ? {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 21,
                        color: '#c0b090',
                        fontFamily: 'Cinzel',
                        textAlign: 'center',
                        lineHeight: 1.55,
                        marginTop: 4,
                      },
                      children: description,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
      },
    },
    {
      width: OG_SIZE.width,
      height: OG_SIZE.height,
      fonts: [font],
    }
  );

  const resvg = new Resvg(Buffer.from(svg), {
    fitTo: { mode: 'width', value: OG_SIZE.width },
  });
  const pngData = resvg.render();
  fs.writeFileSync(outputFile, pngData.asPng());
  console.log(`[og] Generated: ${outputFile}`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const font = await loadCinzelFont();

  // Default (top page)
  const defaultTitle = messages.formatPageTitles['y1995_2003'] || SITE_NAME;
  const defaultDesc = messages.formatDescriptions['y1995_2003'];
  await generateOgImage(defaultTitle, defaultDesc, font, path.join(OUTPUT_DIR, 'default.png'));

  // Format pages
  for (const key of ALL_FORMAT_KEYS) {
    const title = messages.formatPageTitles[key] || `${messages.formats[key]} 高額コモン・アンコモン`;
    const desc = messages.formatDescriptions[key];
    await generateOgImage(title, desc, font, path.join(OUTPUT_DIR, `${key}.png`));
  }

  // Price movers periods
  for (const period of PERIOD_KEYS) {
    const periodLabel = messages.priceMovers.periods[period];
    const title = `値上がり（${periodLabel}）`;
    const desc = `MTGのコモン・アンコモンカードで${periodLabel}の値上がりが大きいカードをランキング表示。`;
    await generateOgImage(title, desc, font, path.join(OUTPUT_DIR, `price_movers_${period}.png`));
  }

  // Videos
  await generateOgImage(
    messages.videosPage.label,
    messages.videosPage.description,
    font,
    path.join(OUTPUT_DIR, 'videos.png')
  );

  // About
  await generateOgImage(
    messages.about.title,
    messages.about.description,
    font,
    path.join(OUTPUT_DIR, 'about.png')
  );

  // Contact
  await generateOgImage(
    messages.contact.title,
    messages.contact.description,
    font,
    path.join(OUTPUT_DIR, 'contact.png')
  );

  // Privacy
  await generateOgImage(
    messages.privacy.title,
    messages.privacy.description,
    font,
    path.join(OUTPUT_DIR, 'privacy.png')
  );

  console.log('[og] All OG images generated successfully.');
}

main().catch((err) => {
  console.error('[og] Failed to generate OG images:', err);
  process.exit(1);
});
