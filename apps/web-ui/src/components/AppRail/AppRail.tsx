import { NavLink } from 'react-router-dom';
import './AppRail.less';

const RAIL_ITEMS = [
  { to: '/chat', label: 'CHAT', ariaLabel: 'Chat workspace' },
  { to: '/runners', label: 'RUNNER', ariaLabel: 'Runner workspace' },
  { to: '/agent', label: 'AGENT', ariaLabel: 'Agent workspace' },
  { to: '/flow', label: 'FLOW', ariaLabel: 'Flow workspace' },
] as const;

export function AppRail() {
  return (
    <aside className="app-rail">
      <div className="app-logo" aria-hidden>
        AF
      </div>

      <nav className="app-rail-items" aria-label="Workspace navigation">
        {RAIL_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `rail-btn${isActive ? ' is-active' : ''}`}
            aria-label={item.ariaLabel}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
