import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import Logo from '../Logo';
import { NAV_ITEMS } from './navItems';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

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
            </NavLink>
          ))}
        </nav>

        <p className="sidebar__foot">Uplink v1.0 · © 2026 Isuri Aroma</p>
      </aside>
    </>
  );
}
