'use client';

import { useState, FormEvent } from 'react';
import { t } from '@/lib/i18n';

export default function ContactForm() {

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
      alert(t('contact.error'));
    }
  };

  if (submitted) {
    return (
      <div className="success-message" style={{ display: 'block' }}>
        {t('contact.success')}
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
        <label htmlFor="email">{t('contact.email')}</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="example@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="message">{t('contact.message')}</label>
        <textarea
          id="message"
          name="message"
          placeholder={t('contact.placeholder')}
          required
        />
      </div>
      <button type="submit" className="submit-btn">
        {t('contact.submit')}
      </button>
    </form>
  );
}
