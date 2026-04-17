'use client';

import { t } from '@/lib/i18n';
import { ALL_FORMAT_KEYS, DEFAULT_FORMAT } from '@/lib/constants';
import { TabKey } from '@/lib/types';

interface TabBarProps {
  activeFormat: TabKey;
}

export default function TabBar({ activeFormat }: TabBarProps) {


  return (
    <nav className="tab-bar" role="tablist">
      {ALL_FORMAT_KEYS.map((key) => {
        const href = key === DEFAULT_FORMAT ? '/' : `/${key}`;
        return (
          <a
            key={key}
            href={href}
            className={`tab-btn${key === activeFormat ? ' active' : ''}`}
            role="tab"
          >
            {t(`formats.${key}`)}
          </a>
        );
      })}
      <a
        href="/price_movers/7d"
        className={`tab-btn${activeFormat === 'price_movers' ? ' active' : ''}`}
        role="tab"
      >
        {t('tabs.priceMovers')}
      </a>
      <a
        href="/videos"
        className={`tab-btn${activeFormat === 'videos' ? ' active' : ''}`}
        role="tab"
      >
        {t('tabs.videos')}
      </a>
    </nav>
  );
}
