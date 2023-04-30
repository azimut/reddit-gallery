import { Route, Redirect } from 'wouter';

import './App.css';

import SubReddit from './components/pages/SubReddit';
import Welcome from './components/pages/Welcome';

export default function App() {
  const listings_periods = ['top', 'controversial'];
  const listings = ['best', 'hot', 'new', 'random', 'rising'].concat(listings_periods);
  const periods = ['hour', 'day', 'week', 'month', 'year', 'all'];
  return (
    <div className="App">
      <Route path="/" component={Welcome} />

      <Route path="/r/:sub">{(p) => <SubReddit sub={p.sub} />}</Route>

      {listings.map((listing) => (
        <Route key={listing} path={`/r/:sub/${listing}`}>
          {(p) => <SubReddit sub={p.sub} listing={listing} />}
        </Route>
      ))}

      {listings_periods.flatMap((listing) =>
        periods.map((period) => (
          <Route key={`${listing}/${period}`} path={`/r/:sub/${listing}/${period}`}>
            {(p) => <SubReddit sub={p.sub} listing={listing} period={period} />}
          </Route>
        )),
      )}

      <Route path="/:default">
        <Redirect to="/" />
      </Route>
    </div>
  );
}
