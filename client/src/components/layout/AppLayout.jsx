import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-content">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
