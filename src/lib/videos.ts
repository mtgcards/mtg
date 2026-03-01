import fs from 'fs';
import path from 'path';
import { YouTubeVideo } from './types';

interface VideosData {
  videos: YouTubeVideo[];
  fetchedAt: string;
}

export function fetchVideos(): VideosData {
  const filePath = path.join(process.cwd(), 'src/generated/videos.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as VideosData;
}
