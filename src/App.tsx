import { useLocation, Route } from 'wouter';
import reactLogo from './assets/react.svg';
import './App.css';
import { RefObject, useEffect, useReducer, useRef, useState } from 'react';
import { Reddit } from '../src/types';

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
    <div className="welcome">
      <img src={reactLogo} className="logo react" alt="React logo" />
      <h1>Reddit Gallery</h1>
      <form onSubmit={onSubmit}>
        <Search name="subreddit" label="/r/" inputRef={inputRef} />
      </form>
    </div>
  );
}

type PostData = {
  thumb: string;
  domain: string;
  url: string; // TODO: "nsfw", "spoiler"...check if image
  isVideo: boolean;
  permalink: string;
  title: string;
};

function useGalleryFetch(subreddit: string) {
  const [images, setImages] = useState<Array<PostData>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState('');
  const [state, dispatch] = useReducer((t) => !t, false);
  const API_LIMIT = 25;
  useEffect(() => setCount(0), [subreddit]);
  useEffect(() => {
    setLoading(true);
    fetch(
      `https://www.reddit.com/r/${subreddit}/new/.json?limit=${API_LIMIT}&count=${count}&after=${after}`,
    )
      .then((res) => res.json())
      .then((data: Reddit) => {
        setCount((prevCount) => prevCount + API_LIMIT);
        setAfter(data.data.after || '');
        setImages(
          data.data.children
            .map((e) => ({
              isVideo:
                ['youtube.com', 'streamable.com'].includes(e.data.domain) ||
                e.data.is_video,
              thumb: e.data.thumbnail,
              domain: e.data.domain,
              url: e.data.url,
              permalink: `https://old.reddit.com${e.data.permalink}`,
              title: e.data.title,
            }))
            .filter((i) => !['self', 'default'].includes(i.thumb)),
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [state]);
  return { images, loading, error, dispatch };
}

function Gallery({ images }: { images: Array<PostData> }) {
  return (
    <div className="port">
      {images.map((i) => (
        <a href={i.url} target="_blank" rel="noreferrer noopener">
          <img src={(i.url.endsWith('.gif') && i.url) || i.thumb} />
        </a>
      ))}
    </div>
  );
}

function SubReddit() {
  const [location] = useLocation();
  const { images, loading, error, dispatch } = useGalleryFetch(location.slice(3));
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return (
    <>
      <h2>{location}</h2>
      <Gallery images={images} />
      <button onClick={dispatch}>Next Page</button>
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
