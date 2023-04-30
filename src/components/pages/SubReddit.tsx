import { useEffect, useReducer, useState } from 'react';
import { decode } from 'html-entities';
import { format, formatDistance, fromUnixTime } from 'date-fns';

import '../../App.css';
import { Reddit } from '../../types';
import { API_LIMIT, NITTER_DOMAIN } from '../../constants';
import { isImage, isVideo } from '../../helpers/validators';
import { redditUrl, redditThumbnailUrl } from '../../helpers/child';

import useInfinity from '../../hooks/useInfinity';
import useFocus from '../../hooks/useFocus';
import VideoJS from '../../components/molecules/VideoJS';
import GiphyEmbed from '../../components/molecules/GiphyEmbed';
import VocarooEmbed from '../../components/molecules/VocarooEmbed';
import GfycatEmbed from '../../components/molecules/GfycatEmbed';
import YoutubeEmbed from '../../components/molecules/YoutubeEmbed';
import TwitchEmbed from '../../components/molecules/TwitchEmbed';
import TwitchClipEmbed from '../../components/molecules/TwitchClipEmbed';
import StreamableEmbed from '../../components/molecules/StreamableEmbed';
import RedGifsEmbed from '../../components/molecules/RedGifsEmbed';
import IFrame from '../../components/atoms/IFrame';
import Anchor from '../../components/atoms/Anchor';
import Video from '../../components/atoms/Video';
import { useSwipeable } from 'react-swipeable';

type Post = {
  author: string;
  created: number;
  domain: string;
  embed: string;
  num_comments: number;
  permalink: string;
  score: number;
  thumb: string;
  title: string;
  url: string;
};

