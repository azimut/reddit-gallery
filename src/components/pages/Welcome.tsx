import { useRef } from 'react';
import { useLocation } from 'wouter';
import redditLogo from '../../assets/reddit-svgrepo-com.svg';
import Anchor from '../atoms/Anchor';
import Search from '../molecules/Search';
import './Welcome.css';

export default function Welcome() {
  const [_, pushLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current) return;
    pushLocation(`/r/${inputRef.current.value}`);
  };
  return (
    <div className="welcome">
      <main>
        <img src={redditLogo} className="logo react" alt="Reddit logo" />
        <h1>Reddit Gallery</h1>
        <form onSubmit={onSubmit}>
          <Search name="subreddit" label="r/" inputRef={inputRef} />
        </form>
      </main>
      <footer>
        <Anchor href="https://github.com/azimut/reddit-gallery/">Code</Anchor>
      </footer>
    </div>
  );
}
