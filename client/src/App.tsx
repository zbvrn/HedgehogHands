import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ForbiddenPage from './components/ForbiddenPage'
import PageNotFound from './components/PageNotFound'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import HelpersPage from './pages/admin/HelpersPage'
import ParentsPage from './pages/admin/ParentsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import PlaceholderPage from './pages/PlaceholderPage'
import NewRequestsPage from './pages/helper/NewRequestsPage'
import InProgressRequestsPage from './pages/helper/InProgressRequestsPage'
import ResolvedRequestsPage from './pages/helper/ResolvedRequestsPage'
import HelperReviewsPage from './pages/helper/HelperReviewsPage'
import MyAnnouncementsPage from './pages/helper/MyAnnouncementsPage'
import RequestDetailPage from './pages/RequestDetailPage'
import CreateTicketPage from './pages/parent/CreateTicketPage'
import TicketsListPage from './pages/parent/TicketsListPage'
import ChildrenPage from './pages/parent/ChildrenPage'
import ParentRequestsPage from './pages/parent/RequestsPage'
import SearchPage from './pages/parent/SearchPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import TicketDetailPage from './pages/TicketDetailPage'

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
            <Route path="/parent/children" element={<ChildrenPage />} />
            <Route path="/parent/search" element={<SearchPage />} />
            <Route path="/parent/requests" element={<ParentRequestsPage />} />
            <Route path="/tickets" element={<TicketsListPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['parent', 'helper']}><Outlet /></RequireRole>}>
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['helper']}><Outlet /></RequireRole>}>
            <Route path="/helper/reviews" element={<HelperReviewsPage />} />
            <Route path="/helper/announcements" element={<MyAnnouncementsPage />} />
            <Route path="/helper/requests" element={<Navigate to="/helper/requests/new" replace />} />
            <Route path="/helper/requests/new" element={<NewRequestsPage />} />
            <Route path="/helper/requests/in-progress" element={<InProgressRequestsPage />} />
            <Route path="/helper/requests/resolved" element={<ResolvedRequestsPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['admin']}><Outlet /></RequireRole>}>
            <Route path="/admin/helpers" element={<HelpersPage />} />
            <Route path="/admin/parents" element={<ParentsPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/requests" element={<PlaceholderPage />} />
          </Route>
        </Route>

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

