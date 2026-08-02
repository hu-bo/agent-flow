interface WorkspacePlaceholderProps {
  label: string;
  description: string;
}

export function WorkspacePlaceholder({ label, description }: WorkspacePlaceholderProps) {
  return (
    <section className="workspace-canvas">
      <div className="workspace-placeholder">
        <strong>{label}</strong>
        <span>{description}</span>
      </div>
    </section>
  );
}
