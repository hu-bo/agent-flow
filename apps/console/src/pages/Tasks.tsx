import { useState } from 'react';
import { fetchTask, createTask, type TaskState, type CreateTaskResult } from '../api';

const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-pending',
  running: 'badge-running',
  paused: 'badge-paused',
  completed: 'badge-completed',
  failed: 'badge-failed',
};

export function Tasks() {
  // Lookup
  const [lookupId, setLookupId] = useState('');
  const [task, setTask] = useState<TaskState | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Create
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [createResult, setCreateResult] = useState<CreateTaskResult | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleLookup = () => {
    if (!lookupId.trim()) return;
    setLookupError(null);
    setTask(null);
    fetchTask(lookupId.trim())
      .then(setTask)
      .catch((err) => setLookupError(String(err)));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setCreateError(null);
    setCreateResult(null);
    createTask({ prompt: prompt.trim(), model: model.trim() || undefined })
      .then((result) => {
        setCreateResult(result);
        setPrompt('');
        setModel('');
      })
      .catch((err) => setCreateError(String(err)));
  };

  return (
    <div>
      <h1>Tasks</h1>

      {/* Lookup Section */}
      <section className="section">
        <h2>Look Up Task</h2>
        <div className="inline-form">
          <label htmlFor="task-lookup-id" className="sr-only">Task ID</label>
          <input
            id="task-lookup-id"
            type="text"
            placeholder="Enter task ID"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
          <button className="btn" onClick={handleLookup}>Fetch</button>
        </div>

        {lookupError && (
          <div className="error-box" role="alert">{lookupError}</div>
        )}

        {task && (
          <div className="task-details">
            <table className="detail-table">
              <tbody>
                <tr><th>Task ID</th><td className="mono">{task.taskId}</td></tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={`badge ${STATUS_CLASS[task.status] ?? ''}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
                <tr><th>Session ID</th><td className="mono">{task.sessionId}</td></tr>
                <tr><th>Created At</th><td>{new Date(task.createdAt).toLocaleString()}</td></tr>
                <tr><th>Updated At</th><td>{new Date(task.updatedAt).toLocaleString()}</td></tr>
                <tr><th>Checkpoint</th><td className="mono">{task.latestCheckpointId}</td></tr>
                <tr><th>Retries</th><td>{task.retryCount} / {task.maxRetries}</td></tr>
                {task.error && (
                  <tr><th>Error</th><td className="error-text">{task.error}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create Section */}
      <section className="section">
        <h2>Create Task</h2>
        <form className="create-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="task-prompt">Prompt</label>
            <textarea
              id="task-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter task prompt..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-model">Model (optional)</label>
            <input
              id="task-model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. claude-sonnet-4-20250514"
            />
          </div>
          <button className="btn" type="submit">Create Task</button>
        </form>

        {createError && (
          <div className="error-box" role="alert">{createError}</div>
        )}

        {createResult && (
          <div className="success-box" role="status">
            Task created: <span className="mono">{createResult.taskId}</span> — status: {createResult.status}
          </div>
        )}
      </section>
    </div>
  );
}
