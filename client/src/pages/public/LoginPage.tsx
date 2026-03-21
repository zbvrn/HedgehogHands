import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../context/AuthContext'
import './LoginPage.css'

type FieldErrors = Record<string, string[]>

type FormValues = {
  email: string
  password: string
}

const ROLE_REDIRECTS: Record<Role, string> = {
  Parent: '/tickets',
  Helper: '/queue/new',
  Admin: '/admin/categories',
}

function normalizeErrors(errors?: FieldErrors) {
  if (!errors) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key.toLowerCase(), value]),
  )
}

function LoginPage() {
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<FormValues>({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(ROLE_REDIRECTS[role], { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleChange = (field: keyof FormValues, value: string) => {
    const errorKey = field.toLowerCase()
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[errorKey]
        return next
      })
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await login(formValues.email, formValues.password)
    } catch (err) {
      if (err instanceof ApiError) {
        const normalized = normalizeErrors(err.fieldErrors)
        setFieldErrors(normalized)
        if (Object.keys(normalized).length === 0) {
          setFormError(err.message)
        } else {
          setFormError('Проверьте поля формы.')
        }
      } else {
        setFormError('Ошибка сети. Попробуйте еще раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailError = fieldErrors.email?.[0]
  const passwordError = fieldErrors.password?.[0]

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-image" aria-hidden="true">
            <span>Р›РѕРіРѕ</span>
          </div>
        </div>

        <div className="login-card__heading">
          <h1>Р•Р¶РѕРІС‹Рµ СЂСѓРєРё</h1>
        </div>

        <div className="login-card__subtitle">Р’С…РѕРґ РІ СЃРёСЃС‚РµРјСѓ</div>

        {formError && <div className="login-error">{formError}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="Р’РІРµРґРёС‚Рµ email"
              className={emailError ? 'login-input login-input--error' : 'login-input'}
            />
            {emailError && <span className="login-field__error">{emailError}</span>}
          </label>
          <label className="login-field">
            <input
              type="password"
              value={formValues.password}
              onChange={(event) => handleChange('password', event.target.value)}
              placeholder="Р’РІРµРґРёС‚Рµ РїР°СЂРѕР»СЊ"
              className={
                passwordError ? 'login-input login-input--error' : 'login-input'
              }
            />
            {passwordError && <span className="login-field__error">{passwordError}</span>}
          </label>
          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Р’С…РѕРґ...' : 'Р’РѕР№С‚Рё'}
          </button>
        </form>

        <Link to="/register" className="login-register">
          Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ
        </Link>
      </div>
    </div>
  )
}

export default LoginPage

