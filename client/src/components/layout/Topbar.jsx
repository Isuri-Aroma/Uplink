import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import Logo from '../Logo';

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function Topbar({ onMenu }) {
  const { user, signOut } = useAuth();

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <Logo className="topbar__logo" />

      <div className="topbar__actions">
        <ThemeToggle />
        <div className="topbar__user">
          <span className="avatar">{initials(user?.name)}</span>
          <div>
            <p className="topbar__name">{user?.name}</p>
            <p className="topbar__role">{user?.role}</p>
          </div>
        </div>
        <button onClick={signOut} className="btn-ghost px-3" title="Sign out">
          <LogOut size={16} />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
