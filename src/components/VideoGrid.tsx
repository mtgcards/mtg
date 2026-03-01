'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { YouTubeVideo } from '@/lib/types';
import BackToTop from './BackToTop';

interface VideoGridProps {
  videos: YouTubeVideo[];
}

const PAGE_SIZE = 50;

export default function VideoGrid({ videos }: VideoGridProps) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const visibleVideos = videos.slice(0, shown);
  const hasMore = shown < videos.length;

  const openModal = useCallback((video: YouTubeVideo) => {
    setActiveVideo(video);
    modalRef.current?.showModal();
  }, []);

  const closeModal = useCallback(() => {
    modalRef.current?.close();
    setActiveVideo(null);
  }, []);

  const handleDialogClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === modalRef.current) closeModal();
  }, [closeModal]);

  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;
    const onClose = () => setActiveVideo(null);
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  if (videos.length === 0) {
    return <div className="end-message">動画が見つかりませんでした。</div>;
  }

  return (
    <>
      <div className="video-grid-wrapper">
        <div className="video-grid">
          {visibleVideos.map((video) => (
            <button
              key={video.id}
              className="video-card"
              onClick={() => openModal(video)}
            >
              <div className="video-thumbnail-wrapper">
                <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
                <div className="video-play-icon">&#9654;</div>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-channel">{video.channelTitle}</p>
                <div className="video-meta">
                  <time className="video-date" dateTime={video.publishedAt}>
                    {new Date(video.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  {video.viewCount != null && (
                    <span className="video-views">
                      {video.viewCount.toLocaleString('ja-JP')} 回視聴
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {hasMore && (
          <div className="load-more-wrapper">
            <button
              className="load-more-btn"
              onClick={() => setShown((prev) => prev + PAGE_SIZE)}
            >
              もっと見る
            </button>
          </div>
        )}
      </div>

      <BackToTop />

      <dialog
        ref={modalRef}
        className="video-modal"
        onClick={handleDialogClick}
      >
        <div className="video-modal-inner">
          <button className="video-modal-close" onClick={closeModal} aria-label="閉じる">✕</button>
          {activeVideo && (
            <>
              <div className="video-modal-player">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="video-modal-info">
                <h2 className="video-modal-title">{activeVideo.title}</h2>
                <div className="video-meta">
                  <span className="video-channel">{activeVideo.channelTitle}</span>
                  <time className="video-date" dateTime={activeVideo.publishedAt}>
                    {new Date(activeVideo.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  {activeVideo.viewCount != null && (
                    <span className="video-views">
                      {activeVideo.viewCount.toLocaleString('ja-JP')} 回視聴
                    </span>
                  )}
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-modal-yt-link"
                >
                  YouTubeで見る
                </a>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
