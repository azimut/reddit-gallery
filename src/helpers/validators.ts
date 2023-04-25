export function isImage(url: string): boolean {
  return /\.(jpg|png|jpeg|gif|svg|webp|tiff|bmp|ico)/i.test(url);
}

export function isVideo(url: string): boolean {
  return /\.(mp4|webm|mkv)/i.test(url);
}

export function isUrl(raw_url: string): boolean {
  let url: URL;
  try {
    url = new URL(raw_url);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}
