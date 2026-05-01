import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchRunnerDownloads,
  fetchRunners,
  issueRunnerToken,
  rotateRunnerToken,
  type RunnerRecord,
  type RunnerTokenIssueResult,
} from '../api';
import './pages.less';

type RunnerInstallState = 'NOT_INSTALLED' | 'OFFLINE' | 'CONNECTING' | 'ONLINE';
type NoticeState = { kind: 'success' | 'error'; message: string } | null;
const RUNNER_TOKEN_STORAGE_KEY = 'af_webui_runner_token_issue';

function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function deriveState(runners: RunnerRecord[], connecting: boolean): RunnerInstallState {
  const onlineCount = runners.filter((runner) => runner.status === 'online').length;
  if (onlineCount > 0) return 'ONLINE';
  if (connecting) return 'CONNECTING';
  if (runners.length > 0) return 'OFFLINE';
  return 'NOT_INSTALLED';
}

function loadStoredTokenIssue(): RunnerTokenIssueResult | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(RUNNER_TOKEN_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as RunnerTokenIssueResult;
    if (!parsed?.runnerToken || !parsed?.grpcServerAddr || !parsed?.downloadUrls) {
      window.localStorage.removeItem(RUNNER_TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(RUNNER_TOKEN_STORAGE_KEY);
    return null;
  }
}

function persistTokenIssue(tokenIssue: RunnerTokenIssueResult): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RUNNER_TOKEN_STORAGE_KEY, JSON.stringify(tokenIssue));
}

function buildStartCommands(token: RunnerTokenIssueResult | null): {
  macosLinuxGrpc: string;
  windowsGrpc: string;
} {
  if (!token) {
    return {
      macosLinuxGrpc: './runner start --rpc_host 127.0.0.1:9201 --rpc_token <runner_token>',
      windowsGrpc: '.\\runner.exe start --rpc_host 127.0.0.1:9201 --rpc_token <runner_token>',
    };
  }

  return {
    macosLinuxGrpc: `./runner start --rpc_host ${token.grpcServerAddr} --rpc_token ${token.runnerToken}`,
    windowsGrpc: `.\\runner.exe start --rpc_host ${token.grpcServerAddr} --rpc_token ${token.runnerToken}`,
  };
}

