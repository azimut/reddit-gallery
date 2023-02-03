import IFrame from '../atoms/IFrame';

// https://developers.google.com/youtube/player_parameters
export default function YoutubeEmbed({
  id,
  start,
}: {
  id: string;
  start: string | null;
}) {
  if (start) {
    return (
      <IFrame
        src={`https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=1&autoplay=0&start=${start}`}
        allow="autoplay; encrypted-media"
      />
    );
  } else {
    return (
      <IFrame
        src={`https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=1&autoplay=0`}
        allow="autoplay; encrypted-media"
      />
    );
  }
}
