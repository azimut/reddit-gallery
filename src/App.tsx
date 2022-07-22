import { useLocation, Route } from 'wouter';
import reactLogo from './assets/react.svg';
import './App.css';
import { RefObject, useRef } from 'react';

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

function App() {
  return (
    <div className="App">
      <Route path="/" component={Welcome} />
      <Route path="/r/:id">{(params) => <h1>{params.id}</h1>}</Route>
    </div>
  );
}

export default App;
