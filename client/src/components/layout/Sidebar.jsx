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
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__head">
          <Logo />
          <button className="menu-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Main">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className="nav-link">
              <Icon size={18} />
              <span className="nav-link__label">{label}</span>
              {to === '/staff' && pending > 0 && (
                <span className="count-pill" title={`${pending} access requests waiting`}>{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="sidebar__foot">Uplink v1.0 · © 2026 Isuri Aroma</p>
      </aside>
    </>
  );
}
