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
  num_comments: number;
  author: string;
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
            .filter((i) => !i.data.is_self)
            .map((child) => ({
              num_comments: child.data.num_comments,
              author: child.data.author,
              isVideo: isVideo(child),
              thumb: child.data.thumbnail,
              domain: child.data.domain,
              url: redditVideo(child) || redditGallery(child)[0] || child.data.url,
              embed: child.data.secure_media_embed?.media_domain_url || '',
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
      allowFullScreen
    ></iframe>
  );
}
// https://dev.twitch.tv/docs/embed/video-and-clips
function TwitchEmbed({ clip }: { clip: string }) {
  return (
    <iframe
      src={`https://clips.twitch.tv/embed?clip=${clip}&parent=${EMBED_PARENT}&autoplay=true`}
      height={300}
      width={400}
      frameBorder={0}
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

function YoutubeClip() {
  return (
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/rMSVEeetuMw?clip=UgkxZeMwWxpzCJCaJ9nAaJCUzlCkqnDxxD1J&amp;clipt=EPOqmggYw9CcCA"
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
}

function RedditVideoEmbed({ url }: { url: string }) {
  return (
    <video width={400} height={300} controls autoPlay>
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

function RedditEmbed({ embed }: { embed: string }) {
  return <iframe src={embed} width={400} height={400}></iframe>;
}

function RedGifsEmbed({ id }: { id: string }) {
  return (
    <iframe
      src={`https://redgifs.com/ifr/${id}`}
      frameBorder="0"
      scrolling="no"
      allowFullScreen
      width="248"
      height="465"
    ></iframe>
  );
}

function DialogMain({ post }: { post: PostData }) {
  const { pathname, searchParams } = new URL(post.url);
  const slicedPathname = pathname.slice(1);
  if (post.domain === 'clips.twitch.tv') {
    return <TwitchEmbed clip={slicedPathname} />;
  }
  if (
    ['www.twitch.tv', 'twitch.tv'].includes(post.domain) &&
    pathname.split('/')[2] === 'clip'
  ) {
    return <TwitchEmbed clip={pathname.split('/')[3]} />;
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
    return <RedditVideoEmbed url={post.url} />;
  }
  if (post.domain === 'twitter.com') {
    return <RedditEmbed embed={post.embed} />;
  }
  if (post.domain === 'redgifs.com') {
    return <RedGifsEmbed id={pathname.split('/').reverse()[0]} />;
  }

  return <img src={post.url} alt={post.title} />;
}

function imageUrl(id: string, meta: string): string {
  const url = 'https://i.redd.it';
  if (meta === 'image/png') return `${url}/${id}.png`;
  if (meta === 'image/jpg') return `${url}/${id}.jpg`;
  return '';
}

function redditVideo(child: Child): string | null {
  if (!child.data.is_video) return null;
  if (!child.data.media?.reddit_video) return null;
  return child.data.media.reddit_video.fallback_url;
}

function redditGallery(child: Child): Array<string> {
  if (!child.data.is_gallery || !child.data.media_metadata) return [];
  return Object.entries(child.data.media_metadata)
    .map(([id, meta]) => imageUrl(id, meta.m))
    .filter((s) => s !== '');
}

function DialogDescription({ post }: { post: PostData }) {
  return (
    <figcaption>
      {post.title}
      <br />
      <Anchor href={post.permalink}>
        {post.num_comments > 0 ? `${post.num_comments} Comments ` : 'No Comments '}
      </Anchor>
      in
      <Anchor href={post.url}> {post.domain} </Anchor> by
      <Anchor href={`https://old.reddit.com/user/${post.author}`}>
        {` u/${post.author} `}
      </Anchor>
    </figcaption>
  );
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
        <DialogMain post={post} />
        <DialogDescription post={post} />
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
  const [content, setContent] = useState<PostData | null>(null);
  const [idx, setIdx] = useState(0);
  return (
    <main
      tabIndex={0}
      className="gallery"
      onKeyDown={(e) => {
        if (!open) return;
        if (['ArrowRight', 'Period'].includes(e.code)) {
          const newIdx = Math.min(idx + 1, images.length - 1);
          setIdx(newIdx);
          setContent(images[newIdx]);
        }
        if (['ArrowLeft', 'Comma'].includes(e.code)) {
          const newIdx = Math.max(idx - 1, 0);
          setIdx(newIdx);
          setContent(images[newIdx]);
        }
      }}
    >
      {images.length > 0 && (
        <Dialog
          open={open}
          post={content}
          onClick={() => {
            {
              setOpen(false);
              setContent(null);
            }
          }}
        />
      )}
      {images.map(
        (image, idx) =>
          (image.embed == '' && image.embed) || (
            <div className="item" key={idx}>
              <img
                onClick={() => {
                  setOpen(true);
                  setContent(images[idx]);
                  setIdx(idx);
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
        <h2>{location.slice(1)}</h2>
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
