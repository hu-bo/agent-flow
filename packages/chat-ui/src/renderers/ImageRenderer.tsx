import type { ContentRendererProps } from '../registry';
import type { ImagePart } from '../types';

export function ImageRenderer({ part }: ContentRendererProps) {
  const { source } = part as ImagePart;

  const src =
    source.type === 'url'
      ? source.url
      : `data:${source.mediaType};base64,${source.data}`;

  return (
    <img
      src={src}
      alt="message image"
      className="my-1 max-h-80 max-w-full rounded-lg object-contain"
      loading="lazy"
    />
  );
}
