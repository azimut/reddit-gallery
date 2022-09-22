import { ReactNode } from 'react';

export default function Anchor({
  href,
  children,
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}
