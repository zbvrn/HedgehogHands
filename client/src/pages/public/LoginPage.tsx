import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { Role } from '../../contexts/AuthContext'
import './LoginPage.css'

const roles: Role[] = ['Parent', 'Helper', 'Admin']

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('alex@example.com')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('Parent')

  const displayName = useMemo(() => {
    const namePart = email.split('@')[0]?.trim()
    if (!namePart) {
      return 'Гость'
    }
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  }, [email])

  const userId = useMemo(() => {
    if (!email) {
      return 'u-guest'
    }
    return `u-${email.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  }, [email])

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-image" aria-hidden="true">
            <span>Лого</span>
          </div>
        </div>

        <div className="login-card__heading">
          <h1>Ежовые руки</h1>
        </div>

        <div className="login-card__subtitle">Вход в систему</div>

        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault()
            login('demo-token', { id: userId, displayName }, role)
            navigate('/')
          }}
        >
          <label className="login-field">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Введите email"
            />
          </label>
          <label className="login-field">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
            />
          </label>
          <label className="login-field">
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>

        <Link to="/register" className="login-register">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
