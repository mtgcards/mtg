import Link from 'next/link';
import { pageTitle } from '@/lib/constants';
import '@/styles/about.css';

export const metadata = {
  title: pageTitle('このサイトについて'),
};

export default function AboutPage() {
  return (
    <main>
      <div className="scroll-wrapper">
        <div className="scroll-roller top"></div>
        <div className="scroll-body">
          <h1>このサイトについて</h1>

          <h2>概要</h2>
          <p>
            このサイトは、Magic: The Gathering（マジック：ザ・ギャザリング）のコモン・アンコモンカードの中から、
            一定の価格以上の高額カードを年代別・セット別に一覧表示するサービスです。
          </p>

          <h2>主な機能</h2>
          <ul>
            <li>年代別タブによるカードの絞り込み表示（1995〜現在）</li>
            <li>コモン・アンコモンの価格閾値によるフィルタリング</li>
            <li>Basic Land、Token、Foilカードの別途一覧表示</li>
            <li>USD / JPY / EUR への通貨変換</li>
            <li>hareruya / cardkingdom / tcgplayer へのカード購入リンク</li>
          </ul>

          <h2>データソース</h2>
          <p>
            カードデータおよび価格情報は{' '}
            <a href="https://scryfall.com" target="_blank" rel="noopener noreferrer">
              Scryfall
            </a>
            のAPIを利用しています。
            価格はリアルタイムで取得されるため、実際の市場価格と若干異なる場合があります。
          </p>
          <p>
            為替レートは{' '}
            <a href="https://www.frankfurter.app" target="_blank" rel="noopener noreferrer">
              Frankfurter
            </a>
            のAPIを利用しています。
          </p>

          <h2>免責事項</h2>
          <p>
            本サイトに掲載されている価格情報は参考値です。
            実際の購入・売却の際は各ショップの公式サイトにてご確認ください。
            本サイトの情報を利用したことによる損害について、当サイトは一切の責任を負いません。
          </p>

          <Link href="/" className="back-link">
            ←<br />
            トップへ戻る
          </Link>
        </div>
        <div className="scroll-roller bottom"></div>
      </div>
    </main>
  );
}
