import { Route, Redirect } from 'wouter';
import { RefObject, useEffect, useReducer, useRef, useState } from 'react';
import { decode } from 'html-entities';
import { format, formatDistance, fromUnixTime } from 'date-fns';

import './App.css';
import { Reddit } from './types';
import { API_LIMIT, NITTER_DOMAIN } from './constants';
import { isImage } from './helpers/validators';
import { redditUrl, redditThumbnail } from './helpers/child';

import GfycatEmbed from './components/molecules/GfycatEmbed';
import YoutubeEmbed from './components/molecules/YoutubeEmbed';
import TwitchEmbed from './components/molecules/TwitchEmbed';
import TwitchClipEmbed from './components/molecules/TwitchClipEmbed';
import StreamableEmbed from './components/molecules/StreamableEmbed';
import RedGifsEmbed from './components/molecules/RedGifsEmbed';
import IFrame from './components/atoms/IFrame';
import Anchor from './components/atoms/Anchor';
import Video from './components/atoms/Video';
import Welcome from './components/pages/Welcome';

type PostData = {
  created: number;
  score: number;
  num_comments: number;
  author: string;
  thumb: string;
  domain: string;
  url: string;
  permalink: string;
  title: string;
  embed: string;
};

function useGalleryFetch(subreddit: string, listing: string, period: string) {
  const [images, setImages] = useState<Array<PostData>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState('');
  const [trigger, dispatch] = useReducer((t) => !t, false);
  const t = period && `&t=${period}`;
  useEffect(() => {
    setLoading(true);
    fetch(
      `https://www.reddit.com/r/${subreddit}/${listing}/.json?limit=${API_LIMIT}&count=${count}&after=${after}${t}`,
    )
      .then((res) => res.json())
      .then((subreddit: Reddit) => {
        setAfter(subreddit.data.after || '');
        setImages((prev) => {
          const next = subreddit.data.children
            .filter((i) => !i.data.is_self)
            .map((child) => ({
              score: child.data.score,
              created: child.data.created_utc,
              num_comments: child.data.num_comments,
              author: child.data.author,
              thumb: redditThumbnail(child),
              domain: child.data.domain,
              url: redditUrl(child),
              embed: child.data.secure_media_embed?.media_domain_url || '',
              permalink: `https://old.reddit.com${child.data.permalink}`,
              title: decode(child.data.title),
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

function DialogMain({ post }: { post: PostData }) {
  if (post.url === '') return null;
  const { pathname, searchParams } = new URL(post.url);
  const slicedPathname = pathname.slice(1);
  if (post.domain === 'gfycat.com') {
    return <GfycatEmbed url={post.url} />;
  }
  if (post.domain === 'clips.twitch.tv') {
    return <TwitchClipEmbed clip={slicedPathname} />;
  }
  if (
    ['www.twitch.tv', 'twitch.tv'].includes(post.domain) &&
    pathname.split('/')[2] === 'clip'
  ) {
    return <TwitchClipEmbed clip={pathname.split('/')[3]} />;
  }
  if (
    ['www.twitch.tv', 'twitch.tv'].includes(post.domain) &&
    pathname.split('/')[1] === 'videos' &&
    searchParams.get('t')
  ) {
    const t = searchParams.get('t');
    if (t) return <TwitchEmbed video={pathname.split('/')[2]} time={t} />;
  }
  if (post.domain === 'streamable.com') {
    return <StreamableEmbed id={slicedPathname} />;
  }
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(post.domain)) {
    const v = searchParams.get('v');
    const t = searchParams.get('t');
    if (v) return <YoutubeEmbed id={v} start={t} />;
    if (pathname.includes('/shorts/'))
      return (
        <img
          src={`https://i.ytimg.com/vi/${pathname.split('/')[2]}/hqdefault.jpg`}
          alt={post.title}
        />
      );
  }
  if (post.domain === 'youtu.be') {
    const t = searchParams.get('t');
    return <YoutubeEmbed id={slicedPathname} start={t} />;
  }
  if (post.domain === 'v.redd.it') {
    return <Video url={post.url} />;
  }
  if (['twitter.com', 'm.twitter.com'].includes(post.domain)) {
    if (post.embed.length > 0) {
      return <IFrame src={post.embed} className="reddit-iframe" />;
    } else if (pathname.match('^/\\w+[/]?$')) {
      // is twitter username link
      return null;
    } else {
      return (
        <IFrame
          src={`https://${NITTER_DOMAIN}${pathname.replace(
            /\/photo\/[0-9]+$/,
            '',
          )}/embed`}
          className="nitter-iframe"
        />
      );
    }
  }
  if (post.domain === 'redgifs.com') {
    return <RedGifsEmbed id={pathname.split('/').reverse()[0]} />;
  }
  if (
    post.domain === 'imgur.com' &&
    slicedPathname.split('/').length === 1 &&
    !isImage(pathname)
  ) {
    return <img src={`${post.url}.jpg`} alt={post.title} />;
  }
  if (post.domain === 'i.imgur.com' && pathname.endsWith('.gifv')) {
    return <Video url={post.url.replace(/\.gifv/, '.mp4')} />;
  }

  if (post.domain === 'imgflip.com' && !isImage(pathname))
    return (
      <img src={`https://i.imgflip.com/${pathname.slice(3)}.jpg`} alt={post.title} />
    );

  if (isImage(pathname)) return <img src={post.url} alt={post.title} />;

  if (isImage(post.thumb))
    return <img className="main-thumb" src={post.thumb} alt={post.title} />;

  return null;
}

function DialogDescription({ post }: { post: PostData }) {
  const now = new Date();
  const end = fromUnixTime(post.created);
  const duration = formatDistance(end, now, { addSuffix: true });
  return (
    <figcaption>
      <Anchor href={post.permalink}>
        {post.num_comments > 0 ? `${post.num_comments} Comments ` : 'No Comments '}
      </Anchor>
      in
      <Anchor href={post.url}> {post.domain} </Anchor> by
      <Anchor href={`https://old.reddit.com/user/${post.author}`}>
        {` u/${post.author} `}
      </Anchor>
      <time dateTime={format(end, 'yyyy-MM-dd HH:mm')}>{duration}</time>
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
      <small>[{post.score > 0 ? `+${post.score}` : post.score}] </small>
      {post.title}
      <figure>
        <DialogMain post={post} />
        <DialogDescription post={post} />
      </figure>
    </dialog>
  );
}

function useFocus(): RefObject<HTMLElement> {
  const refToFocus = useRef<HTMLElement>(null);
  useEffect(() => refToFocus.current?.focus(), [refToFocus]);
  return refToFocus;
}

function Gallery({ images, nextPage }: { images: Array<PostData>; nextPage: Function }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<PostData | null>(null);
  const [idx, setIdx] = useState(-1);
  const ref = useFocus();
  const nextItem = () => {
    setIdx((old) => {
      if (old > Math.max(0, images.length - 5) && old <= Math.max(0, images.length)) {
        nextPage();
      }
      return Math.min(old + 1, images.length - 1);
    });
  };
  const prevItem = () => {
    setIdx((old) => {
      if (old === 0) {
        closeDialog();
        return -1;
      }
      return Math.max(0, old - 1);
    });
  };
  const closeDialog = () => {
    setOpen(false);
    ref.current?.focus();
  };
  const onClickDialog = closeDialog;
  const onClickImage = (i: number) => setIdx(i);
  useEffect(() => setContent(images[idx]), [idx]);
  useEffect(() => {
    !open && setIdx(-1);
  }, [open]);
  useEffect(() => {
    content && setOpen(true);
  }, [content]);
  return (
    <main
      ref={ref}
      tabIndex={0}
      className="gallery"
      onKeyDown={(e) => {
        if (['ArrowRight', 'Period'].includes(e.code)) {
          nextItem();
        }
        if (['ArrowLeft', 'Comma'].includes(e.code)) {
          prevItem();
        }
        if (['KeyQ', 'Escape'].includes(e.code)) {
          closeDialog();
        }
      }}
    >
      {images.map(
        (image, i) =>
          (image.embed === '' && image.embed) || (
            <div className="item" key={i}>
              <img
                onClick={() => onClickImage(i)}
                alt={image.title}
                src={(image.url.endsWith('.gif') && image.url) || image.thumb}
              />
            </div>
          ),
      )}
      {images.length > 0 && <Dialog open={open} post={content} onClick={onClickDialog} />}
    </main>
  );
}

function SubReddit(sub: string, listing: string = 'new', period: string = '') {
  const { images, error, dispatch } = useGalleryFetch(sub, listing, period);
  if (error) return <p>Error!</p>;
  return (
    <>
      <header>
        <h2>{`/r/${sub} (${listing})`}</h2>
      </header>
      <Gallery images={images} nextPage={dispatch} />
      <button onClick={dispatch}>More</button>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Route path="/" component={Welcome} />
      <Route path="/r/">
        <Redirect to="/" />
      </Route>
      <Route path="/r/:sub/top/hour">{(p) => SubReddit(p.sub, 'top', 'hour')}</Route>
      <Route path="/r/:sub/top/day">{(p) => SubReddit(p.sub, 'top', 'day')}</Route>
      <Route path="/r/:sub/top/week">{(p) => SubReddit(p.sub, 'top', 'week')}</Route>
      <Route path="/r/:sub/top/month">{(p) => SubReddit(p.sub, 'top', 'month')}</Route>
      <Route path="/r/:sub/top/year">{(p) => SubReddit(p.sub, 'top', 'year')}</Route>
      <Route path="/r/:sub/top/all">{(p) => SubReddit(p.sub, 'top', 'all')}</Route>
      <Route path="/r/:sub/top">{(p) => SubReddit(p.sub, 'top')}</Route>
      <Route path="/r/:sub/rising">{(p) => SubReddit(p.sub, 'rising')}</Route>
      <Route path="/r/:sub/hot">{(p) => SubReddit(p.sub, 'hot')}</Route>
      <Route path="/r/:sub/new">{(p) => SubReddit(p.sub, 'new')}</Route>
      <Route path="/r/:sub/new">{(p) => SubReddit(p.sub, 'new')}</Route>
      <Route path="/r/:sub">{(p) => SubReddit(p.sub)}</Route>
    </div>
  );
}

export default App;
