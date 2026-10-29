import { useAuth } from '../context/AuthContext';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// Placeholder for now
export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold">{greeting()}, {user?.name.split(' ')[0]}</h2>
      <p className="mt-1 text-sm text-muted">The network overview will appear here.</p>
    </div>
  );
}
