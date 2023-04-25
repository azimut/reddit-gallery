import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

export default function VideoJS({ url }: { url: string }) {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    sources: [
      {
        src: url,
        type: 'application/x-mpegURL',
      },
    ],
  };

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoRef?.current?.appendChild(videoElement);
      playerRef.current = videojs(videoElement, videoJsOptions, () => {
        videojs.log('player is ready!');
      });
    }
  }, [videoRef]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      player.src(url);
    }
  }, [url]);

  return <div data-vjs-player className="vidjs" ref={videoRef} />;
}
