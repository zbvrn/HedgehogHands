import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketsPage from './pages/student/TicketsPage';
import NewTicketPage from './pages/student/NewTicketPage';
import QueueNewPage from './pages/operator/QueueNewPage';
import QueueAssignedPage from './pages/operator/QueueAssignedPage';
import QueueResolvedPage from './pages/operator/QueueResolvedPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import UsersPage from './pages/admin/UsersPage';
import PageNotFound from './components/PageNotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private routes — wrapped by RequireAuth, rendered inside AppLayout */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          {/* Student */}
          <Route
            path="/tickets"
            element={
              <RequireRole roles={['Student']}>
                <TicketsPage />
              </RequireRole>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <RequireRole roles={['Student']}>
                <NewTicketPage />
              </RequireRole>
            }
          />

          {/* Shared: ticket detail for Student and Operator */}
          <Route
            path="/tickets/:id"
            element={
              <RequireRole roles={['Student', 'Operator']}>
                <TicketDetailPage />
              </RequireRole>
            }
          />

          {/* Operator */}
          <Route
            path="/queue/new"
            element={
              <RequireRole roles={['Operator']}>
                <QueueNewPage />
              </RequireRole>
            }
          />
          <Route
            path="/queue/assigned"
            element={
              <RequireRole roles={['Operator']}>
                <QueueAssignedPage />
              </RequireRole>
            }
          />
          <Route
            path="/queue/resolved"
            element={
              <RequireRole roles={['Operator']}>
                <QueueResolvedPage />
              </RequireRole>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/categories"
            element={
              <RequireRole roles={['Admin']}>
                <CategoriesPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireRole roles={['Admin']}>
                <UsersPage />
              </RequireRole>
            }
          />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/tickets" replace />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
