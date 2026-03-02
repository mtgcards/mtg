import { redirect } from '@/i18n/navigation';

export default async function PriceMoversPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect('/price_movers/7d', { locale });
}
