import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h2 className="mt-2 text-xl font-bold">Page not found</h2>
      <p className="mt-1 text-sm text-muted">The page you opened does not exist in Uplink.</p>
      <Link to="/" className="btn-primary mt-6">Back to dashboard</Link>
    </div>
  );
}
