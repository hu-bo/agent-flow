import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteRunner,
  downloadRunnerPackage,
  fetchRunners,
  fetchRunnerApprovalGrants,
  formatDeleteRunnerError,
  issueRunnerToken,
  rotateRunnerToken,
  revokeRunnerApprovalGrant,
  streamRunners,
  type RunnerRecord,
  type RunnerDownloadPlatform,
  type RunnerTokenIssueResult,
  type RunnerApprovalGrant,
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

function detectRunnerDownloadPlatform(): RunnerDownloadPlatform {
  if (typeof navigator === 'undefined') {
    return 'linux-amd64';
  }

  const navigatorWithPlatformData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = [
    navigatorWithPlatformData.userAgentData?.platform,
    navigator.platform,
    navigator.userAgent,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (platform.includes('win')) {
    return 'windows-amd64';
  }
  if (
    platform.includes('mac')
    || platform.includes('darwin')
    || platform.includes('iphone')
    || platform.includes('ipad')
  ) {
    return 'darwin-amd64';
  }
  return 'linux-amd64';
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
  const [tokenIssue, setTokenIssue] = useState<RunnerTokenIssueResult | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deletingRunnerId, setDeletingRunnerId] = useState<string | null>(null);
  const [approvalGrants, setApprovalGrants] = useState<RunnerApprovalGrant[]>([]);
  const [revokingGrantId, setRevokingGrantId] = useState<string | null>(null);

  const refreshRunners = useCallback(async () => {
    const payload = await fetchRunners();
    const next = payload.runners ?? [];
    setRunners(next);
    if (next.some((runner) => runner.status === 'online')) {
      setIsConnecting(false);
    }
  }, []);

  const refreshApprovalGrants = useCallback(async () => {
    const payload = await fetchRunnerApprovalGrants();
    setApprovalGrants(payload.grants ?? []);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        void refreshApprovalGrants().catch(() => undefined);
        const runnerPayload = await fetchRunners();
        setRunners(runnerPayload.runners ?? []);
        const storedTokenIssue = loadStoredTokenIssue();
        if (storedTokenIssue) {
          setTokenIssue(storedTokenIssue);
          return;
        }

        const issued = await issueRunnerToken();
        persistTokenIssue(issued);
        setTokenIssue(issued);
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
  }, [refreshApprovalGrants]);

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
          if (cancelled) return;
          setRunners(next);
          if (next.some((runner) => runner.status === 'online')) {
            setIsConnecting(false);
          }
        },
      })
        .catch((error: unknown) => {
          if (cancelled) return;
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
        })
        .finally(() => {
          if (cancelled) return;
          retryTimer = window.setTimeout(connect, 1500);
        });
    };

    connect();

    return () => {
      cancelled = true;
      controller?.abort();
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const state = deriveState(runners, isConnecting);
  const onlineCount = runners.filter((runner) => runner.status === 'online').length;
  const commands = buildStartCommands(tokenIssue);

  const statusText = useMemo(() => {
    if (state === 'ONLINE') return `Runner online (${onlineCount})`;
    if (state === 'CONNECTING') return 'Waiting for runner connection...';
    if (state === 'OFFLINE') return 'Runner registered but currently offline';
    return 'No runner detected. Download and run it with the command below.';
  }, [onlineCount, state]);



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

  const handleDownloadRunner = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadRunnerPackage(detectRunnerDownloadPlatform());
      setNotice({
        kind: 'success',
        message: 'Runner package download started.',
      });
    } catch (error: unknown) {
      setNotice({
        kind: 'error',
        message: readErrorMessage(error, 'Failed to download runner package'),
      });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleDeleteRunner = useCallback(async (runnerId: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Delete runner record ${runnerId}?`);
      if (!confirmed) return;
    }

    setDeletingRunnerId(runnerId);
    try {
      await deleteRunner(runnerId);
      setRunners((previous) => previous.filter((runner) => runner.runnerId !== runnerId));
      setNotice({
        kind: 'success',
        message: `Runner ${runnerId} deleted.`,
      });
      await refreshRunners();
    } catch (error: unknown) {
      const runnerDeleteMessage = formatDeleteRunnerError(error);
      setNotice({
        kind: 'error',
        message: runnerDeleteMessage ?? readErrorMessage(error, 'Failed to delete runner'),
      });
    } finally {
      setDeletingRunnerId(null);
    }
  }, [refreshRunners]);

  const handleRevokeGrant = useCallback(async (grantId: string) => {
    setRevokingGrantId(grantId);
    try {
      await revokeRunnerApprovalGrant(grantId);
      setApprovalGrants((previous) => previous.filter((grant) => grant.grantId !== grantId));
      setNotice({ kind: 'success', message: 'Remembered Runner permission revoked.' });
    } catch (error: unknown) {
      setNotice({ kind: 'error', message: readErrorMessage(error, 'Failed to revoke Runner permission') });
    } finally {
      setRevokingGrantId(null);
    }
  }, []);

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
            <button
              className="workspace-action-btn runner-action-link"
              type="button"
              onClick={() => void handleDownloadRunner()}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download Runner'}
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
                    <div className="runner-item-actions">
                      <span className={`runner-pill runner-pill-${runner.status}`}>{runner.status}</span>
                      <button
                        className="workspace-action-btn runner-delete-btn"
                        type="button"
                        onClick={() => void handleDeleteRunner(runner.runnerId)}
                        disabled={deletingRunnerId === runner.runnerId}
                      >
                        {deletingRunnerId === runner.runnerId ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
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

          <div className="runner-list">
            <h3>Remembered Approvals</h3>
            {approvalGrants.length === 0 ? (
              <div className="runner-list-empty">No persistent Runner approvals.</div>
            ) : (
              approvalGrants.map((grant) => (
                <div className="runner-item" key={grant.grantId}>
                  <div className="runner-item-main">
                    <span className="runner-id">{grant.runnerId}</span>
                    <button
                      className="workspace-action-btn runner-delete-btn"
                      type="button"
                      onClick={() => void handleRevokeGrant(grant.grantId)}
                      disabled={revokingGrantId === grant.grantId}
                    >
                      {revokingGrantId === grant.grantId ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                  <div className="runner-item-meta">
                    <span>scope={grant.scopeType}:{grant.scopeLabel ?? grant.scopeId}</span>
                    <span>coverage={grant.coverage}</span>
                    <span>created={grant.createdAt}</span>
                    <span>lastUsed={grant.lastUsedAt ?? '-'}</span>
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
