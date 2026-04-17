'use client';

import { useState, useEffect, useRef } from 'react';
import { t } from '@/lib/i18n';

const SCROLL_THRESHOLD = 300;
const THROTTLE_MS = 100;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const lastCallRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastCallRef.current < THROTTLE_MS) return;
      lastCallRef.current = now;
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top${visible ? '' : ' hidden'}`}
      onClick={scrollToTop}
      aria-label={t('common.backToTop')}
    >
      ▲
    </button>
  );
}
