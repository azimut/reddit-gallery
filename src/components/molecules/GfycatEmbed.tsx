import IFrame from '../atoms/IFrame';

export default function GfycatEmbed({ url }: { url: string }) {
  return <IFrame src={`https://gfycat.com/ifr/${url.split('/').pop()}`} />;
}
