import { useEffect, useReducer, useState } from 'react';
import { decode } from 'html-entities';
import { redditUrl, redditThumbnailUrl } from '../../helpers/child';
import { Reddit, Post } from '../../types';
import { API_LIMIT } from '../../constants';

export default function useGalleryFetch(
  subreddit: string,
  listing: string,
  period: string,
) {
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
