import { format, formatDistance, fromUnixTime } from 'date-fns';
import { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Tweet } from 'react-tweet';

import { NITTER_DOMAIN } from '../../constants';
import { isImage, isVideo } from '../../helpers/validators';

import '../../App.css';
import { Post } from '../../types';
import useGalleryFetch from './useGalleryFetch';
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

function DialogMain({ post }: { post: Post }) {
  if (post.url === '') return null;
  const { pathname, searchParams } = new URL(post.url);
  const slicedPathname = pathname.slice(1);

  if (post.url.endsWith('mp4')) {
    return <Video url={post.url} />;
  }

  switch (post.domain) {
    case 'giphy.com':
      return <GiphyEmbed path={pathname} />;
    case 'v.redd.it':
      return <VideoJS url={post.url} />;
    case 'streamable.com':
      return <StreamableEmbed id={slicedPathname} />;
    case 'gfycat.com':
      return <GfycatEmbed url={post.url} />;
    case 'clips.twitch.tv':
      return <TwitchClipEmbed clip={slicedPathname} />;
    case 'redgifs.com':
      return <RedGifsEmbed id={pathname.split('/').reverse()[0]} />;
    case 'vocaroo.com':
    case 'voca.ro':
      return <VocarooEmbed id={slicedPathname} />;
    case 'youtu.be':
      return <YoutubeEmbed id={slicedPathname} t={searchParams.get('t') || ''} />;
    case 'youtube.com':
    case 'www.youtube.com':
    case 'm.youtube.com':
      const v = searchParams.get('v');
      const t = searchParams.get('t') || '';
      if (v) return <YoutubeEmbed id={v} t={t} />;
      if (pathname.includes('/shorts/'))
        return (
          <img
            src={`https://i.ytimg.com/vi/${pathname.split('/')[2]}/hqdefault.jpg`}
            alt={post.title}
          />
        );
      if (pathname.includes('/live/'))
        return <YoutubeEmbed id={`${pathname.split('/')[2]}`} t={t} />;
      break; // NOTE: we don't know how to handle /shorts/
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

  if (
    ['twitter.com', 'm.twitter.com', 'mobile.twitter.com', 'x.com'].includes(post.domain)
  ) {
    if (post.embed.length > 0) {
      return <IFrame src={post.embed} className="reddit-iframe" />;
    } else if (pathname.match('^/\\w+[/]?$')) {
      // is twitter username link
      return null;
    } else if (pathname.includes('/status/')) {
      const tweetId = pathname.split('/')[3];
      return <Tweet id={tweetId} />;
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
    preventScrollOnSwipe: true,
    onSwipedRight: onSwipedRight,
    onSwipedLeft: onSwipedLeft,
  });
  return (
    <div {...handlers} onClick={onClick} className="backdrop">
      <dialog
        open={open}
        className="popup"
        onClick={(e) => {
          if (!isImage(post.url)) {
            e.stopPropagation();
          }
        }}
      >
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
  const closeDialog = () => {
    setOpen(false);
    focusRef.current?.focus();
  };
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
