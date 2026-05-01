import { useCallback, useEffect, useMemo, useState } from 'react';
import { Select } from '@radix-ui/themes';
import {
  createAdminModel,
  deleteAdminModel,
  fetchAdminModels,
  fetchModelProfiles,
  fetchAdminProviders,
  upsertRoutingPolicy,
  type ModelProfileRecord,
  updateAdminModel,
  type ProviderModelRecord,
  type ProviderRecord,
} from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';

const defaultTokenLimit = '200000';
function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function Models() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [models, setModels] = useState<ProviderModelRecord[]>([]);
  const [profiles, setProfiles] = useState<ModelProfileRecord[]>([]);
  const [providerFilter, setProviderFilter] = useState('all');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedPrimaryModelId, setSelectedPrimaryModelId] = useState('');
  const [routingSubmitting, setRoutingSubmitting] = useState(false);

  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [model, setModel] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [providerId, setProviderId] = useState('');
  const [tokenLimit, setTokenLimit] = useState(defaultTokenLimit);
  const [status, setStatus] = useState<'active' | 'disabled'>('active');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [providerList, modelList, profileList] = await Promise.all([
        fetchAdminProviders(),
        fetchAdminModels(),
        fetchModelProfiles(),
      ]);
      setProviders(providerList);
      setModels(modelList);
      setProfiles(profileList);
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!providerId && providers.length > 0) {
      setProviderId(String(providers[0].providerId));
    }
  }, [providers, providerId]);

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfileId('');
      return;
    }
    if (selectedProfileId && profiles.some((profile) => profile.profileId === selectedProfileId)) {
      return;
    }
    const defaultProfileId =
      profiles.find((profile) => profile.profileId === 'chat-default')?.profileId ??
      profiles[0].profileId;
    setSelectedProfileId(defaultProfileId);
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (!selectedProfileId) {
      setSelectedPrimaryModelId('');
      return;
    }
    const targetProfile = profiles.find((profile) => profile.profileId === selectedProfileId);
    if (!targetProfile) {
      setSelectedPrimaryModelId('');
      return;
    }
    const activeModelIds = models
      .filter((model) => model.status === 'active')
      .map((model) => model.modelId);
    const preferredModelId = targetProfile.routingPolicy?.primaryModelId;
    if (preferredModelId && activeModelIds.includes(preferredModelId)) {
      setSelectedPrimaryModelId(String(preferredModelId));
      return;
    }
    setSelectedPrimaryModelId(activeModelIds[0] ? String(activeModelIds[0]) : '');
  }, [models, profiles, selectedProfileId]);

  const resetForm = () => {
    setEditingModelId(null);
    setModel('');
    setDisplayName('');
    setTokenLimit(defaultTokenLimit);
    setStatus('active');
  };

  const visibleModels = useMemo(() => {
    if (providerFilter === 'all') return models;
    return models.filter((model) => String(model.providerId) === providerFilter);
  }, [models, providerFilter]);

  const activeModels = useMemo(
    () => models.filter((model) => model.status === 'active'),
    [models],
  );

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.profileId === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  const handleEdit = (model: ProviderModelRecord) => {
    setEditingModelId(model.modelId);
    setModel(model.model);
    setDisplayName(model.displayName);
    setProviderId(String(model.providerId));
    setTokenLimit(String(model.tokenLimit));
    setStatus(model.status);
  };

  const handleDelete = async (targetModelId: number) => {
    try {
      await deleteAdminModel(targetModelId);
      setSuccess(`Model ${targetModelId} deleted.`);
      setError(null);
      await loadAll();
      if (editingModelId === targetModelId) {
        resetForm();
      }
    } catch (err) {
      const message = toErrorMessage(err);
      const conflictHint = message.includes('409:')
        ? ' This model is still set as a profile primary model. Switch the profile primary model in "Primary Model Routing" first, then delete again.'
        : '';
      setError(`${message}${conflictHint}`);
    }
  };

  const handleSetPrimaryModel = async (event: React.FormEvent) => {
    event.preventDefault();
    const primaryModelId = Number(selectedPrimaryModelId);
    if (!selectedProfileId || !Number.isInteger(primaryModelId) || primaryModelId <= 0) {
      setError('Please select both profile and primary model.');
      return;
    }

    setRoutingSubmitting(true);
    try {
      const existingFallbacks = (selectedProfile?.routingPolicy?.fallbacks ?? []).filter(
        (modelId): modelId is number => Number.isInteger(modelId),
      );
      const nextFallbacks = existingFallbacks.filter((modelId) => modelId !== primaryModelId);
      await upsertRoutingPolicy(selectedProfileId, {
        primaryModelId,
        fallbacks: nextFallbacks,
        strategy: selectedProfile?.routingPolicy?.strategy ?? 'ordered',
        status: selectedProfile?.routingPolicy?.status ?? 'active',
      });
      setSuccess(`Primary model for profile ${selectedProfileId} updated to ${selectedPrimaryModelId}.`);
      setError(null);
      await loadAll();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setRoutingSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!model.trim() || !displayName.trim() || !providerId) {
      setError('model, displayName and provider are required.');
      return;
    }

    const tokenLimitNumber = Number(tokenLimit);
    if (!Number.isFinite(tokenLimitNumber) || tokenLimitNumber <= 0) {
      setError('Token limit must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      if (!editingModelId) {
        await createAdminModel({
          model: model.trim(),
          displayName: displayName.trim(),
          providerId: Number(providerId),
          tokenLimit: tokenLimitNumber,
          status,
        });
        setSuccess(`Model ${model.trim()} created.`);
      } else {
        await updateAdminModel(editingModelId, {
          model: model.trim(),
          displayName: displayName.trim(),
          providerId: Number(providerId),
          tokenLimit: tokenLimitNumber,
          status,
        });
        setSuccess(`Model ${editingModelId} updated.`);
      }
      setError(null);
      await loadAll();
      resetForm();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Model</h1>
        <button className="btn btn-ghost" onClick={() => void loadAll()}>
          Refresh
        </button>
      </div>

      <section className="section panel">
        <h2>Primary Model Routing</h2>
        <p className="muted-line">
          Before deleting a model, switch any profile that still uses it as primary model.
        </p>
        <form className="form-inline-cards" onSubmit={(event) => void handleSetPrimaryModel(event)}>
          <div className="form-group">
            <label htmlFor="routing-profile-id">Profile</label>
            <Select.Root value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <Select.Trigger id="routing-profile-id" className="radix-select-trigger" />
              <Select.Content position="popper">
                {profiles.map((profile) => (
                  <Select.Item key={profile.profileId} value={profile.profileId}>
                    {profile.displayName} ({profile.profileId})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
          <div className="form-group">
            <label htmlFor="routing-primary-model-id">Primary Model</label>
            <Select.Root value={selectedPrimaryModelId} onValueChange={setSelectedPrimaryModelId}>
              <Select.Trigger id="routing-primary-model-id" className="radix-select-trigger" />
              <Select.Content position="popper">
                {activeModels.map((model) => (
                  <Select.Item key={model.modelId} value={String(model.modelId)}>
                    {model.displayName} ({model.providerType}/{model.model})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
          <div className="form-group">
            <label htmlFor="routing-current-primary">Current Primary</label>
            <input
              id="routing-current-primary"
              className="mono"
              value={
                selectedProfile?.routingPolicy?.primaryModelId
                  ? String(selectedProfile.routingPolicy.primaryModelId)
                  : '(not configured)'
              }
              readOnly
            />
          </div>
          <div className="form-group">
            <button className="btn" type="submit" disabled={routingSubmitting || activeModels.length === 0}>
              {routingSubmitting ? 'Saving...' : 'Update Primary Model'}
            </button>
          </div>
        </form>
      </section>

      <section className="section panel">
        <h2>{editingModelId ? `Edit Model · ${editingModelId}` : 'New Model'}</h2>
        <p className="muted-line">
          这里维护的模型用于下发给 <span className="mono">apps/web-ui</span>（通过 API 获取）。
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="form-two-cols">
          <div className="form-group">
            <label htmlFor="model-name">Model</label>
            <input
              id="model-name"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-5.4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model-display-name">Display Name</label>
            <input
              id="model-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="GPT-4.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model-provider">Provider</label>
            <Select.Root
              value={providerId}
              onValueChange={setProviderId}
              // disabled={Boolean(editingModelId)}
            >
              <Select.Trigger id="model-provider" className="radix-select-trigger" />
              <Select.Content position="popper">
                {providers.map((provider) => (
                  <Select.Item key={provider.providerId} value={String(provider.providerId)}>
                    {provider.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="form-group">
            <label htmlFor="model-token-limit">Token Limit</label>
            <input
              id="model-token-limit"
              value={tokenLimit}
              onChange={(e) => setTokenLimit(e.target.value)}
              placeholder="128000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model-status">Status</label>
            <Select.Root
              value={status}
              onValueChange={(value) => setStatus(value as 'active' | 'disabled')}
            >
              <Select.Trigger id="model-status" className="radix-select-trigger" />
              <Select.Content position="popper">
                <Select.Item value="active">active</Select.Item>
                <Select.Item value="disabled">disabled</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          <div className="form-actions-row">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingModelId
                  ? `Save ${editingModelId}`
                  : 'Create Model'}
            </button>
            {editingModelId && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {error && <div className="error-box" role="alert">{error}</div>}
        {success && <div className="success-box" role="status">{success}</div>}
      </section>

      <section className="section panel">
        <div className="page-header">
          <h2>Model List</h2>
          <div className="inline-form">
            <label htmlFor="provider-filter" className="sr-only">Provider Filter</label>
            <Select.Root
              value={providerFilter}
              onValueChange={setProviderFilter}
            >
              <Select.Trigger id="provider-filter" className="radix-select-trigger provider-filter-select" />
              <Select.Content position="popper">
                <Select.Item value="all">All Providers</Select.Item>
                {providers.map((provider) => (
                  <Select.Item key={provider.providerId} value={String(provider.providerId)}>
                    {provider.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {loading ? (
          <p className="muted-line">Loading models...</p>
        ) : (
          <table className="table-soft">
            <thead>
              <tr>
                <th>ID</th>
                <th>Model</th>
                <th>Runtime</th>
                <th>Display Name</th>
                <th>Provider</th>
                <th>Token Limit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleModels.map((model) => (
                <tr key={model.modelId}>
                  <td className="mono">{model.modelId}</td>
                  <td className="mono">{model.model}</td>
                  <td className="mono">{model.providerType}/{model.model}</td>
                  <td>{model.displayName}</td>
                  <td>{model.providerName}</td>
                  <td>{model.tokenLimit.toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        model.status === 'active' ? 'badge-completed' : 'badge-paused'
                      }`}
                    >
                      {model.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleEdit(model)}
                      >
                        Edit
                      </button>
                      <ConfirmDialog
                        title="Delete model?"
                        description={`This action will remove model ${model.modelId}.`}
                        confirmText="Delete model"
                        triggerText="Delete"
                        triggerClassName="btn btn-sm btn-danger"
                        onConfirm={() => handleDelete(model.modelId)}
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