export function RunnerPage() {
  const [runners, setRunners] = useState<RunnerRecord[]>([]);
  const [downloads, setDownloads] = useState<RunnerTokenIssueResult['downloadUrls'] | null>(null);
  const [tokenIssue, setTokenIssue] = useState<RunnerTokenIssueResult | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  const refreshRunners = useCallback(async () => {
    const payload = await fetchRunners();
    const next = payload.runners ?? [];
    setRunners(next);
    if (next.some((runner) => runner.status === 'online')) {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [runnerPayload, downloadPayload] = await Promise.all([fetchRunners(), fetchRunnerDownloads()]);
        setRunners(runnerPayload.runners ?? []);
        setDownloads(downloadPayload.downloadUrls);
        const storedTokenIssue = loadStoredTokenIssue();
        if (storedTokenIssue) {
          setTokenIssue(storedTokenIssue);
          setDownloads(storedTokenIssue.downloadUrls);
          return;
        }

        const issued = await issueRunnerToken();
        persistTokenIssue(issued);
        setTokenIssue(issued);
        setDownloads(issued.downloadUrls);
        setIsConnecting(true);
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to load runner info'),
        });
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isConnecting) return;
    const timer = window.setInterval(() => {
      void refreshRunners().catch(() => {
        // keep polling while connecting
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, [isConnecting, refreshRunners]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const state = deriveState(runners, isConnecting);
  const onlineCount = runners.filter((runner) => runner.status === 'online').length;
  const commands = buildStartCommands(tokenIssue);
  const resolvedDownloads = tokenIssue?.downloadUrls ?? downloads;

  const statusText = useMemo(() => {
    if (state === 'ONLINE') return `Runner online (${onlineCount})`;
    if (state === 'CONNECTING') return 'Waiting for runner connection...';
    if (state === 'OFFLINE') return 'Runner registered but currently offline';
    return 'No runner detected. Download and run it with the command below.';
  }, [onlineCount, state]);

  const handleGenerate = useCallback(async (rotate = false) => {
    setIsCreatingToken(true);
    try {
      const issued = rotate ? await rotateRunnerToken() : await issueRunnerToken();
      persistTokenIssue(issued);
      setTokenIssue(issued);
      setDownloads(issued.downloadUrls);
      setIsConnecting(true);
      await refreshRunners();
      setNotice({
        kind: 'success',
        message: rotate ? 'Runner token rotated.' : 'Runner token created.',
      });
    } catch (error: unknown) {
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to generate runner token'),
      });
    } finally {
      setIsCreatingToken(false);
    }
  }, [refreshRunners]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshRunners();
      setNotice({
        kind: 'success',
        message: 'Runner status refreshed.',
      });
    } catch (error: unknown) {
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to refresh runners'),
      });
    }
  }, [refreshRunners]);

  return (
    <>
      <header className="workspace-header">
        <div className="workspace-header-left">
          <span className="workspace-path">Pages / Runner</span>
          <h1 className="workspace-title">RUNNER_CONTROL_PLANE</h1>
        </div>
        <div className="workspace-header-right">
          <span className="workspace-status">{state}</span>
        </div>
      </header>

      <section className="workspace-canvas">
        {notice && <div className={`workspace-notice workspace-notice-${notice.kind}`}>{notice.message}</div>}

        <div className="runner-panel">
          <div className="runner-hero">
            <h2 className="runner-title">{statusText}</h2>
            <p className="runner-subtitle">
              Local runner is isolated by user identity, and only your online runner can execute your session tasks.
            </p>
          </div>

          <div className="runner-actions">
            <a
              className="workspace-action-btn runner-action-link"
              href={resolvedDownloads?.windows ?? '#'}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!resolvedDownloads}
            >
              Download Runner
            </a>
            <button className="workspace-action-btn" onClick={() => void handleGenerate(false)} disabled={isCreatingToken}>
              Generate Start Command
            </button>
            <button className="workspace-action-btn" onClick={() => void handleGenerate(true)} disabled={isCreatingToken}>
              Rotate Token
            </button>
            <button className="workspace-action-btn" onClick={() => void handleRefresh()} disabled={isLoading}>
              Refresh Status
            </button>
          </div>

          <div className="runner-commands">
            <div className="runner-command-block">
              <h3>macOS / Linux</h3>
              <pre>{commands.macosLinuxGrpc}</pre>
            </div>
            <div className="runner-command-block">
              <h3>Windows PowerShell</h3>
              <pre>{commands.windowsGrpc}</pre>
            </div>
          </div>

          <div className="runner-token-tip">
            Token tip: rotate token if compromised. After rotation, previous token is revoked immediately.
          </div>

          <div className="runner-list">
            <h3>Runner List</h3>
            {runners.length === 0 ? (
              <div className="runner-list-empty">No runner records yet.</div>
            ) : (
              runners.map((runner) => (
                <div className="runner-item" key={runner.runnerId}>
                  <div className="runner-item-main">
                    <span className="runner-id">{runner.runnerId}</span>
                    <span className={`runner-pill runner-pill-${runner.status}`}>{runner.status}</span>
                  </div>
                  <div className="runner-item-meta">
                    <span>kind={runner.kind}</span>
                    <span>host={runner.host ?? '-'}</span>
                    <span>hostname={runner.hostName ?? '-'}</span>
                    <span>ip={runner.hostIp ?? '-'}</span>
                    <span>version={runner.version ?? '-'}</span>
                    <span>lastSeen={runner.lastSeenAt ?? '-'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
