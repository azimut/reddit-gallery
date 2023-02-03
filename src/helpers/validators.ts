export function isImage(url: string): boolean {
  return (url.match('.jpg|.png|.jpeg|.gif|.svg|.webp|.tiff|.bmp') && true) || false;
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
