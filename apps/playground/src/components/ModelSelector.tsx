import { useState, useEffect } from 'react';
import { fetchHealth, switchModel } from '../api';

export function ModelSelector() {
  const [currentModel, setCurrentModel] = useState('');
  const [inputModel, setInputModel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then((h) => {
        setCurrentModel(h.model ?? '');
        setInputModel(h.model ?? '');
      })
      .catch(() => {});
  }, []);

  const handleSwitch = async () => {
    const id = inputModel.trim();
    if (!id || id === currentModel) return;
    setLoading(true);
    try {
      await switchModel(id);
      setCurrentModel(id);
    } catch (err) {
      console.error('Failed to switch model', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="model-selector">
      <label className="sidebar-label">Model</label>
      <div className="model-input-row">
        <input
          className="model-input"
          value={inputModel}
          onChange={(e) => setInputModel(e.target.value)}
          placeholder="model id"
        />
        <button
          className="model-switch-btn"
          disabled={loading || !inputModel.trim() || inputModel.trim() === currentModel}
          onClick={handleSwitch}
        >
          {loading ? '...' : 'Set'}
        </button>
      </div>
      {currentModel && <div className="model-current">Active: {currentModel}</div>}
    </div>
  );
}
