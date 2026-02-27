import { SITE_NAME } from '@/lib/constants';

export default function Loading() {
  return (
    <main>
      <div className="top-bar">
        <div className="header-compact">
          <h1>{SITE_NAME}</h1>
        </div>
        <div className="loading">
          <div className="spinner" />
          Loading...
        </div>
      </div>
    </main>
  );
}
