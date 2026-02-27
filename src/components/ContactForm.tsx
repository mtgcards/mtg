'use client';

import { useState, FormEvent } from 'react';

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
      alert('送信に失敗しました。しばらく後にお試しください。');
    }
  };

  if (submitted) {
    return (
      <div className="success-message" style={{ display: 'block' }}>
        お問い合わせを受け付けました。ありがとうございます。
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
        <label htmlFor="email">メールアドレス</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="example@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="message">メッセージ</label>
        <textarea
          id="message"
          name="message"
          placeholder="お問い合わせ内容をご記入ください"
          required
        />
      </div>
      <button type="submit" className="submit-btn">
        送信する
      </button>
    </form>
  );
}
