import IFrame from '../atoms/IFrame';

// https://developers.google.com/youtube/player_parameters
export default function YoutubeEmbed({ id, t }: { id: string; t: string | null }) {
  let url = `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=1&autoplay=0`;
  if (t) url += `&start=${startToSeconds(t)}`;
  return <IFrame src={url} />;
}

function startToSeconds(timestamp: string) {
  let seconds = 0;
  if (timestamp.match(/^\d+[s]?$/)) {
    let matches = timestamp.match(/^(?<seconds>\d+)[s]?$/);
    seconds = Number(matches?.groups?.seconds || '0');
  } else if (timestamp.match(/^\d+m\d+s$/)) {
    let matches = timestamp.match(/^(?<minutes>\d+)m(?<seconds>\d+)s$/);
    seconds = Number(matches?.groups?.seconds || '0') * 60;
    seconds += Number(matches?.groups?.minutes || '0') * 60 * 60;
  } else if (timestamp.match(/^\d+h\d+m\d+s$/)) {
    let matches = timestamp.match(/^(?<hours>\d+)h(?<minutes>\d+)m(?<seconds>\d+)s$/);
    seconds = Number(matches?.groups?.seconds || '0');
    seconds += Number(matches?.groups?.minutes || '0') * 60;
    seconds += Number(matches?.groups?.hours || '0') * 60 * 60;
  }
  return seconds;
}
