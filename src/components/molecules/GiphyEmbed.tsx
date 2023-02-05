import IFrame from '../atoms/IFrame';

export default function GiphyEmbed({ path }: { path: string }) {
  const id = path.replace('/gifs/', '').replace('reaction-', '');
  return <IFrame src={`https://giphy.com/embed/${id}`} />;
}
