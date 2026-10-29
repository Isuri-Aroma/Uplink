import { Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireAuth } from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Signed-in pages */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="customers" element={<PlaceholderPage title="Customer Accounts" />} />
          <Route path="plans" element={<PlaceholderPage title="Product Catalogue" />} />
          <Route path="subscriptions" element={<PlaceholderPage title="Subscriptions" />} />
          <Route path="tickets" element={<PlaceholderPage title="Trouble Tickets" />} />
          <Route element={<RequireAdmin />}>
            <Route path="staff" element={<PlaceholderPage title="Access Control" />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
