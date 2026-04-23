import './ImageRenderer.less';
import './FileAttachmentRenderer.less';
import type { ContentRendererProps } from '../registry';
import type { FilePart } from '../types';

export function FileAttachmentRenderer({ part }: ContentRendererProps) {
  const { mimeType, data } = part as FilePart;

  const isImage = mimeType.startsWith('image/');
  const src = `data:${mimeType};base64,${data}`;

  if (isImage) {
    return <img src={src} alt="attached file" className="chat-ui-inline-image" loading="lazy" />;
  }

  return (
    <div className="chat-ui-file-card">
      <span className="chat-ui-file-icon">FILE</span>
      <div className="chat-ui-file-meta">
        <div className="chat-ui-file-type">{mimeType}</div>
        <div className="chat-ui-file-size">{Math.ceil((data.length * 0.75) / 1024)} KB</div>
      </div>
    </div>
  );
}
