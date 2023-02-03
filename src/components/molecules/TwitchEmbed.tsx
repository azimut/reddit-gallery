import { EMBED_PARENT } from '../../constants';
import IFrame from '../atoms/IFrame';

export default function TwitchEmbed({ video, time }: { video: string; time: string }) {
  return (
    <IFrame
      src={`https://player.twitch.tv/?video=${video}&parent=${EMBED_PARENT}&time=${time}&autoplay=true`}
    />
  );
}
