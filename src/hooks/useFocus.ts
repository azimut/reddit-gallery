import { RefObject, useRef, useEffect } from 'react';

export default function useFocus(): RefObject<HTMLElement> {
  const refToFocus = useRef<HTMLElement>(null);
  useEffect(() => refToFocus.current?.focus(), [refToFocus]);
  return refToFocus;
}
