import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ApiRequestError } from '../../api/http'
import logo from '../../assets/Logo.png'
import './LoginPage.css'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

        <div className="login-card__subtitle">Регистрация</div>

        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault()
            setValidationError(null)

            if (password !== confirmPassword) {
              setValidationError('Пароли не совпадают')
              return
            }

            setIsSubmitting(true)
            try {
              await register(email, password, name)
              navigate('/')
            } catch (err) {
              if (err instanceof ApiRequestError && err.status === 400) {
                setValidationError(err.message)
              } else {
                alert(err instanceof Error ? err.message : 'Ошибка регистрации')
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
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Введите имя"
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
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Подтвердите пароль"
            />
          </label>
          {validationError && <div className="login-error">{validationError}</div>}
          <button type="submit" className="login-button" disabled={isSubmitting}>
            Зарегистрироваться
          </button>
        </form>

        <Link to="/login" className="login-register">
          Уже есть аккаунт? Войти
        </Link>
      </div>
    </div>
  )
}

export default RegisterPage
