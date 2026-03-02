'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      setSubmitted(true);
    } else {
      alert(t('error'));
    }
  };

  if (submitted) {
    return (
      <div className="success-message" style={{ display: 'block' }}>
        {t('success')}
      </div>
    );
  }

  return (
    <form
      className="contact-form"
      action="https://formspree.io/f/xwvnwgrb"
      method="POST"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label htmlFor="email">{t('email')}</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="example@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="message">{t('message')}</label>
        <textarea
          id="message"
          name="message"
          placeholder={t('placeholder')}
          required
        />
      </div>
      <button type="submit" className="submit-btn">
        {t('submit')}
      </button>
    </form>
  );
}
