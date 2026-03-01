import data from '@/generated/videos.json';
import { YouTubeVideo } from './types';

interface VideosData {
  videos: YouTubeVideo[];
  fetchedAt: string;
}

export function fetchVideos(): VideosData {
  return data as unknown as VideosData;
}
