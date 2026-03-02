'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ALL_FORMAT_KEYS, DEFAULT_FORMAT } from '@/lib/constants';
import { TabKey } from '@/lib/types';

interface TabBarProps {
  activeFormat: TabKey;
}

export default function TabBar({ activeFormat }: TabBarProps) {
  const tf = useTranslations('formats');
  const tt = useTranslations('tabs');

  return (
    <nav className="tab-bar" role="tablist">
      {ALL_FORMAT_KEYS.map((key) => {
        const href = key === DEFAULT_FORMAT ? '/' : `/${key}`;
        return (
          <Link
            key={key}
            href={href}
            className={`tab-btn${key === activeFormat ? ' active' : ''}`}
            role="tab"
          >
            {tf(key)}
          </Link>
        );
      })}
      <Link
        href="/price_movers/7d"
        className={`tab-btn${activeFormat === 'price_movers' ? ' active' : ''}`}
        role="tab"
      >
        {tt('priceMovers')}
      </Link>
      <Link
        href="/videos"
        className={`tab-btn${activeFormat === 'videos' ? ' active' : ''}`}
        role="tab"
      >
        {tt('videos')}
      </Link>
    </nav>
  );
}
