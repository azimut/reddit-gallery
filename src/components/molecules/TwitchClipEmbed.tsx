import IFrame from '../atoms/IFrame';
import { EMBED_PARENT } from '../../constants';

// https://dev.twitch.tv/docs/embed/video-and-clips
export default function TwitchClipEmbed({ clip }: { clip: string }) {
  return (
    <IFrame
      src={`https://clips.twitch.tv/embed?clip=${clip}&parent=${EMBED_PARENT}&autoplay=true`}
    />
  );
}
