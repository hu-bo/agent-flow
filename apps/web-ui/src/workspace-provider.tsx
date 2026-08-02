import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { ReasoningEffort } from '@agent-flow/chat-ui';
import { fetchModels, streamRunners, type RunnerRecord } from './api';
import { readErrorMessage, type ModelSelectOption, type NoticeState } from './pages/chat-page-utils';

const SELECTED_MODEL_STORAGE_KEY = 'agent-flow:selected-model-id';

interface WorkspaceResources {
  modelOptions: ModelSelectOption[];
  selectedModelId: number | null;
  selectModel: (modelId: number) => void;
  reasoningEffort: ReasoningEffort;
  setReasoningEffort: (value: ReasoningEffort) => void;
  runners: RunnerRecord[];
  onlineRunners: RunnerRecord[];
  selectedRunnerId: string;
  setSelectedRunnerId: (runnerId: string) => void;
  notice: NoticeState;
  setNotice: React.Dispatch<React.SetStateAction<NoticeState>>;
}

const WorkspaceResourcesContext = createContext<WorkspaceResources | null>(null);

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [modelOptions, setModelOptions] = useState<ModelSelectOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [runners, setRunners] = useState<RunnerRecord[]>([]);
  const [selectedRunnerId, setSelectedRunnerId] = useState('');
  const [notice, setNotice] = useState<NoticeState>(null);

  useEffect(() => {
    void fetchModels()
      .then((payload) => {
        const options = payload.models.map((model) => ({
          value: String(model.modelId),
          label: `${model.provider}-${model.displayName}`,
          maxInputTokens: model.maxInputTokens,
        }));
        setModelOptions(options);
        setSelectedModelId((current) => selectInitialModel(current, options, payload.currentModel));
      })
      .catch((error: unknown) => setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to load models'),
      }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | null = null;
    let controller: AbortController | null = null;
    const connect = () => {
      if (cancelled) return;
      controller = new AbortController();
      void streamRunners({
        signal: controller.signal,
        onRunners: (next) => {
          if (!cancelled) setRunners(next);
        },
      }).catch(() => undefined).finally(() => {
        if (!cancelled) retryTimer = window.setTimeout(connect, 1_500);
      });
    };
    connect();
    return () => {
      cancelled = true;
      controller?.abort();
      if (retryTimer !== null) window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3_600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const onlineRunners = useMemo(
    () => runners.filter((runner) => runner.status === 'online'),
    [runners],
  );

  useEffect(() => {
    setSelectedRunnerId((current) => current && onlineRunners.some((runner) => runner.runnerId === current)
      ? current
      : onlineRunners[0]?.runnerId ?? '');
  }, [onlineRunners]);

  const selectModel = useCallback((modelId: number) => {
    setSelectedModelId(modelId);
    try {
      window.localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, String(modelId));
    } catch {
      // Selection remains active for the current workspace session.
    }
  }, []);

  const value = useMemo<WorkspaceResources>(() => ({
    modelOptions,
    selectedModelId,
    selectModel,
    reasoningEffort,
    setReasoningEffort,
    runners,
    onlineRunners,
    selectedRunnerId,
    setSelectedRunnerId,
    notice,
    setNotice,
  }), [
    modelOptions,
    notice,
    onlineRunners,
    reasoningEffort,
    runners,
    selectModel,
    selectedModelId,
    selectedRunnerId,
  ]);

  return <WorkspaceResourcesContext.Provider value={value}>{children}</WorkspaceResourcesContext.Provider>;
}

export function useWorkspaceResources(): WorkspaceResources {
  const resources = useContext(WorkspaceResourcesContext);
  if (!resources) throw new Error('useWorkspaceResources must be used inside WorkspaceProvider');
  return resources;
}

function selectInitialModel(
  current: number | null,
  options: ModelSelectOption[],
  serverDefault: number,
): number | null {
  if (current !== null && options.some((option) => Number(option.value) === current)) return current;
  const cached = readStoredModelId();
  if (cached !== null && options.some((option) => Number(option.value) === cached)) return cached;
  if (options.some((option) => Number(option.value) === serverDefault)) return serverDefault;
  return options[0] ? Number(options[0].value) : null;
}

function readStoredModelId(): number | null {
  try {
    const value = Number(window.localStorage.getItem(SELECTED_MODEL_STORAGE_KEY));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}
