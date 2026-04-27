import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAdminProvider,
  createProviderCredential,
  deleteAdminProvider,
  fetchAdminProviders,
  updateAdminProvider,
  type ProviderRecord,
} from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';

type ProviderPreset = 'openai' | 'anthropic' | 'custom';

const PRESET_META: Record<
  Exclude<ProviderPreset, 'custom'>,
  { name: string; type: string; officialUrl: string; baseUrl: string }
> = {
  openai: {
    name: 'openai',
    type: 'openai',
    officialUrl: 'https://platform.openai.com',
    baseUrl: 'https://api.openai.com/v1',
  },
  anthropic: {
    name: 'anthropic',
    type: 'anthropic',
    officialUrl: 'https://www.anthropic.com',
    baseUrl: 'https://api.anthropic.com',
  },
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function metadataValue(provider: ProviderRecord, key: string) {
  const metadata = provider.metadata;
  if (!metadata || typeof metadata !== 'object') return '';
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}

export function Providers() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingProviderId, setUpdatingProviderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [providers, setProviders] = useState<ProviderRecord[]>([]);

  const [preset, setPreset] = useState<ProviderPreset>('openai');
  const [providerName, setProviderName] = useState(PRESET_META.openai.name);
  const [providerType, setProviderType] = useState(PRESET_META.openai.type);
  const [officialUrl, setOfficialUrl] = useState(PRESET_META.openai.officialUrl);
  const [baseUrl, setBaseUrl] = useState(PRESET_META.openai.baseUrl);
  const [apiKey, setApiKey] = useState('');
  const [extraConfig, setExtraConfig] = useState('{\n  "timeoutMs": 60000\n}');

  const loadProviders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAdminProviders();
      setProviders(list);
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => a.name.localeCompare(b.name)),
    [providers],
  );

  const applyPreset = (nextPreset: ProviderPreset) => {
    setPreset(nextPreset);
    if (nextPreset === 'custom') {
      setProviderName('');
      setProviderType('');
      setOfficialUrl('');
      setBaseUrl('');
      setExtraConfig('{}');
      return;
    }

    const template = PRESET_META[nextPreset];
    setProviderName(template.name);
    setProviderType(template.type);
    setOfficialUrl(template.officialUrl);
    setBaseUrl(template.baseUrl);
    setExtraConfig('{\n  "timeoutMs": 60000\n}');
  };

  const handleCreateProvider = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!providerName.trim() || !providerType.trim() || !apiKey.trim()) {
      setError('Provider name, provider type and apiKey are required.');
      return;
    }

    let parsedConfig: Record<string, unknown> = {};
    try {
      const raw = extraConfig.trim();
      if (raw.length > 0) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsedConfig = parsed as Record<string, unknown>;
        } else {
          throw new Error('Extra config must be a JSON object.');
        }
      }
    } catch (err) {
      setError(`Invalid JSON in extra config: ${toErrorMessage(err)}`);
      return;
    }

    setSubmitting(true);
    try {
      const provider = await createAdminProvider({
        name: providerName.trim(),
        type: providerType.trim(),
        status: 'active',
        metadata: {
          preset,
          officialUrl: officialUrl.trim() || null,
          baseUrl: baseUrl.trim() || null,
          config: parsedConfig,
        },
      });

      await createProviderCredential(provider.providerId, {
        apiKey: apiKey.trim(),
        keyVersion: 1,
        status: 'active',
      });

      setApiKey('');
      setSuccess(`Provider ${provider.name} created.`);
      setError(null);
      await loadProviders();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProvider = async (provider: ProviderRecord) => {
    try {
      await deleteAdminProvider(provider.providerId);
      setSuccess(`Provider ${provider.name} deleted.`);
      setError(null);
      await loadProviders();
    } catch (err) {
      const message = toErrorMessage(err);
      const conflictHint = message.includes('409:')
        ? ' This provider still has model bindings in routing policies. Switch related primary models or remove those models first.'
        : '';
      setError(`${message}${conflictHint}`);
    }
  };

  const handleEnableProvider = async (provider: ProviderRecord) => {
    if (provider.status === 'active') {
      return;
    }
    setUpdatingProviderId(provider.providerId);
    try {
      await updateAdminProvider(provider.providerId, {
        status: 'active',
      });
      setSuccess(`Provider ${provider.name} enabled. Other providers were set to disabled.`);
      setError(null);
      await loadProviders();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setUpdatingProviderId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Provider</h1>
        <button className="btn btn-ghost" onClick={() => void loadProviders()}>
          Refresh
        </button>
      </div>

      <section className="section panel">
        <h2>New Provider</h2>
        <p className="muted-line">参考 CC switch：先选厂商模板，再补充 API 配置。</p>

        <div className="template-row">
          <button
            className={`template-chip ${preset === 'openai' ? 'active' : ''}`}
            onClick={() => applyPreset('openai')}
            type="button"
          >
            OpenAI
          </button>
          <button
            className={`template-chip ${preset === 'anthropic' ? 'active' : ''}`}
            onClick={() => applyPreset('anthropic')}
            type="button"
          >
            Anthropic
          </button>
          <button
            className={`template-chip ${preset === 'custom' ? 'active' : ''}`}
            onClick={() => applyPreset('custom')}
            type="button"
          >
            Custom
          </button>
        </div>

        <form onSubmit={(event) => void handleCreateProvider(event)} className="form-two-cols">
          <div className="form-group">
            <label htmlFor="provider-name">Provider Name</label>
            <input
              id="provider-name"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="openai-prod"
            />
          </div>

          <div className="form-group">
            <label htmlFor="provider-type">Provider Type</label>
            <input
              id="provider-type"
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              placeholder="openai / anthropic"
            />
          </div>

          <div className="form-group">
            <label htmlFor="provider-official-url">Official Website</label>
            <input
              id="provider-official-url"
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://platform.openai.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="provider-base-url">Base URL</label>
            <input
              id="provider-base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
          </div>

          <div className="form-group form-span-full">
            <label htmlFor="provider-api-key">apiKey</label>
            <input
              id="provider-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              type="password"
            />
          </div>

          <div className="form-group form-span-full">
            <label htmlFor="provider-extra-config">Other Config (JSON)</label>
            <textarea
              id="provider-extra-config"
              value={extraConfig}
              onChange={(e) => setExtraConfig(e.target.value)}
              rows={8}
              className="json-input mono"
            />
          </div>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Provider'}
          </button>
        </form>

        {error && <div className="error-box" role="alert">{error}</div>}
        {success && <div className="success-box" role="status">{success}</div>}
      </section>

      <section className="section panel">
        <h2>Provider List</h2>
        {loading ? (
          <p className="muted-line">Loading providers...</p>
        ) : (
          <table className="table-soft">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Official URL</th>
                <th>Base URL</th>
                <th>Models</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedProviders.map((provider) => (
                <tr key={provider.providerId}>
                  <td className="mono">{provider.name}</td>
                  <td>{provider.type}</td>
                  <td>{metadataValue(provider, 'officialUrl') || '—'}</td>
                  <td className="mono">{metadataValue(provider, 'baseUrl') || '—'}</td>
                  <td>{provider.activeModelCount}</td>
                  <td>
                    <span
                      className={`badge ${
                        provider.status === 'active' ? 'badge-completed' : 'badge-paused'
                      }`}
                    >
                      {provider.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => void handleEnableProvider(provider)}
                        disabled={updatingProviderId !== null}
                      >
                        {updatingProviderId === provider.providerId
                          ? 'Enabling...'
                          : provider.status === 'active'
                            ? 'Set Active'
                            : 'Enable'}
                      </button>
                      <ConfirmDialog
                        title="Delete provider?"
                        description={`This action will remove provider ${provider.name} and its credentials/models.`}
                        confirmText="Delete provider"
                        triggerText="Delete"
                        triggerClassName="btn btn-sm btn-danger"
                        onConfirm={() => handleDeleteProvider(provider)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
