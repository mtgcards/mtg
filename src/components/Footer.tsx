import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <p>
        カードデータ提供:{' '}
        <a href="https://scryfall.com" target="_blank" rel="noopener noreferrer">
          Scryfall
        </a>
      </p>
      <nav className="footer-nav">
        <Link href="/about">このサイトについて</Link>
        <Link href="/contact">お問い合わせ</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
      </nav>
    </footer>
  );
}
