import { DEFAULT_FORMAT, FORMAT_DESCRIPTIONS, FORMAT_PAGE_TITLES, SITE_NAME, TAB_LABELS } from '@/lib/constants';
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = SITE_NAME;

export default async function Image() {
  const title = FORMAT_PAGE_TITLES[DEFAULT_FORMAT] ?? `${TAB_LABELS[DEFAULT_FORMAT]} | ${SITE_NAME}`;
  const description = FORMAT_DESCRIPTIONS[DEFAULT_FORMAT];
  return buildOgImage(title, description);
}
