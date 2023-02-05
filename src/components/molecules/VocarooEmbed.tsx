import IFrame from '../atoms/IFrame';

export default function VocarooEmbed({ id }: { id: string }) {
  return <IFrame src={`https://vocaroo.com/embed/${id}?autoplay=1`} />;
}
