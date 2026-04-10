import { useSyncExternalStore } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Sessions } from './pages/Sessions';
import { Tasks } from './pages/Tasks';

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
  { hash: '#/sessions', label: 'Sessions' },
  { hash: '#/tasks', label: 'Tasks' },
] as const;

function PageContent({ hash }: { hash: string }) {
  switch (hash) {
    case '#/sessions':
      return <Sessions />;
    case '#/tasks':
      return <Tasks />;
    default:
      return <Dashboard />;
  }
}

export function App() {
  const hash = useHash();

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
      </nav>
      <main className="content">
        <PageContent hash={hash} />
      </main>
    </div>
  );
}
