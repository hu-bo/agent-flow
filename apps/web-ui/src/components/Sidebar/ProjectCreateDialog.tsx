import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUp, Folder, RefreshCw, X } from 'lucide-react';
import {
  createProject,
  fetchRunnerDirectory,
  fetchRunnerRoots,
  fetchRunners,
  type ProjectRecord,
  type RunnerDirectoryEntry,
  type RunnerRecord,
} from '../../api';

interface ProjectCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: ProjectRecord) => void;
}

export function ProjectCreateDialog({ open, onClose, onCreated }: ProjectCreateDialogProps) {
  const [runners, setRunners] = useState<RunnerRecord[]>([]);
  const [runnerId, setRunnerId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [roots, setRoots] = useState<RunnerDirectoryEntry[]>([]);
  const [entries, setEntries] = useState<RunnerDirectoryEntry[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [includeHidden, setIncludeHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onlineRunners = useMemo(() => runners.filter((runner) => runner.status === 'online'), [runners]);
  const sortedEntries = useMemo(
    () => [...entries].sort((left, right) => {
      if (left.type !== right.type) return left.type === 'directory' ? -1 : 1;
      return left.name.localeCompare(right.name);
    }),
    [entries],
  );

  const loadDirectory = useCallback(async (nextPath: string, nextRunnerId: string) => {
    if (!nextRunnerId || !nextPath) return;
    setLoading(true);
    setError('');
    try {
      const payload = await fetchRunnerDirectory({
        runnerId: nextRunnerId,
        path: nextPath,
        includeHidden,
      });
      setCurrentPath(payload.path || nextPath);
      setEntries(payload.entries ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to list directory');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [includeHidden]);

  const loadRoots = useCallback(async (nextRunnerId: string) => {
    if (!nextRunnerId) return;
    setLoading(true);
    setError('');
    try {
      const payload = await fetchRunnerRoots(nextRunnerId);
      const nextRoots = payload.roots ?? [];
      setRoots(nextRoots);
      const firstRoot = nextRoots[0]?.path ?? '';
      setCurrentPath(firstRoot);
      setEntries([]);
      if (firstRoot) await loadDirectory(firstRoot, nextRunnerId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load runner roots');
      setRoots([]);
      setEntries([]);
      setCurrentPath('');
    } finally {
      setLoading(false);
    }
  }, [loadDirectory]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void fetchRunners()
      .then(async (payload) => {
        if (cancelled) return;
        setRunners(payload.runners ?? []);
        const nextRunnerId = payload.runners.find((runner) => runner.status === 'online')?.runnerId ?? '';
        setRunnerId(nextRunnerId);
        if (nextRunnerId) await loadRoots(nextRunnerId);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'Failed to load runners');
      });
    return () => {
      cancelled = true;
    };
  }, [loadRoots, open]);

  useEffect(() => {
    if (open && runnerId) void loadRoots(runnerId);
  }, [includeHidden, loadRoots, open, runnerId]);

  if (!open) return null;

  const parentPath = getParentPath(currentPath);
  const handleCreate = async () => {
    if (!runnerId || !currentPath) return;
    setSaving(true);
    setError('');
    try {
      const payload = await createProject({
        runnerId,
        rootPath: currentPath,
        name: projectName.trim() || undefined,
      });
      onCreated(payload.project);
      setProjectName('');
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="project-dialog-backdrop" role="presentation">
      <div className="project-dialog" role="dialog" aria-modal="true" aria-label="Create project">
        <header className="project-dialog-header">
          <div>
            <h3>Create Project</h3>
            <p>Select a runner directory to use as the project root.</p>
          </div>
          <button type="button" className="sidebar-icon-btn" onClick={onClose} aria-label="Close">
            <X size={15} aria-hidden />
          </button>
        </header>

        <div className="project-dialog-controls">
          <label>
            <span>Runner</span>
            <select value={runnerId} onChange={(event) => setRunnerId(event.target.value)}>
              {onlineRunners.length === 0 ? (
                <option value="">No online runner</option>
              ) : (
                onlineRunners.map((runner) => (
                  <option key={runner.runnerId} value={runner.runnerId}>
                    {runner.hostName || runner.host || runner.runnerId}
                  </option>
                ))
              )}
            </select>
          </label>
          <label>
            <span>Name</span>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Derived from directory"
            />
          </label>
        </div>

        <div className="directory-manager">
          <div className="directory-toolbar">
            <button
              type="button"
              className="directory-tool-btn"
              disabled={!parentPath || loading}
              onClick={() => parentPath && void loadDirectory(parentPath, runnerId)}
              aria-label="Go to parent directory"
            >
              <ArrowUp size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="directory-tool-btn"
              disabled={!currentPath || loading}
              onClick={() => void loadDirectory(currentPath, runnerId)}
              aria-label="Refresh directory"
            >
              <RefreshCw size={14} aria-hidden />
            </button>
            <label className="directory-hidden-toggle">
              <input
                type="checkbox"
                checked={includeHidden}
                onChange={(event) => setIncludeHidden(event.target.checked)}
              />
              hidden
            </label>
          </div>

          <div className="directory-breadcrumb" title={currentPath || 'No directory selected'}>
            {currentPath || 'No directory selected'}
          </div>

          {roots.length > 1 && (
            <div className="directory-roots">
              {roots.map((root) => (
                <button
                  key={root.path}
                  type="button"
                  className={`directory-root${root.path === currentPath ? ' is-active' : ''}`}
                  onClick={() => void loadDirectory(root.path, runnerId)}
                >
                  {root.name}
                </button>
              ))}
            </div>
          )}

          <div className="directory-list">
            {loading && <div className="directory-state">Loading directory...</div>}
            {!loading && error && <div className="directory-state is-error">{error}</div>}
            {!loading && !error && sortedEntries.length === 0 && <div className="directory-state">Empty directory</div>}
            {!loading && !error && sortedEntries.map((entry) => (
              <button
                key={entry.path}
                type="button"
                className={`directory-entry${entry.type === 'file' ? ' is-file' : ''}`}
                disabled={entry.type !== 'directory'}
                onClick={() => entry.type === 'directory' && void loadDirectory(entry.path, runnerId)}
              >
                {entry.type === 'directory' ? <Folder size={15} aria-hidden /> : <span className="file-dot" />}
                <span>{entry.name}</span>
              </button>
            ))}
          </div>
        </div>

        <footer className="project-dialog-footer">
          <button type="button" className="project-dialog-cancel" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="project-dialog-create"
            disabled={!runnerId || !currentPath || saving}
            onClick={handleCreate}
          >
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function getParentPath(path: string): string | null {
  const trimmed = path.trim();
  if (!trimmed || trimmed === '/') return null;
  const normalized = trimmed.replace(/[\\/]+$/, '');
  if (/^[A-Za-z]:$/.test(normalized)) return null;
  const slash = Math.max(normalized.lastIndexOf('/'), normalized.lastIndexOf('\\'));
  if (slash < 0) return null;
  if (slash === 0) return '/';
  const parent = normalized.slice(0, slash);
  return /^[A-Za-z]:$/.test(parent) ? `${parent}\\` : parent;
}
