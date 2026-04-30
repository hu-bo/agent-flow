import { useSyncExternalStore } from 'react';
import { useCasdoor } from '@hquant/casdoor/client/react';
import { Dashboard } from './pages/Dashboard';
import { Models } from './pages/Models';
import { Providers } from './pages/Providers';
import { Sessions } from './pages/Sessions';
import { Tasks } from './pages/Tasks';
import { ConsoleAuthCallbackPage, ConsoleAuthGate } from './auth';

function getHash(): string {
  return window.location.hash || '#/';
}

function subscribeHash(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function useHash(): string {
  return useSyncExternalStore(subscribeHash, getHash);
}

const NAV_ITEMS = [
  { hash: '#/', label: 'Dashboard' },
  { hash: '#/providers', label: 'Provider' },
  { hash: '#/models', label: 'Model' },
  { hash: '#/sessions', label: 'Sessions' },
  { hash: '#/tasks', label: 'Tasks' },
] as const;

function PageContent({ hash }: { hash: string }) {
  switch (hash) {
    case '#/providers':
      return <Providers />;
    case '#/models':
      return <Models />;
    case '#/sessions':
      return <Sessions />;
    case '#/tasks':
      return <Tasks />;
    default:
      return <Dashboard />;
  }
}

function ConsoleLayout() {
  const hash = useHash();
  const { user, logout } = useCasdoor();

  return (
    <div className="layout">
      <nav className="sidebar" role="navigation" aria-label="Main navigation">
        <div className="sidebar-title">Agent Flow</div>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.hash}>
              <a
                href={item.hash}
                className={hash === item.hash ? 'active' : ''}
                aria-current={hash === item.hash ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-userbar">
          <span className="sidebar-user-name">{user?.displayName || user?.name || 'Unknown User'}</span>
          <button className="btn btn-sm btn-ghost" onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="content">
        <PageContent hash={hash} />
      </main>
    </div>
  );
}

export function App() {
  if (window.location.pathname === '/callback') {
    return <ConsoleAuthCallbackPage />;
  }

  return (
    <ConsoleAuthGate>
      <ConsoleLayout />
    </ConsoleAuthGate>
  );
}
