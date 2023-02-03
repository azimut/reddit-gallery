import IFrame from '../atoms/IFrame';

// https://support.streamable.com/article/61-advanced-embedding
export default function StreamableEmbed({ id }: { id: string }) {
  return <IFrame src={`https://streamable.com/e/${id}?autoplay=1`} />;
}
