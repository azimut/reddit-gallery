import { ReactNode } from 'react';

export default function Label({
  name,
  children,
}: {
  name: string;
  children?: ReactNode;
}) {
  return <label htmlFor={name}>{children}</label>;
}
