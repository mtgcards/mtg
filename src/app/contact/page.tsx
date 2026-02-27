import Link from 'next/link';
import { pageTitle } from '@/lib/constants';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: pageTitle('お問い合わせ'),
};

export default function ContactPage() {
  return (
    <main>
      <div className="static-page">
        <h1>お問い合わせ</h1>

        <p>
          バグの報告、掲載データへのご指摘、その他本サイトに関するご意見・ご要望がございましたら、
          下記フォームよりお気軽にお問い合わせください。
        </p>

        <ContactForm />

        <Link href="/" className="back-link">
          ← トップページへ戻る
        </Link>
      </div>
    </main>
  );
}
