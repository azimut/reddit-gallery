import { useLocation, Route } from 'wouter';
import reactLogo from './assets/react.svg';
import './App.css';
import { ReactNode, RefObject, useEffect, useReducer, useRef, useState } from 'react';
import { Reddit, Child } from '../src/types';

const API_LIMIT = 25;
const EMBED_PARENT = 'reddit-gallery-phi.vercel.app';
//const EMBED_PARENT = 'localhost';

function Input({
  name,
  inputRef,
}: {
  name: string;
  inputRef: RefObject<HTMLInputElement>;
}) {
  return (
    <input ref={inputRef} type="text" name={name} placeholder={name} required autoFocus />
  );
}

function Label({ name, label }: { name: string; label: string }) {
  return <label htmlFor={name}>{label}</label>;
}

function Search({
  name,
  label,
  inputRef,
}: {
  name: string;
  label: string | undefined;
  inputRef: RefObject<HTMLInputElement>;
}) {
  return (
    <>
      <Label name={name} label={label || ''} />
      <Input name={name} inputRef={inputRef} />
    </>
  );
}

function Welcome() {
  const [_, pushLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current) return;
    pushLocation(`/r/${inputRef.current.value}`);
  };
  return (
    <main className="welcome">
      <img src={reactLogo} className="logo react" alt="React logo" />
      <h1>Reddit Gallery</h1>
      <form onSubmit={onSubmit}>
        <Search name="subreddit" label="/r/" inputRef={inputRef} />
      </form>
    </main>
  );
}

type PostData = {
  thumb: string;
  domain: string;
  url: string;
  isVideo: boolean;
  permalink: string;
  title: string;
  embed: string;
};

function isVideo(child: Child): boolean {
  return (
    [
      'youtube.com',
      'clips.twitch.tv',
      'youtu.be',
      'v.redd.it',
      'streamable.com',
    ].includes(child.data.domain) || child.data.is_video
  );
}

function useGalleryFetch(subreddit: string) {
  const [images, setImages] = useState<Array<PostData>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState('');
  const [trigger, dispatch] = useReducer((t) => !t, false);
  useEffect(() => {
    setLoading(true);
    fetch(
      `https://www.reddit.com/r/${subreddit}/new/.json?limit=${API_LIMIT}&count=${count}&after=${after}`,
    )
      .then((res) => res.json())
      .then((subreddit: Reddit) => {
        setAfter(subreddit.data.after || '');
        setImages((prev) => {
          const next = subreddit.data.children
            .filter((i) => !['self', 'default', ''].includes(i.data.thumbnail))
            .map((child) => ({
              isVideo: isVideo(child),
              thumb: child.data.thumbnail,
              domain: child.data.domain,
              url:
                (child.data.is_video &&
                  child.data.media?.reddit_video &&
                  child.data.media.reddit_video.fallback_url) ||
                child.data.url,
              embed: (child.data.media && child.data.media_embed.content) || '',
              permalink: `https://old.reddit.com${child.data.permalink}`,
              title: child.data.title,
            }));
          return (count === 0 && next) || prev.concat(next);
        });
        setCount((prevCount) => prevCount + API_LIMIT);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [trigger]);
  return { images, loading, error, dispatch };
}

// https://support.streamable.com/article/61-advanced-embedding
function StreamableEmbed({ id }: { id: string }) {
  return (
    <iframe
      src={`https://streamable.com/e/${id}?autoplay=1`}
      frameBorder={0}
      height={300}
      width={400}
      allowFullScreen={true}
    ></iframe>
  );
}
// https://dev.twitch.tv/docs/embed/video-and-clips
function TwitchEmbed({ id }: { id: string }) {
  return (
    <iframe
      src={`https://clips.twitch.tv/embed?clip=${id}&parent=${EMBED_PARENT}&autoplay=true`}
      height={300}
      width={400}
      allowFullScreen
    ></iframe>
  );
}

//  https://support.google.com/youtube/answer/171780?hl=en#zippy=%2Cturn-on-privacy-enhanced-mode
function YoutubeEmbed({ id }: { id: string }) {
  return (
    <iframe
      width={400}
      height={300}
      src={`https://www.youtube-nocookie.com/embed/${id}`}
      frameBorder={0}
      allow="autoplay; encrypted-media"
      allowFullScreen
    ></iframe>
  );
}

// https://publish.twitter.com/oembed?url = https://twitter.com/Interior/status/463440424141459456
// https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/overview
// https://developer.twitter.com/en/docs/twitter-for-websites/oembed-api

function RedditEmbed({ url }: { url: string }) {
  return (
    <video width={400} height={300} controls autoPlay>
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

function MainDialog({ post }: { post: PostData }) {
  const { pathname, searchParams } = new URL(post.url);
  const slicedPathname = pathname.slice(1);
  if (post.domain === 'clips.twitch.tv') {
    return <TwitchEmbed id={slicedPathname} />;
  }
  if (post.domain === 'streamable.com') {
    return <StreamableEmbed id={slicedPathname} />;
  }
  if (post.domain === 'youtube.com') {
    const id = searchParams.get('v');
    if (!id) return null;
    return <YoutubeEmbed id={id} />;
  }
  if (post.domain === 'youtu.be') {
    return <YoutubeEmbed id={slicedPathname} />;
  }
  if (post.domain === 'v.redd.it') {
    return <RedditEmbed url={post.url} />;
  }
  return <img src={post.url} alt={post.title} />;
}

function Dialog({
  open,
  post,
  onClick,
}: {
  open: boolean;
  post: PostData | null;
  onClick: () => void;
}) {
  if (!post) return null;
  return (
    <dialog open={open} className="popup" onClick={onClick}>
      <figure>
        <MainDialog post={post} />
        <figcaption>
          {post.title}
          <Anchor href={post.permalink}> Permalink </Anchor>
          <Anchor href={post.url}> Link </Anchor>
        </figcaption>
      </figure>
    </dialog>
  );
}

type AnchorProps = {
  href: string;
  children?: ReactNode;
};

function Anchor({ href, children }: AnchorProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}

function Gallery({ images }: { images: Array<PostData> }) {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState<PostData | null>(null);
  return (
    <main className="gallery">
      {images.length > 0 && (
        <Dialog
          open={open}
          post={opened}
          onClick={() => {
            setOpen(false);
          }}
        />
      )}
      {images.map(
        (image, idx) =>
          (image.embed == '' && image.embed) || (
            <div className="picture" key={idx}>
              <img
                onClick={() => {
                  setOpen(true);
                  setOpened(images[idx]);
                }}
                alt={image.title}
                src={(image.url.endsWith('.gif') && image.url) || image.thumb}
              />
            </div>
          ),
      )}
    </main>
  );
}

function SubReddit() {
  const [location] = useLocation();
  const { images, error, dispatch } = useGalleryFetch(location.slice(3));
  if (error) return <p>Error!</p>;
  return (
    <>
      <header>
        <h2>{location}</h2>
      </header>
      <Gallery images={images} />
      <button onClick={dispatch}>More</button>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Route path="/" component={Welcome} />
      <Route path="/r/:id" component={SubReddit} />
    </div>
  );
}

export default App;
