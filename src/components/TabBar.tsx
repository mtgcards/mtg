'use client';

import Link from 'next/link';
import { ALL_FORMAT_KEYS, TAB_LABELS, DEFAULT_FORMAT } from '@/lib/constants';
import { FormatKey } from '@/lib/types';

interface TabBarProps {
  activeFormat: FormatKey | 'price_movers';
}

export default function TabBar({ activeFormat }: TabBarProps) {
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
            {TAB_LABELS[key]}
          </Link>
        );
      })}
      <Link
        href="/price_movers"
        className={`tab-btn${activeFormat === 'price_movers' ? ' active' : ''}`}
        role="tab"
      >
        値上がり
      </Link>
    </nav>
  );
}
