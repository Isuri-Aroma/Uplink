import { Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireAuth } from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import NotFoundPage from './pages/NotFoundPage';
import PlansPage from './features/plans/PlansPage';
import CustomersPage from './features/customers/CustomersPage';
import CustomerDetailsPage from './features/customers/CustomerDetailsPage';
import SubscriptionsPage from './features/subscriptions/SubscriptionsPage';
import SubscriptionDetailsPage from './features/subscriptions/SubscriptionDetailsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Signed-in pages */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="subscriptions/:id" element={<SubscriptionDetailsPage />} />
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
