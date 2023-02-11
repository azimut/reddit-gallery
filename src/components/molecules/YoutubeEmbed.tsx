import IFrame from '../atoms/IFrame';

// https://developers.google.com/youtube/player_parameters
export default function YoutubeEmbed({
  id,
  start,
}: {
  id: string;
  start: string | null | undefined;
}) {
  let url = `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=1&autoplay=0`;
  if (start) url += `&start=${start}`;
  return <IFrame src={url} />;
}
