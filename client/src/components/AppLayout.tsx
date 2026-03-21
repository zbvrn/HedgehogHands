import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import './AppLayout.css'

function AppLayout() {
  const { user, role, logout } = useAuth()

  return (
    <div className="app-shell">
      <Sidebar user={user} role={role} onLogout={logout} />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
