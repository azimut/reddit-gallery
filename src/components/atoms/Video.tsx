type Props = {
  url: string;
  className?: string;
};

export default function Video({ url, className = 'default-video-player' }: Props) {
  return (
    <video controls autoPlay src={url} className={className}>
      Your browser does not support the video tag.
    </video>
  );
}
