import { FORMAT_DESCRIPTIONS, FORMAT_PAGE_TITLES, SITE_NAME, TAB_LABELS } from '@/lib/constants';
import { isFormatKey } from '@/lib/utils';
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;

  if (!isFormatKey(format)) {
    return new Response('Not Found', { status: 404 });
  }

  const title = FORMAT_PAGE_TITLES[format] ?? `${TAB_LABELS[format]} | ${SITE_NAME}`;
  const description = FORMAT_DESCRIPTIONS[format];
  return buildOgImage(title, description);
}
