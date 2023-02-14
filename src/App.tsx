import { Route, Redirect } from 'wouter';

import './App.css';

import SubReddit from './components/pages/SubReddit';
import Welcome from './components/pages/Welcome';

export default function App() {
  return (
    <div className="App">
      <Route path="/" component={Welcome} />

      <Route path="/r/:sub">
        {(p) => <SubReddit sub={p.sub || 'all'} listing="new" period="" />}
      </Route>

      <Route path="/r/:sub/:listing">
        {(p) => <SubReddit sub={p.sub || 'all'} listing={p.listing || 'new'} period="" />}
      </Route>

      <Route path="/r/:sub/top/:period">
        {(p) => <SubReddit sub={p.sub || 'all'} listing="top" period={p.period || ''} />}
      </Route>

      <Route path="/:default">
        <Redirect to="/" />
      </Route>
    </div>
  );
}
