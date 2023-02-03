export default function IFrame({
  src,
  allow,
  className,
}: {
  src: string;
  allow?: string;
  className?: string;
}) {
  return (
    <iframe
      className={className || 'default-iframe'}
      src={src}
      allowFullScreen
      frameBorder={0}
      allow={allow || ''}
    ></iframe>
  );
}
