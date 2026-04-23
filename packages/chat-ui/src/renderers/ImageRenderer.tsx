import './ImageRenderer.less';
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
      className="chat-ui-inline-image"
      loading="lazy"
    />
  );
}
