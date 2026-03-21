import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ForbiddenPage from './components/ForbiddenPage'
import PageNotFound from './components/PageNotFound'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import TicketsListPage from './pages/parent/TicketsListPage'
import CreateTicketPage from './pages/parent/CreateTicketPage'
import TicketDetailPage from './pages/TicketDetailPage'
import QueueNewPage from './pages/helper/QueueNewPage'
import QueueAssignedPage from './pages/helper/QueueAssignedPage'
import QueueResolvedPage from './pages/helper/QueueResolvedPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import PlaceholderPage from './pages/PlaceholderPage'

function HomePage() {
  return <div style={{ padding: 24 }} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<HomePage />} />

          <Route element={<RequireRole allowedRoles={['Parent']}><Outlet /></RequireRole>}>
            <Route
              path="/parent/family"
              element={<PlaceholderPage />}
            />
            <Route
              path="/parent/helper-search"
              element={<PlaceholderPage />}
            />
            <Route
              path="/parent/search-history"
              element={<PlaceholderPage />}
            />
            <Route
              path="/parent/favorites"
              element={<PlaceholderPage />}
            />
            <Route
              path="/parent/requests"
              element={<PlaceholderPage />}
            />
            <Route path="/tickets" element={<TicketsListPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['Parent', 'Helper']}><Outlet /></RequireRole>}>
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['Helper']}><Outlet /></RequireRole>}>
            <Route
              path="/helper/profile"
              element={<PlaceholderPage />}
            />
            <Route
              path="/helper/offers"
              element={<PlaceholderPage />}
            />
            <Route
              path="/helper/ads"
              element={<PlaceholderPage />}
            />
            <Route
              path="/helper/requests"
              element={<PlaceholderPage />}
            />
            <Route
              path="/helper/stats"
              element={<PlaceholderPage />}
            />
            <Route path="/queue/new" element={<QueueNewPage />} />
            <Route path="/queue/assigned" element={<QueueAssignedPage />} />
            <Route path="/queue/resolved" element={<QueueResolvedPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['Admin']}><Outlet /></RequireRole>}>
            <Route
              path="/admin/documents"
              element={<PlaceholderPage />}
            />
            <Route
              path="/admin/specialists"
              element={<PlaceholderPage />}
            />
            <Route
              path="/admin/parents"
              element={<PlaceholderPage />}
            />
            <Route
              path="/admin/requests"
              element={<PlaceholderPage />}
            />
            <Route
              path="/admin/analytics"
              element={<PlaceholderPage />}
            />
            <Route
              path="/admin/promotion"
              element={<PlaceholderPage />}
            />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
