'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function BackToTop() {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top${visible ? '' : ' hidden'}`}
      onClick={scrollToTop}
      aria-label={t('backToTop')}
    >
      ▲
    </button>
  );
}
