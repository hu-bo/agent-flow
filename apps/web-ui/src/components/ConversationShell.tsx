import type { ChangeEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { RunnerRecord } from '../api';
import type { NoticeState } from '../pages/chat-page-utils';

interface ConversationShellProps {
  page: string;
  title: string;
  runners: RunnerRecord[];
  runnerOnlineCount: number;
  selectedRunnerId: string;
  runnerSwitchDisabled: boolean;
  notice: NoticeState;
  onRunnerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}

export function ConversationShell({
  page,
  title,
  runners,
  runnerOnlineCount,
  selectedRunnerId,
  runnerSwitchDisabled,
  notice,
  onRunnerChange,
  children,
}: ConversationShellProps) {
  return (
    <>
      <header className="workspace-header">
        <div className="workspace-header-left">
          <span className="workspace-path">Pages / {page}</span>
          <h1 className="workspace-title">{title}</h1>
        </div>
        <div className="workspace-header-right">
          <select
            className="workspace-runner-select"
            value={selectedRunnerId}
            onChange={onRunnerChange}
            disabled={runnerSwitchDisabled}
            aria-label="Runner selection"
          >
            {runners.length === 0 ? (
              <option value="">RUNNER_OFFLINE</option>
            ) : (
              runners.map((runner) => (
                <option key={runner.runnerId} value={runner.runnerId}>
                  {formatRunnerLabel(runner)}
                </option>
              ))
            )}
          </select>
        </div>
      </header>
      <section className="workspace-canvas">
        {runnerOnlineCount === 0 && (
          <div className="chat-runner-hint">
            No online runner is available. Go to <Link to="/runners">Runner page</Link> to start one.
          </div>
        )}
        {notice && <div className={`workspace-notice workspace-notice-${notice.kind}`}>{notice.message}</div>}
        {children}
      </section>
    </>
  );
}

function formatRunnerLabel(runner: RunnerRecord): string {
  const host = runner.hostName || runner.host || runner.hostIp;
  return host?.trim() ? `${host} (${runner.runnerId})` : runner.runnerId;
}
