import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function PriceMoversPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return redirect({ href: '/price_movers/7d', locale });
}