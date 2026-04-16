import type { ReactNode } from 'react'
import {
  FileTextOutlined,
  TagsOutlined,
  ProfileOutlined,
  SearchOutlined,
  SolutionOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { NavLink } from 'react-router-dom'
import type { Role, User } from '../context/AuthContext'
import avatar from '../assets/Avatar.png'
import logo from '../assets/Logo.png'
import './Sidebar.css'

type NavItem = {
  label: string
  to: string
  icon: ReactNode
}

type SidebarProps = {
  user: User | null
  role: Role | null
  onLogout: () => void
}

const navItemsByRole: Record<Role, NavItem[]> = {
  parent: [
    { label: 'Дети', to: '/parent/children', icon: <TeamOutlined /> },
    {
      label: 'Поиск помощника',
      to: '/parent/search',
      icon: <SearchOutlined />,
    },
    { label: 'Заявки', to: '/parent/requests', icon: <FileTextOutlined /> },
  ],
  helper: [
    { label: 'Мои объявления', to: '/helper/announcements', icon: <ProfileOutlined /> },
    { label: 'Заявки', to: '/helper/requests', icon: <FileTextOutlined /> },
    { label: 'Отзывы', to: '/helper/reviews', icon: <StarOutlined /> },
  ],
  admin: [
    { label: 'Родители', to: '/admin/parents', icon: <UserOutlined /> },
    { label: 'Помощники', to: '/admin/helpers', icon: <SolutionOutlined /> },
    { label: 'Категории', to: '/admin/categories', icon: <TagsOutlined /> },
    { label: 'Заявки', to: '/admin/requests', icon: <FileTextOutlined /> },
  ],
}

const roleLabels: Record<Role, string> = {
  parent: 'Родитель',
  helper: 'Помощник',
  admin: 'Администратор',
}

function Sidebar({ user, role, onLogout }: SidebarProps) {
  const items = role ? navItemsByRole[role] ?? [] : []
  const displayName = user?.name ?? 'Гость'
  const roleLabel = role ? roleLabels[role] : 'Без роли'

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden="true">
          <img src={logo} alt="Ежовые руки" className="sidebar__logo-image" />
        </div>
        <div className="sidebar__title">
          Ежовые руки
          <span className="sidebar__subtitle">Помогаем бережно</span>
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
            <span className="sidebar__link-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sidebar__link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__profile">
        <div className="sidebar__user">
          <div className="sidebar__avatar" aria-hidden="true">
            <img src={avatar} alt="" className="sidebar__avatar-image" />
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
