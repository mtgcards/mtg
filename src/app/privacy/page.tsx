import Link from 'next/link';
import { pageTitle } from '@/lib/constants';
import '@/styles/privacy.css';

export const metadata = {
  title: pageTitle('プライバシーポリシー'),
};

export default function PrivacyPage() {
  return (
    <main>
      <div className="cobble-frame">
        <div className="cobble-inner">
          <h1>プライバシーポリシー</h1>
          <p className="last-updated">最終更新日：2026年2月24日</p>

          <p>
            本サイト（以下「当サイト」）は、利用者のプライバシーを尊重し、個人情報の保護に努めます。
            本ポリシーでは、当サイトにおける情報の取り扱いについて説明します。
          </p>

          <h2>収集する情報</h2>
          <p>当サイトは以下の情報を収集する場合があります。</p>
          <ul>
            <li>お問い合わせフォームにご入力いただいた氏名・メールアドレス・メッセージ内容</li>
            <li>アクセスログ（IPアドレス、ブラウザの種類、参照元URLなど）</li>
          </ul>

          <h2>情報の利用目的</h2>
          <p>収集した情報は以下の目的にのみ使用します。</p>
          <ul>
            <li>お問い合わせへの返答</li>
            <li>サイトの改善・不具合対応</li>
            <li>不正アクセス・スパムの防止</li>
          </ul>

          <h2>第三者への提供</h2>
          <p>
            当サイトは、法令に基づく場合を除き、利用者の個人情報を第三者に提供・開示しません。
          </p>

          <h2>外部サービス</h2>
          <p>
            当サイトでは以下の外部サービスを利用しています。これらのサービスのプライバシーポリシーについては、各サービスのページをご確認ください。
          </p>
          <ul>
            <li>Scryfall API（カードデータ・価格情報）</li>
            <li>Frankfurter API（為替レート）</li>
            <li>Cloudflare Web Analytics（アクセス解析）</li>
          </ul>

          <h2>Cookieについて</h2>
          <p>
            当サイトでは現在Cookieを使用していません。
            アクセス解析にはCookie不使用のCloudflare Web Analyticsを採用しています。
          </p>

          <h2>アクセス解析</h2>
          <p>
            当サイトではCloudflare Web Analyticsを使用しています。
            このサービスはCookieを使用せず、個人を特定する情報を収集しません。
            詳細は<a href="https://www.cloudflare.com/ja-jp/web-analytics/" target="_blank" rel="noopener noreferrer">Cloudflare Web Analytics</a>のページをご確認ください。
          </p>

          <h2>プライバシーポリシーの変更</h2>
          <p>
            本ポリシーは予告なく変更される場合があります。
            変更後の内容は本ページに掲載した時点から効力を生じるものとします。
          </p>

          <h2>お問い合わせ</h2>
          <p>
            本ポリシーに関するご質問は、
            <Link href="/contact">お問い合わせページ</Link>よりご連絡ください。
          </p>

          <Link href="/" className="back-link">
            ← トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
