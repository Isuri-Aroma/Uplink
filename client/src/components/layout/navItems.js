import { Cable, LayoutDashboard, LifeBuoy, Package, ShieldCheck, Users } from 'lucide-react';

// Sidebar menu (adminOnly hidden from agents)
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customer Accounts', icon: Users },
  { to: '/plans', label: 'Product Catalogue', icon: Package },
  { to: '/subscriptions', label: 'Subscriptions', icon: Cable },
  { to: '/tickets', label: 'Trouble Tickets', icon: LifeBuoy },
  { to: '/staff', label: 'Access Control', icon: ShieldCheck, adminOnly: true },
];
