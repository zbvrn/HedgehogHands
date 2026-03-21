import { NavLink } from 'react-router-dom'
import type { Role, User } from '../context/AuthContext'
import './Sidebar.css'

type NavItem = {
  label: string
  to: string
}

type SidebarProps = {
  user: User | null
  role: Role | null
  onLogout: () => void
}

const navItemsByRole: Record<Role, NavItem[]> = {
  parent: [
    { label: 'Моя семья', to: '/parent/family' },
    { label: 'Поиск помощника', to: '/parent/helper-search' },
    { label: 'История поиска', to: '/parent/search-history' },
    { label: 'Избранное', to: '/parent/favorites' },
    { label: 'Заявки', to: '/parent/requests' },
  ],
  helper: [
    { label: 'Мой профиль', to: '/helper/profile' },
    { label: 'Мои предложения', to: '/helper/offers' },
    { label: 'Мои объявления', to: '/helper/ads' },
    { label: 'Заявки', to: '/helper/requests' },
    { label: 'Статистика', to: '/helper/stats' },
  ],
  admin: [
    { label: 'Специалисты', to: '/admin/specialists' },
    { label: 'Родители', to: '/admin/parents' },
    { label: 'Заявки', to: '/admin/requests' },
    { label: 'Аналитика', to: '/admin/analytics' },
    { label: 'Продвижение', to: '/admin/promotion' },
  ],
}

const roleLabels: Record<Role, string> = {
  parent: 'родитель',
  helper: 'помощник',
  admin: 'администратор',
}

function getInitials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function Sidebar({ user, role, onLogout }: SidebarProps) {
  const items = role ? navItemsByRole[role] ?? [] : []
  const displayName = user?.name ?? 'Гость'
  const roleLabel = role ? roleLabels[role] : 'без роли'

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden="true">
          HH
        </div>
        <div className="sidebar__title">
          Hedgehog Hands
          <span className="sidebar__subtitle">care platform</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Основная навигация">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            <span className="sidebar__link-icon" aria-hidden="true" />
            <span className="sidebar__link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__profile">
        <div className="sidebar__user">
          <div className="sidebar__avatar" aria-hidden="true">
            {getInitials(displayName)}
          </div>
          <div>
            <div className="sidebar__name">{displayName}</div>
            <div className="sidebar__role">{roleLabel}</div>
          </div>
        </div>
        <button type="button" className="sidebar__logout" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
