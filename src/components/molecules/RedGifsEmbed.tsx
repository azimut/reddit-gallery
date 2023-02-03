import IFrame from '../atoms/IFrame';

export default function RedGifsEmbed({ id }: { id: string }) {
  return <IFrame src={`https://redgifs.com/ifr/${id}`} />;
}
