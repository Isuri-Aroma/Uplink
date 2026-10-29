import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function Topbar({ title, onMenu }) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
      <button className="rounded-lg p-2 text-muted hover:bg-primary-soft lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <h1 className="truncate text-lg font-bold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden items-center gap-2.5 border-l border-line pl-3 sm:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {initials(user?.name)}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs capitalize text-muted">{user?.role}</p>
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