function useGalleryFetch(subreddit: string, listing: string, period: string) {
  const [posts, setPosts] = useState<Array<Post>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState('');
  const [trigger, fetchMore] = useReducer((t) => !t, false);
  const [hasMorePages, setHasMorePages] = useState(false);
  const url = `https://www.reddit.com/r/${subreddit}/${listing}/.json?limit=${API_LIMIT}&count=${count}&after=${after}&t=${period}`;
  useEffect(() => {
    setIsLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((subreddit: Reddit) => {
        setAfter(subreddit.data.after || '');
        setHasMorePages(subreddit.data.after !== null);
        setPosts((prev) => {
          const next = subreddit.data.children
            .filter((i) => !i.data.is_self)
            .map((child) => ({
              author: child.data.author,
              created: child.data.created_utc,
              domain: child.data.domain,
              embed: child.data.secure_media_embed?.media_domain_url || '',
              num_comments: child.data.num_comments,
              permalink: `https://old.reddit.com${child.data.permalink}`,
              score: child.data.score,
              thumb: redditThumbnailUrl(child),
              title: decode(child.data.title),
              url: redditUrl(child),
            }));
          return (count === 0 && next) || prev.concat(next);
        });
        setCount((prevCount) => prevCount + API_LIMIT);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [trigger]);
  return { posts, isLoading, error, fetchMore, hasMorePages };
}

function DialogMain({ post }: { post: Post }) {
  if (post.url === '') return null;
  const { pathname, searchParams } = new URL(post.url);
  const slicedPathname = pathname.slice(1);

  if (post.url.endsWith('mp4')) {
    return <Video url={post.url} />;
  }

  if (['vocaroo.com', 'voca.ro'].includes(post.domain))
    return <VocarooEmbed id={slicedPathname} />;
  if (post.domain === 'redgifs.com')
    return <RedGifsEmbed id={pathname.split('/').reverse()[0]} />;

  if (post.domain === 'giphy.com') return <GiphyEmbed path={pathname} />;
  if (post.domain === 'v.redd.it') {
    return <VideoJS url={post.url} />;
  }
  if (post.domain === 'streamable.com') return <StreamableEmbed id={slicedPathname} />;
  if (post.domain === 'gfycat.com') return <GfycatEmbed url={post.url} />;
  if (post.domain === 'clips.twitch.tv') return <TwitchClipEmbed clip={slicedPathname} />;

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

  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(post.domain)) {
    const v = searchParams.get('v');
    const t = searchParams.get('t')?.replace(/s$/, '');
    if (v) return <YoutubeEmbed id={v} start={t} />;
    if (pathname.includes('/shorts/'))
      return (
        <img
          src={`https://i.ytimg.com/vi/${pathname.split('/')[2]}/hqdefault.jpg`}
          alt={post.title}
        />
      );
    if (pathname.includes('/live/'))
      return <YoutubeEmbed id={`${pathname.split('/')[2]}`} start="" />;
  }

  if (post.domain === 'youtu.be') {
    const t = searchParams.get('t')?.replace(/s$/, '');
    return <YoutubeEmbed id={slicedPathname} start={t} />;
  }

  if (['twitter.com', 'm.twitter.com', 'mobile.twitter.com'].includes(post.domain)) {
    if (post.embed.length > 0) {
      return <IFrame src={post.embed} className="reddit-iframe" />;
    } else if (pathname.match('^/\\w+[/]?$')) {
      // is twitter username link
      return null;
    } else {
      const tweetPath = pathname
        .replace(/\/photo\/[0-9]$/, '')
        .replace(/\/video\/[0-9]$/, '')
        .replace(/\/retweets\/with_comments$/, '');
      return (
        <IFrame
          src={`https://${NITTER_DOMAIN}${tweetPath}/embed`}
          className="nitter-iframe"
        />
      );
    }
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

function DialogDescription({ post }: { post: Post }) {
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
      <wbr />
      <time dateTime={format(end, 'yyyy-MM-dd HH:mm')}>{duration}</time>
    </figcaption>
  );
}

function Dialog({
  open,
  post,
  onClick,
  onSwipedLeft,
  onSwipedRight,
}: {
  open: boolean;
  post: Post | null;
  onClick: () => void;
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
}) {
  if (!post) return null;
  const handlers = useSwipeable({
    onSwipedRight: onSwipedRight,
    onSwipedLeft: onSwipedLeft,
  });
  return (
    <div {...handlers} onClick={onClick} className="backdrop">
      <dialog open={open} className="popup" onClick={(e) => e.stopPropagation()}>
        <small>[{post.score > 0 ? `+${post.score}` : post.score}] </small>
        {post.title}
        <figure>
          <DialogMain post={post} />
          <DialogDescription post={post} />
        </figure>
      </dialog>
    </div>
  );
}

function Gallery({ posts, nextPage }: { posts: Array<Post>; nextPage: Function }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<Post | null>(null);
  const [idx, setIdx] = useState(-1);
  const focusRef = useFocus();

  const nextPost = () => {
    setIdx((old) => {
      if (old > Math.max(0, posts.length - 5) && old <= Math.max(0, posts.length)) {
        nextPage();
      }
      return Math.min(old + 1, posts.length - 1);
    });
  };
  const prevPost = () => {
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
    focusRef.current?.focus();
  };
  useEffect(() => setContent(posts[idx]), [idx]);
  useEffect(() => {
    !open && setIdx(-1);
  }, [open]);
  useEffect(() => {
    content && setOpen(true);
  }, [content]);
  const onClickPost = (i: number) => setIdx(i);
  return (
    <main
      ref={focusRef}
      tabIndex={0}
      className="gallery"
      onKeyDown={(e) => {
        if (['ArrowRight', 'Period'].includes(e.code)) {
          nextPost();
        }
        if (['ArrowLeft', 'Comma'].includes(e.code)) {
          prevPost();
        }
        if (['KeyQ', 'Escape'].includes(e.code)) {
          closeDialog();
        }
      }}
    >
      {posts.map(
        (post, i) =>
          (post.embed === '' && post.embed) || (
            <div className="item" key={i} onClick={() => onClickPost(i)}>
              <ThumbnailContent post={post} />
            </div>
          ),
      )}
      {posts.length > 0 && (
        <Dialog
          open={open}
          post={content}
          onClick={closeDialog}
          onSwipedLeft={nextPost}
          onSwipedRight={prevPost}
        />
      )}
    </main>
  );
}

function ThumbnailContent({ post }: { post: Post }) {
  if (post.url.endsWith('.gif')) {
    return <img src={post.url} alt={post.title} />;
  } else if (isImage(post.thumb)) {
    return <img src={post.thumb} alt={post.title} />;
  } else if (isVideo(post.thumb)) {
    return <video loop muted autoPlay src={post.thumb} />;
  } else {
    return <p>{post.title}</p>;
  }
}

type Props = {
  sub?: string;
  listing?: string;
  period?: string;
};

export default function SubReddit({ sub = 'all', listing = 'new', period = '' }: Props) {
  const { posts, error, fetchMore, isLoading, hasMorePages } = useGalleryFetch(
    sub,
    listing,
    period,
  );
  const infinityRef = useInfinity({ onViewport: fetchMore, rootMargin: '100px' });
  if (error) return <p>Error!</p>;
  if (posts.length === 0) return <p> Loading... </p>;
  return (
    <>
      <header>
        <h2>{`/r/${sub} (${listing})`}</h2>
      </header>
      <Gallery posts={posts} nextPage={fetchMore} />
      {!isLoading && hasMorePages && <div ref={infinityRef}>Loading More...</div>}
    </>
  );
}
