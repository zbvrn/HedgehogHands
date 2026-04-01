import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ApiRequestError } from '../../api/http'
import logo from '../../assets/Logo.png'
import './LoginPage.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('parent@example.com')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-image" aria-hidden="true">
            <img src={logo} alt="Ежовые руки" className="login-card__logo-img" />
          </div>
        </div>

        <div className="login-card__heading">
          <h1>Ежовые руки</h1>
        </div>

        <div className="login-card__subtitle">Вход в систему</div>

        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault()
            setValidationError(null)
            setIsSubmitting(true)
            try {
              await login(email, password)
              navigate('/')
            } catch (err) {
              if (err instanceof ApiRequestError && err.status === 400) {
                setValidationError(err.message)
              } else {
                alert(err instanceof Error ? err.message : 'Ошибка входа')
              }
            } finally {
              setIsSubmitting(false)
            }
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
          {validationError && <div className="login-error">{validationError}</div>}
          <button type="submit" className="login-button" disabled={isSubmitting}>
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
