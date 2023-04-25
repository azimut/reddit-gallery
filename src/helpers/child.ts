import { Child } from '../types';
import { isUrl, isImage } from './validators';
import { decode } from 'html-entities';

export function redditThumbnailUrl(child: Child): string {
  if (child.data.is_video && child.data.media?.reddit_video?.scrubber_media_url) {
    return child.data.media?.reddit_video?.scrubber_media_url;
  }
  if (isUrl(child.data.thumbnail)) {
    return child.data.thumbnail;
  }
  if (isImage(child.data.url)) {
    return child.data.url;
  }
  if (child.data.is_gallery && child.data.media_metadata) {
    return redditGallery(child)?.reverse()?.pop() || '';
  }
  if (child.data.url.includes('youtube.com/shorts/')) {
    const { pathname } = new URL(child.data.url);
    return `https://i.ytimg.com/vi/${pathname.split('/').pop()}/default.jpg`;
  }

  return `http://${child.data.domain}/favicon.ico`;
}

export function redditUrl(child: Child): string {
  return redditVideo(child) || redditGallery(child)[0] || decode(child.data.url);
}

function redditVideo(child: Child): string | null {
  if (!child.data.is_video) return null;
  if (child.data.media?.reddit_video?.hls_url)
    return child.data.media.reddit_video.hls_url;
  if (!child.data.media?.reddit_video) return null;
  return child.data.media.reddit_video.fallback_url;
}

function redditGallery(child: Child): Array<string> {
  if (!child.data.is_gallery || !child.data.media_metadata) return [];
  return Object.entries(child.data.media_metadata)
    .map(([id, meta]) => imageUrl(id, meta.m))
    .filter((s) => s !== '');
}

function imageUrl(id: string, meta: string): string {
  const url = 'https://i.redd.it';
  if (meta === 'image/png') return `${url}/${id}.png`;
  if (meta === 'image/jpg') return `${url}/${id}.jpg`;
  if (meta === 'image/gif') return `${url}/${id}.gif`;
  return '';
}
