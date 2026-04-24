import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ForbiddenPage from './components/ForbiddenPage'
import PageLoading from './components/PageLoading'
import PageNotFound from './components/PageNotFound'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import { useAuth } from './context/AuthContext'
import CategoriesPage from './pages/admin/CategoriesPage'
import HelpersPage from './pages/admin/HelpersPage'
import ParentsPage from './pages/admin/ParentsPage'
import RequestDetailPage from './pages/RequestDetailPage'
import InProgressRequestsPage from './pages/helper/InProgressRequestsPage'
import MyAnnouncementsPage from './pages/helper/MyAnnouncementsPage'
import NewRequestsPage from './pages/helper/NewRequestsPage'
import ResolvedRequestsPage from './pages/helper/ResolvedRequestsPage'
import ChildrenPage from './pages/parent/ChildrenPage'
import ParentRequestsPage from './pages/parent/RequestsPage'
import SearchPage from './pages/parent/SearchPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

const roleHomeRoutes = {
  parent: '/parent/children',
  helper: '/helper/announcements',
  admin: '/admin/parents',
} as const

function HomePageRedirect() {
  const { role, isAuthReady } = useAuth()

  if (!isAuthReady) {
    return <PageLoading />
  }

  const target = role ? roleHomeRoutes[role] : '/forbidden'

  return <Navigate to={target} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<HomePageRedirect />} />

          <Route element={<RequireRole allowedRoles={['parent']}><Outlet /></RequireRole>}>
            <Route path="/parent/children" element={<ChildrenPage />} />
            <Route path="/parent/search" element={<SearchPage />} />
            <Route path="/parent/requests" element={<ParentRequestsPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['parent', 'helper']}><Outlet /></RequireRole>}>
            <Route path="/requests/:id" element={<RequestDetailPage />} />
          </Route>

          <Route element={<RequireRole allowedRoles={['helper']}><Outlet /></RequireRole>}>
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
          </Route>
        </Route>

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
