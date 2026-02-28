import { ALL_FORMAT_KEYS, FORMAT_DESCRIPTIONS, FORMAT_PAGE_TITLES, SITE_NAME, TAB_LABELS } from '@/lib/constants';
import { FormatKey } from '@/lib/types';
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;
  const formatKey = format as FormatKey;

  if (!ALL_FORMAT_KEYS.includes(formatKey)) {
    return new Response('Not Found', { status: 404 });
  }

  const title = FORMAT_PAGE_TITLES[formatKey] ?? `${TAB_LABELS[formatKey]} | ${SITE_NAME}`;
  const description = FORMAT_DESCRIPTIONS[formatKey];
  return buildOgImage(title, description);
}
