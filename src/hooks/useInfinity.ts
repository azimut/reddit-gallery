import { useRef, useEffect } from 'react';

export default function useInfinity({
  onViewport,
  rootMargin,
}: {
  onViewport: Function;
  rootMargin: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        onViewport();
      }
    };
    const observer = new IntersectionObserver(fn, {
      rootMargin,
    });
    ref.current && observer.observe(ref.current);
    return () => observer && observer.disconnect();
  });
  return ref;
}
