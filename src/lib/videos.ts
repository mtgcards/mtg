import { YouTubeVideo } from './types';

interface VideosData {
  videos: YouTubeVideo[];
  fetchedAt: string;
}

const modules = import.meta.glob('../generated/videos.json', { eager: true });
const data = (modules['../generated/videos.json'] as { default?: VideosData } | undefined)?.default ?? { videos: [], fetchedAt: '' };

export function fetchVideos(): VideosData {
  return data;
}
