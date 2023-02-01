export default function Video({ url }: { url: string }) {
  return (
    <video controls autoPlay src={url}>
      Your browser does not support the video tag.
    </video>
  );
}
