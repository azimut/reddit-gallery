import IFrame from '../atoms/IFrame';

export default function YoutubeClip() {
  return (
    <IFrame
      src="https://www.youtube.com/embed/rMSVEeetuMw?clip=UgkxZeMwWxpzCJCaJ9nAaJCUzlCkqnDxxD1J&amp;clipt=EPOqmggYw9CcCA"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  );
}
