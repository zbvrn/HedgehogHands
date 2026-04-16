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
import RequestDetailPage from './pages/RequestDetailPage'
import QueueNewPage from './pages/helper/QueueNewPage'
import QueueAssignedPage from './pages/helper/QueueAssignedPage'
import QueueResolvedPage from './pages/helper/QueueResolvedPage'
import ChildrenPage from './pages/parent/ChildrenPage'
import HelperReviewsPage from './pages/helper/HelperReviewsPage'
import MyAnnouncementsPage from './pages/helper/MyAnnouncementsPage'
import HelperRequestsPage from './pages/helper/RequestsPage'
import ParentRequestsPage from './pages/parent/RequestsPage'
import SearchPage from './pages/parent/SearchPage'
import HelpersPage from './pages/admin/HelpersPage'
import ParentsPage from './pages/admin/ParentsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
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

          <Route element={<RequireRole allowedRoles={['parent']}><Outlet /></RequireRole>}>
            <Route
              path="/parent/children"
              element={<ChildrenPage />}
            />
            <Route
              path="/parent/search"
              element={<SearchPage />}
            />
            <Route
              path="/parent/requests"
              element={<ParentRequestsPage />}
            />
            <Route path="/tickets" element={<TicketsListPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['parent', 'helper']}><Outlet /></RequireRole>}>
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['helper']}><Outlet /></RequireRole>}>
            <Route
              path="/helper/reviews"
              element={<HelperReviewsPage />}
            />
            <Route
              path="/helper/announcements"
              element={<MyAnnouncementsPage />}
            />
            <Route
              path="/helper/requests"
              element={<HelperRequestsPage />}
            />
            <Route path="/queue/new" element={<QueueNewPage />} />
            <Route path="/queue/assigned" element={<QueueAssignedPage />} />
            <Route path="/queue/resolved" element={<QueueResolvedPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['admin']}><Outlet /></RequireRole>}>
            <Route
              path="/admin/helpers"
              element={<HelpersPage />}
            />
            <Route
              path="/admin/parents"
              element={<ParentsPage />}
            />
            <Route
              path="/admin/categories"
              element={<CategoriesPage />}
            />
            <Route
              path="/admin/requests"
              element={<PlaceholderPage />}
            />
          </Route>
        </Route>

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
