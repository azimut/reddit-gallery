export function isImage(url: string): boolean {
  return (url.match('.jpg|.png|.jpeg|.gif|.svg|.webp|.tiff|.bmp|.ico') && true) || false;
}

export function isVideo(url: string): boolean {
  return (url.match('.mp4|.webm|.mkv') && true) || false;
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
