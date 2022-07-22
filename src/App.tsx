import { useLocation, Route } from 'wouter';
import reactLogo from './assets/react.svg';
import './App.css';
import { RefObject, useEffect, useRef, useState } from 'react';
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
    <>
      <img src={reactLogo} className="logo react" alt="React logo" />
      <h1>Reddit Gallery</h1>
      <form onSubmit={onSubmit}>
        <Search name="subreddit" label="/r/" inputRef={inputRef} />
      </form>
    </>
  );
}

function useGalleryFetch(subreddit: string) {
  const [images, setImages] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(`https://www.reddit.com/r/${subreddit}/new/.json`)
      .then((res) => res.json())
      .then((data: Reddit) =>
        setImages(
          data.data.children.map((e) => e.data.thumbnail).filter((i) => i !== 'self'),
        ),
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [subreddit]);
  return { images, loading, error };
}

function Gallery() {
  const [location] = useLocation();
  const { images, loading, error } = useGalleryFetch(location.slice(3));
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return (
    <ul>
      {images.map((i) => (
        <img src={i} />
      ))}
    </ul>
  );
}

function App() {
  return (
    <div className="App">
      <Route path="/" component={Welcome} />
      <Route path="/r/:id" component={Gallery} />
    </div>
  );
}

export default App;
