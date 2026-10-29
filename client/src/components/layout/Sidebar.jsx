import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Logo from '../Logo';
import { NAV_ITEMS } from './navItems';
import { useAuth } from '../../context/AuthContext';
import { listAccessRequests } from '../../api/accessRequests';

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  const [pending, setPending] = useState(0);
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  // Pending access requests badge (admins only)
  useEffect(() => {
    if (!isAdmin) return;
    const check = () => listAccessRequests({ status: 'Pending' }).then((d) => setPending(d.counts.Pending || 0)).catch(() => {});
    check();
    window.addEventListener('uplink:requests-changed', check);
    return () => window.removeEventListener('uplink:requests-changed', check);
  }, [isAdmin, pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button className="rounded-lg p-2 text-muted hover:bg-primary-soft lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Main">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-primary-soft/60 hover:text-ink'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {to === '/staff' && pending > 0 && (
                <span className="rounded-full bg-bad px-2 font-mono text-xs text-white dark:text-bg" title={`${pending} access requests waiting`}>{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="px-5 py-4 text-xs text-muted">
          Uplink v1.0 · © 2026 Isuri Aroma
        </p>
      </aside>
    </>
  );
}
