import type { ContentRendererProps } from '../registry';
import type { FilePart } from '../types';

export function FileAttachmentRenderer({ part }: ContentRendererProps) {
  const { mimeType, data } = part as FilePart;

  const isImage = mimeType.startsWith('image/');
  const src = `data:${mimeType};base64,${data}`;

  if (isImage) {
    return (
      <img
        src={src}
        alt="attached file"
        className="my-1 max-h-60 max-w-full rounded-lg object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <div className="my-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <span className="text-lg">📎</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-700">{mimeType}</div>
        <div className="text-xs text-gray-400">{Math.ceil(data.length * 0.75 / 1024)} KB</div>
      </div>
    </div>
  );
}
