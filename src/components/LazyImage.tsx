import { useEffect, useRef, useState } from "react";

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
};

function webpCandidate(src: string): string | null {
  if (!src.endsWith(".png")) return null;
  return src.replace(/\.png$/, ".webp");
}

const PLACEHOLDER_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  fetchPriority = "low",
}: LazyImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const webp = webpCandidate(src);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shared = {
    ref,
    className,
    alt,
    loading: "lazy" as const,
    decoding: "async" as const,
    fetchPriority,
    width,
    height,
    sizes,
  };

  if (webp) {
    return (
      <picture>
        {visible ? <source srcSet={webp} type="image/webp" sizes={sizes} /> : null}
        <img
          {...shared}
          src={visible ? src : PLACEHOLDER_SRC}
        />
      </picture>
    );
  }

  return (
    <img
      {...shared}
      src={visible ? src : PLACEHOLDER_SRC}
    />
  );
}
