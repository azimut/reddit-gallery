import reactLogo from './assets/react.svg';
import './App.css';

function Input({ name, placeholder }: { name: string; placeholder: string | undefined }) {
  return (
    <input
      type="text"
      name={`${name}`}
      placeholder={(placeholder && `${placeholder}`) || ''}
      required
      autoFocus
    />
  );
}

function Label({ name }: { name: string }) {
  return <label htmlFor={`${name}`}>{`${name}`}</label>;
}

function Search({
  name,
  placeholder,
}: {
  name: string;
  placeholder: string | undefined;
}) {
  return (
    <form>
      <Label name={`${name}`} />
      <Input name={`${name}`} placeholder={`${placeholder}`} />
    </form>
  );
}

function App() {
  return (
    <div className="App">
      <img src={reactLogo} className="logo react" alt="React logo" />
      <h1>Reddit Gallery</h1>
      <Search name="/r/" placeholder="subreddit" />
    </div>
  );
}

export default App;
