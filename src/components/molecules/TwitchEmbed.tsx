import { EMBED_PARENT } from '../../constants';
import IFrame from '../atoms/IFrame';

export default function TwitchEmbed({
  video,
  time,
}: {
  video: string;
  time: string | null;
}) {
  let src = `https://player.twitch.tv/?video=${video}&parent=${EMBED_PARENT}&autoplay=true`;
  if (time) src += `&time=${time}`;
  return <IFrame src={src} />;
}
